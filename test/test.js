var FarmHand = require('../lib/farmhand.js');

function fibonacci(n){
    return  n<2?n:fibonacci(n-1)+fibonacci(n-2);
}

function fibber(max){
    var self = this;

    console.log('arg test:',max == 42);
    console.log('require test:',util.isArray([]));
    console.log('scope test:',self.seed == 1);

    function getFib(){
        setImmediate(function(){
             if (self.cancel || self.seed > max){
                 self.complete({'done':self.cancel ? 'cancelled':'max reached',
                                'max':max});
             }else{
                 self.progress({'fibinocci:':fibonacci(self.seed),'seed:':self.seed});
                 self.seed++;
                 getFib();
             }
        });
    }
    getFib();
}

var farmhand = new FarmHand(fibber,42);
farmhand.scope = {seed:1}; //available as this.seed
farmhand.global = {fibonacci:fibonacci}; //globally available
farmhand.requires = {util:'util'}; //equal to var util = require('util')

farmhand.on('progress',function(state){
    console.log('farmhand progress:',state);
});
farmhand.on('complete',function(result){
    console.log('farmhand complete:',result);
});
farmhand.on('error',function(err){
    console.log('farmhand error:',err);
});

farmhand.work();
// or optionally pass a callback
// instead of listening to events
farmhand.work(function(err,result){
    if (err) console.log('error:',err);
    console.log('result',result);
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
