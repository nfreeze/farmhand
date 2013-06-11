var events = require('events'),
    util = require('util'),
    path = require('path'),
    cp = require("child_process"),
    cryo = require('cryo') ;

function FarmHand(fn,args,scope,reqs){
    var self = this;

    self.fn = fn;
    self.args = args || [];
    self.scope = scope || {};
    self.cancelTimeout = 3000;
    self.completeTimeout = 3000;
    self.timeout = 0;
    self.requires = reqs || [];
    self.working = false;
    self.worker = null;
    self.workerOpts = {
        env: process.env,
        cwd: __dirname
    };
}

util.inherits(FarmHand, events.EventEmitter);

FarmHand.prototype.work = function(cb){
    var self = this;

    if (self.working) return;
    self.working = true;

    var workerArgs = {
        fn: self.fn,
        args:self.args,
        scope: self.scope,
        requires: self.requires,
        timeout: self.timeout,
        cancelTimeout: self.cancelTimeout,
        completeTimeout: self.completeTimeout
    };

    var sArgs = cryo.stringify(workerArgs);
    var workerPath = path.join(__dirname, 'worker.js');
    var worker = cp.fork(workerPath,[],self.workerOpts);

    worker.on('message', function (msg) {

        var payload = cryo.parse(msg.state);

        switch (msg.command){
            case 'complete':
                self.emit('complete',payload);
                if(cb) cb(null,payload);
                break;
            case 'error':
                self.emit('error',payload);
                if(cb) cb(payload,null);
                break;
            case 'progress':
                self.emit('progress',payload);
                break;
        }
    });

    worker.on('close', function (code, signal) {
        console.log('worker closed:',code,signal);
        self.working = false;
    });

    worker.on('error',function(ex){
        console.log('worker error:',ex);
    });

    process.on('SIGTERM',function(){
        console.log('killing worker');
        worker.kill();
    });
    process.on('exit',function(){
        console.log('killing worker');
        worker.kill();
    });

    self.worker = worker;
    worker.send({command:'start',args:sArgs});
};

FarmHand.prototype.cancel = function(){
    var self = this;
    if (self.worker)
        self.worker.send({command:'cancel'});
};

FarmHand.prototype.kill = function(){
    var self = this;
    if (self.worker)
        self.worker.kill();
};

module.exports = FarmHand;