//this file is used mainly as cache, message broker and session manager. 
//Its fast because i stores data in RAM rathe than fecthing disk-based database.
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        connectTimeout: 30000,
    }
  });

// client.connect().catch(console.error);
client.connect()
.then(() => console.log('Redis client connected'))
.catch((err) => console.error('Redis connection error:', err));

client.on('error', (err) => console.error('Redis Error:', err));

// set cache: stores data in redis with expiration time
const setCache = (key, data, expiration = 600) => {
    client.setEx(key, expiration, JSON.stringify(data));
};

// get cache: retrieve data for a given key
const getCache = (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, data) => {
            if (err) reject(err);
            if (data) resolve(JSON.parse(data));
            else resolve(null);
        });
    });
};

// clear cache: delete keys that match a pattern
const clearCache = (pattern) => {
    client.keys(pattern, (err, keys) => {
        if (!err && keys.length) {
            keys.forEach((key) => client.del(key));
        }
    });
};

module.exports = { client, setCache, getCache, clearCache };
