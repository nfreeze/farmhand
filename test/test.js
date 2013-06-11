var FarmHand = require('../lib/farmhand.js');

function harvestCrop(max){
    var self = this;

    console.log('arg test:',max == 5);
    console.log('scope test:',self.vegetables.length == 4);
    console.log('require test:',self.util.isArray([]));

    var i = 0;
    var v = setInterval(function(){
        i++;
        if (self.cancel || i > max){
            clearInterval(v);
            self.complete({outcome:'all done'});
        }else{
            self.progress({percent:i,time:Date.now()});
        }
    },1000);
}

var farmhand = new FarmHand(harvestCrop,5);
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
},7000);
