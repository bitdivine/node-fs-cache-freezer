Cached
======

Stores data in files.  On retrieval you may specify a maximum age, and if you retrieve an older or non-existent file you will get nothing back.

# API

    cache = new Cached('/tmp');

####<tt>set(key, data) => Promise()</tt>

Stores the given data under the given string key.

####<tt>get(key) => Promise(data)</tt>

Gets the data stored under the given key, regardless of age.  Throws an error if the data is not there.

####<tt>get(key, maxAgeMilliseconds) => Promise(data)</tt>

Gets the data stored under the given key, as long as the data is less than a certain number of milliseconds old.

####<tt>FOREVER</tt>

This is a constant that, if used as a TTL, says that age is of no concern.


####<tt>executor(funct)</tt>

This utility wraps a function.  It stringifies the function arguments and uses them as a key for caching results.  When the wrapped function is called, a cached result is used, if possible, else the original function is called.  The time limit becomes the new first argument, followed by the original arguments.

