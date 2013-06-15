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

        var assert = require('assert');
        assert.equal(max, 42);
        assert(util.isArray([]));
        assert.equal(self.seed, 1);

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

Pass extra functions and objects that the farmhand will need:

    farmhand.scope = {seed:1}; //available as this.seed in fibber
    farmhand.global = {fibonacci:fibonacci}; //globally available in fibber

The global 'require' method will work fine in your farmhand function.
You can also use the following convenience method to add required modules.

    farmhand.requires = {utl:'util',os:'os'}; //equal to var utl = require('util'),os = require('os');
    farmhand.requires = ['util','os']; //equal to var util = require('util'),os = require('os');
    farmhand.requires = 'util'; //or as a string for just one required module

Listen to the progress, error and complete events

    farmhand.on('progress',function(state){  //triggered by calling this.progress
        console.log('farmhand progress:',state);
    });

    farmhand.on('complete',function(result){ //triggered by calling this.complete
        console.log('farmhand complete:',result);
    });

    farmhand.on('error',function(err){
        console.log('farmhand error:',err);
    });

Start the process

    farmhand.work();

Optionally pass a callback instead

    farmhand.work(function(err,result){
        if (err) console.log('error:',err);
        console.log('result',result);
    });

Cancel the farmhand if needed

        setTimeout(function(){
            console.log('sending cancel request');
            farmhand.cancel();  //sets this.cancel to true in your function
        },5000);

[Cryo](https://github.com/hunterloftis/cryo) is used to serialize everything sent between the parent and child processes, including the actual function.

Version
-

0.0.7

License
-

MIT