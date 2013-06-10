var FarmHand = require('../lib/farmhand.js');

var ping = function(){
    var i = 0;
    var self = this;
    var interval = setInterval(function(){
        i += 1;
        if (self.cancel){
            console.log('cancelling worker');
            clearInterval(interval);
        }
        console.log('scope var:',self.scopevar);
        self.progress({percent:i,time:Date.now().toString()});
    },1000);
};

var farmhand = new FarmHand(ping,null,{scopevar: 'testing scope'});
farmhand.on('progress',function(state){
    console.log('farmhand progress:',state);
});
farmhand.on('complete',function(result){
    console.log('farmhand complete:',result);
});

farmhand.run(function(err,result){
    if (err){
        console.log('farmhand error:',err);
    }
    console.log('farmhand result: ',result);
});

setInterval(function(){
    console.log('main interval');
},1000);

setTimeout(function(){
    farmhand.cancel();
},10000);
