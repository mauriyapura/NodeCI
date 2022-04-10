
const mongoose = require("mongoose");
const keys = require("../config/keys")
const redis = require('redis');
/*const redisUrl = {
  host: '127.0.0.1',
  port: '6379'
};*/
const client = redis.createClient(keys.redisUrl);
const util = require('util');
client.hget = util.promisify(client.hget); // para retornar promesas y no usar los callbacks

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}){

    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '' );

    return this;  // its chainable 
};

mongoose.Query.prototype.exec = async function () {    

    if(!this.useCache){
        return exec.apply(this, arguments);  // if it is false, execute the original query (without cache)
    }
    
    const key = JSON.stringify(Object.assign( {}, this.getQuery(), {
        collection: this.model.modelName
    }));
    
    // See if we have a value for key in redis
    const cachedValue = await client.hget(this.hashKey, key); 

    // If we do, return that
    if (cachedValue){
        // Currently we have a string, we need to return a Mongo Model
        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc) //true or false
            ? doc.map( d => new this.model(d) )
            : new this.model(doc);        // whether is an object
    }

    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments); // esto ejecuta la query a mongoDB
    client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result
};

module.exports = {
    clearhash(hashKey){
        client.del(JSON.stringify(hashKey))
    }
}
