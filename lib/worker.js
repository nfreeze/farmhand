var cryo = require('cryo'),
    util = require('util'),
    workerArgs;

function sendToParent(cmd,val){
    process.send({command:cmd,
                  state:cryo.stringify(val)});
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
                   workerArgs.completeTimeout || 3000);
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

            if (workerArgs.requires){
                var req = workerArgs.requires;

                if (util.isArray(req)){
                     req.forEach(function(r){
                         context[r] = require(r);
                     });
                }else if (typeof req == 'object'){
                    Object.keys(req).forEach(function(k) {
                        var v = req[k];
                        context[k] = require(v);
                    });
                }else if (typeof req == 'string'){
                    context[req] = require(req);
                }
            }

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
                       workerArgs.cancelTimeout || 3000);
    }

});






