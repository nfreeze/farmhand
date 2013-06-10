var cryo = require('cryo'),
    util = require('util');

var background = {
    require: require,
    cancel: false,
    progress: function(value){
        try{
            var s = cryo.stringify(value);
            process.send({command:'progress',state:s});
        }catch(ex){
            process.send({command:'error',state:ex});
        }
    }
};

process.on('message', function(msg) {
    console.log('message to child:',msg.command);
    switch(msg.command){
        case 'start':
            var fnspec = cryo.parse(msg.args);
            if (!(util.isArray(fnspec.args))) fnspec.args = [fnspec.args];
            if (fnspec.scope) util._extend(background,fnspec.scope);
            console.log('starting background function with args:',
                         fnspec.args,' and scope ',fnspec.scope);
            try{
                var result = fnspec.fn.apply(background,fnspec.args);
                console.log('worker result:',result);
                if (result) result = cryo.stringify(result);
                process.send({command:'complete',state:result});
            }catch(ex){
                var sex = 'Background function error';
                if (ex){
                     sex = cryo.stringify(ex);
                }
                console.log('function error:',ex);
                process.send({command:'error',state:sex});
            }
            break;
        case 'cancel':
            console.log('cancel requested');
            background.cancel = true;
            setTimeout(process.exit,5000);
    }


});






