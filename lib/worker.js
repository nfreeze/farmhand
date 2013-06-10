var cryo = require('cryo'),
    util = require('util');

var workerArgs;

var context = {
    require: require,
    cancel: false,
    progress: function(value){
        var s = cryo.stringify(value);
        process.send({command:'progress',state:s});
    },
    complete: function(result){
        var r = cryo.stringify(result);
        process.send({command:'complete',state:r});
        setTimeout(process.exit,workerArgs.killTimeout || 3000);
    }
};

process.on('message', function(msg) {
    console.log('message to child:',msg.command);
    switch(msg.command){
        case 'start':
            workerArgs = cryo.parse(msg.args);
            if (!(util.isArray(workerArgs.args))) workerArgs.args = [workerArgs.args];
            if (workerArgs.scope) util._extend(context,workerArgs.scope);
            console.log('starting worker with args:',
                         workerArgs.args,' and scope ',workerArgs.scope);
            try{
                workerArgs.fn.apply(context,workerArgs.args);
            }catch(ex){
                var sex = 'worker function error';
                if (ex) sex = cryo.stringify(ex);
                console.log('worker function error:',ex);
                process.send({command:'error',state:sex});
            }
            break;
        case 'cancel':
            console.log('cancel requested');
            context.cancel = true;
            setTimeout(process.exit,workerArgs.cancelTimeout || 3000);
    }


});






