var FarmHand = require('../lib/farmhand.js');

function fibber(max){
    var self = this,
        seed = 1;

    console.log('arg test:',max == 5);
    console.log('scope test:',self.vegetables.length == 4);
    console.log('require test:',self.util.isArray([]));

    function fib(n){
        return  n<2?n:fib(n-1)+fib(n-2);
    }
    function getFib(){
        setImmediate(function(){
             if (self.cancel || seed > max){
                 self.complete({'done':self.cancel ? 'cancelled':'max reached',
                                'max':max});
             }else{
                 self.progress({'fibinocci:':fib(seed),'seed:':seed});
                 seed++;
                 getFib();
             }
        });
    }
    getFib();
}

var farmhand = new FarmHand(fibber,42);
farmhand.scope = {vegetables:['tomatoes','peas','lettuce','corn']};
farmhand.requires = ['util','os','path'];

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
