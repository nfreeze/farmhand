var FarmHand = require('../lib/farmhand.js');

function fibonacci(n){
    return  n<2?n:fibonacci(n-1)+fibonacci(n-2);
}

function fibber(max){
    var self = this;

    var assert = require('assert');
    assert.equal(max, 42);
    assert(util.isArray([]));
    assert.equal(self.seed, 1);

    var net = require('net');

    function getFib(){
        setImmediate(function(){
             if (self.cancel || self.seed > max){
                 self.complete({done:self.cancel ? 'cancelled':'max reached',
                                max:max});
             }else{
                 self.progress({fibinocci:fibonacci(self.seed),
                                seed:self.seed});
                 self.seed++;
                 getFib();
             }
        });
    }
    getFib();
}

var farmhand = new FarmHand(fibber,42);
farmhand.scope = {seed:1}; //available as this.seed in fibber
farmhand.global = {fibonacci:fibonacci}; //globally available in fibber
farmhand.requires = {utl:'util',os:'os'}; //equal to var utl = require('util')
farmhand.requires = ['util','os']; //as an array to have the same name
//farmhand.requires = 'util'; //or as a string for just one

farmhand.on('progress',function(state){
    console.log('farmhand progress:',state);
});
farmhand.on('complete',function(result){
    console.log('farmhand complete:',result);
});
farmhand.on('error',function(err){
    console.log('farmhand error:',err);
});

//farmhand.work();
// or pass a callback
farmhand.work(function(err,result){
    if (err) console.log('error:',err);
    console.log('callback result',result);
});

var mainProcess = setInterval(function(){
    console.log('main interval');
},1000);

setTimeout(function(){
    console.log('sending cancel request');
    farmhand.cancel();
},5000);

setTimeout(function(){
    console.log('stopping main interval');
    clearInterval(mainProcess);
},10000);
