
var bluebird = require('bluebird')
  , fs       = require("fs")
  , crypto   = require('crypto');

bluebird.promisifyAll(fs);

function Cached(dir){
    dir = dir || ',cache';
    function path(key) {
        return dir+'/md5.'+crypto.createHash('md5').update(key).digest('hex');
    }
    function set(key, val){
        console.error('Caching results in', dir, path(key));
        return fs.statAsync(dir) // do not use existsAsync as it's callback is non-standard and breaks with bluebird.
        .catch(function(){})     // ignore the errors stat throws when the dir is absent
        .then(function(exists){
            //console.log('dir exists?', exists);
            if(!exists) return fs.mkdirAsync(dir);
        })
        .then(fs.writeFileAsync.bind(fs,path(key), JSON.stringify(val,null,2), {encoding:'utf8'}))
        .then(function(){return val;});
    }
    function get(key, ttl, freeze){
        if ((typeof(ttl) !== 'undefined') || (typeof(freeze) !== 'undefined')) {
            // console.log("Try cache? Trying to get from cache");
            return getWithTtl(key, ttl, freeze);
        } else {
            // console.log("Try cache? No.");
            return getFile(key);
        }
    }
    function getWithTtl(key, ttl, freeze){
        // console.log("Getting with ttl", path(key));
        return fs.statAsync(path(key))
        .then(function(data){
            if (data.mtime > freeze) {
                // console.log("OK: Cached data was made after freeze lockoff time.");
                return;
            }
            if (Date.now() - ttl> data.mtime) {
                // console.log("Not OK: Cached data is too old.");
                throw new Error("Stashed data is too old.");
            }
            // console.log("OK, cached data is fresh.");
        })
        .then(function(){return getFile(key);});
    }
    function getFile(key, ttl){ // returns (data, err)
        //console.log('looking for', key, "\n->  ", path(key));
        return fs.readFileAsync(path(key), "utf8")
        .then(function(data){
            console.error('Using cached "', key, '"'+"\n->  ", path(key));
            // console.log('raw:', JSON.stringify(data));
            return JSON.parse(data);
        });
    }
    // API:
    this.get = get;
    this.set = set;
}

module.exports = Cached;
Cached.FOREVER = -1;
Cached.executor = require('./cachedExec');
