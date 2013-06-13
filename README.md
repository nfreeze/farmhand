FarmHand
=========

An abstration over child_process that makes it easy to run a function in the background, get its progress, result, and cancel if necessary.

Installation:

    npm install farmhand

Example usage:

    var FarmHand = require('farmhand');

    function fibonacci(max){
        var self = this,
            seed = 1;
        function fib(n){
            return  n<2?n:fib(n-1)+fib(n-2);
        }
        function getFib(){
            setImmediate(function(){
                 if (self.cancel || seed > max){
                     self.complete({'done':self.cancel,'max':max});
                 }else{
                     self.progress({'fibinocci:':fib(seed),'seed:':seed});
                     seed++;
                     getFib();
                 }
            });
        }
        getFib();
    }

    var farmhand = new FarmHand(fibonacci,40);

 The function must be self contained as it will be serialized and passed to the child worker.
 If you need external data in the function, you can either pass it as arguments to the function or in a scope.

    farmhand.scope = {vegetables:['tomatoes','peas','lettuce','corn']};  //available as this.vegetables in the function

Set requires to have modules added to the context automatically

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

0.0.4

License
-

MIT