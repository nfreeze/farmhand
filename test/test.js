var FarmHand = require('../lib/farmhand.js');

var ping = function(){
    var i = 0;
    var self = this;
    console.log('scope var:',self.scopevar);
    var v = setInterval(function(){
        i++;
        if (self.cancel){
            clearInterval(v);
            self.complete({outcome:'all done'});
        }else{
            self.progress({percent:i,time:Date.now().toString()});
        }
    },1000);
};

var farmhand = new FarmHand(ping,[],{scopevar: 'testing scope'});

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

var mi = setInterval(function(){
    console.log('main interval');
},1000);

setTimeout(function(){
    console.log('sending cancel request');
    farmhand.cancel();
},5000);

setTimeout(function(){
    console.log('stopping main interval');
    clearInterval(mi);
},7000);
