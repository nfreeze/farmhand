FarmHand
=========

An abstration over child_process that makes it easy to run a function in the background, get its progress, result, and cancel if necessary.

Installation:

    npm install farmhand

Example usage:

    var FarmHand = require('farmhand');

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

Create a farmhand instance by passing the function to run in the child process and its arguments

    var farmhand = new FarmHand(fibber,42);

Pass extras that the function will need:

    farmhand.scope = {seed:1}; //available as this.seed
    farmhand.global = {fibonacci:fibonacci}; //globally available
    farmhand.requires = {util:'util'}; //equal to var util = require('util')

Listen to the progress, error and complete events

    farmhand.on('progress',function(state){
        console.log('farmhand progress:',state);
    });
    farmhand.on('complete',function(result){
        console.log('farmhand complete:',result);
    });
    farmhand.on('error',function(err){
        console.log('farmhand error:',err);
    });

Start the process

    farmhand.work();

Optionally pass a callback instead of listening to events

    farmhand.work(function(err,result){
        if (err) console.log('error:',err);
        console.log('result',result);
    });

Cancel the farmhand if needed

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

[Cryo](https://github.com/hunterloftis/cryo) is used to serialize everything sent between the parent and child processes, including the actual function.

Version
-

0.0.5

License
-

MIT