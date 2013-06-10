var events = require('events'),
    util = require('util'),
    path = require('path'),
    cp = require("child_process"),
    cryo = require('cryo') ;

function FarmHand(fn,args,scope){
    var self = this;
    self.fn = fn;
    self.args = args || [];
    self.scope = scope || {};
    self.worker = null;
    self.workerOpts = {
        env: process.env,
        cwd: __dirname
    };
}

util.inherits(FarmHand,events.EventEmitter);

FarmHand.prototype.run = function(cb){
    var self = this;

    var workerArgs = {
        fn: self.fn,
        args:self.args,
        scope: self.scope
    };

    var sArgs = cryo.stringify(workerArgs);
    var workerPath = path.join(__dirname, 'worker.js');
    var worker = cp.fork(workerPath,[],self.workerOpts);

    worker.on('message', function (msg) {
        var payload = msg;
        if (msg.state) payload = cryo.parse(msg.state);
        console.log('message to parent:',msg.command,payload);
        switch (msg.command){
            case 'complete':
                cb(null,payload);
                break;
            case 'error':
                cb(payload,null);
                break;
            case 'progress':
                self.emit('progress',payload);
                break;

        }
    });

    worker.on('close', function (code, signal) {
        console.log('worker closed:',code,signal);
    });

    worker.on('error',function(ex){
        console.log('worker error:',ex);
    });

    process.on('exit',function(){
       console.log('killing working');
       worker.kill();
    });

    self.worker = worker;
    worker.send({command:'start',args:sArgs});
};

FarmHand.prototype.cancel = function(){
    var self = this;
    if (self.worker){
       self.worker.send({command:'cancel'})
    }
};

module.exports = FarmHand;
