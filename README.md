FarmHand
=========

An abstration over child_process that makes it easy to run a function in the background, get its progress and result, and cancel if necessary.

Installation:

    npm install farmhand

Example usage:

    var FarmHand = require('farmhand');

    var busywork = function(){
        var i = 0;
        var self = this;
        self.require('util');
        console.log('scope var:',self.scopevar);
        var v = setInterval(function(){
            i++;
            if (self.cancel){
                clearInterval(v);
                self.complete({outcome:'all done'});
            }else{
                self.progress({percent:i,time:Date.now()});
            }
        },1000);
    };

    var farmhand = new FarmHand(busywork);

You can pass arguments and scope variables to the farmhand

    var farmhand = new FarmHand(busywork, [1,2,3], {scopevar: 'bacon'});

Listen for progress, errors or completion

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

or optionally pass a callback instead of listening to events

    farmhand.work(function(err,result){
        if (err) console.log('error:',err);
        console.log('result',result);
    });

[Cryo](https://github.com/hunterloftis/cryo) is used to serialize everything sent between the parent and child processes, including the actual function.
Serializing functions is generally frowned upon so consider this experimental.

Version
-

0.0.3

License
-

MIT