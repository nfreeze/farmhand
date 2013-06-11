var cryo = require('cryo'),
    util = require('util'),
    workerArgs;

function sendToParent(cmd,ste){
    try{
        process.send({command:cmd,
            state:cryo.stringify(ste)});
    }catch(ex){
        console.log('error sending to parent:',ex);
    }
}

var context = {
    require: require,
    cancel: false,
    progress: function(value){
        sendToParent('progress',value);
    },
    complete: function(result){
        sendToParent('complete',result);
        setTimeout(process.exit,
                   workerArgs.killTimeout || 2000);
    }
};

process.on('message', function(msg) {
    console.log('message to child:',msg.command);
    switch(msg.command){
        case 'start':
            workerArgs = cryo.parse(msg.args);

            if (!(util.isArray(workerArgs.args)))
                workerArgs.args = [workerArgs.args];

            if (workerArgs.scope)
                util._extend(context,workerArgs.scope);

            try{
                workerArgs.fn.apply(context,workerArgs.args);
            }catch(ex){
                sendToParent('error',ex || 'worker function error');
            }
            break;
        case 'cancel':
            console.log('cancel requested');
            context.cancel = true;
            setTimeout(process.exit,
                       workerArgs.cancelTimeout || 2000);
    }

});






