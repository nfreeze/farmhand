var events = require('events'),
    util = require('util'),
    path = require('path'),
    cp = require("child_process"),
    cryo = require('cryo') ;

function FarmHand(fn,args){
    var self = this;

    self.fn = fn;
    self.args = args || [];
    self.scope = {};
    self.global = {};
    self.cancelTimeout = 3000;
    self.completeTimeout = 3000;
    self.timeout = 0;
    self.requires = {};
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
        global:self.global,
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

    worker.on('disconnect', function () {
        self.working = false;
    });

    worker.on('close', function (code, signal) {
        self.working = false;
        var d = {code:code,signal:signal};
        self.emit('close',d);
        if(cb) cb(null,d);
    });

    worker.on('error',function(ex){
        self.emit('error', ex);
        if(cb) cb(ex, null);
    });

    process.on('SIGTERM',function(){
        worker.kill();
    });
    process.on('exit',function(){
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