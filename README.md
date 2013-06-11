FarmHand
=========

An abstration over child_process that makes it easy to run a function in the background, get its progress, result, and cancel if necessary.

Installation:

    npm install farmhand

Example usage:

    var FarmHand = require('farmhand');

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

    var farmhand = new FarmHand(busywork);

You can pass arguments and scope variables to the farmhand

    var farmhand = new FarmHand(harvestCrop, 5, {vegetables:['tomatoes','peas','lettuce','corn']});
    var farmhand = new FarmHand(harvestCrop, 5);
    farmhand.scope = {vegetables:['tomatoes','peas','lettuce','corn']};  //available as this.vegetables in the function

Set requires to have modules added to the context

    farmhand.requires = ['util','os','path'];  //available as this.util, this.os and this.path in the function

Listen for progress, errors or completion

    farmhand.on('progress',function(state){
        console.log('progress:',state);
    });
    farmhand.on('complete',function(result){
        console.log('complete:',result);
    });
    farmhand.on('error',function(err){
        console.log('error:',err);
    });

    farmhand.work();

Optionally pass a callback instead of listening to events

    farmhand.work(function(err,result){
        if (err) console.log('error:',err);
        console.log('result',result);
    });

[Cryo](https://github.com/hunterloftis/cryo) is used to serialize everything sent between the parent and child processes, including the actual function.

Version
-

0.0.3

License
-

MIT