var Cached  = require('./Cached')
  , cached  = new Cached();

module.exports = function(execute){
    return function(argdict) {
        // console.log('In cached exec');

        // Get the refresh time (time to live) (time for which the data is valid before it needs to be updated)
        var ttl    = argdict.ttl    || 0;
        // Get the time after which the data doesn't change:
        var freeze = argdict.freeze || 0;
        // The args of the baby function:
        var argv   = argdict.argv   || [];

        // Derive a key:
        var key = [argv.map(String)].toString();

        // Try to get this from cache, else execute:
        return cached
        .get(key, ttl, freeze)
        .catch(function(){
            console.error("Making query:", argv);
            return execute.apply(null,argv)
            .then(function(result){
                 // console.log("have results:", JSON.stringify(result, null,2));
                 return cached.set(key, result);
             });
         });
    };
};
