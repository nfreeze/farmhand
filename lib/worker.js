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
    switch(msg.command){
        case 'start':
            workerArgs = cryo.parse(msg.args);

            if (!(util.isArray(workerArgs.args)))
                workerArgs.args = [workerArgs.args];

            if (workerArgs.scope)
                util._extend(context,workerArgs.scope);

            if (workerArgs.global)
                util._extend(global,workerArgs.global);

            if (workerArgs.requires){
                var req = workerArgs.requires;

                if (util.isArray(req)){
                    req.forEach(function(r){
                        global[r] = require(r);
                    });
                }else if (typeof req == 'object'){
                    Object.keys(req).forEach(function(k) {
                        global[k] = require(req[k]);
                    });
                }else if (typeof req == 'string'){
                    global[req] = require(req);
                }
            }

            try{
                workerArgs.fn.apply(context,workerArgs.args);
            }catch(ex){
                sendToParent('error', ex || 'worker function error');
            }

            break;
        case 'cancel':
            context.cancel = true;
            setTimeout(process.exit,
                       workerArgs.cancelTimeout || 3000);
    }

});






