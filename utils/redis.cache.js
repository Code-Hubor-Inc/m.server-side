const redis = require('redis');
const { promisify } = require('util');

// Create redis client 
const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    legacyMode: false
});

// Connection handlers
client.on('connect', () => console.log('Redis client connected'));
client.on('error', (err) => console.error('Redis error:', err));
client.on('ready', () => console.log('Redis client ready'));

// connect to redis
client.connect().catch(err => console.error('Connection error:', err));

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsycn = promisify(client.del).bind(client);

// Cache functions
exports.getCache = async (key) => {
    try {
        const data = await getAsync(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Cache get error:', err );
        return null;
    }
};

exports.setCache = async (key, data, ttl = 3600) => {
    try {
        await setAsync(key, JSON.stringify(data), 'EX', ttl);
    } catch (err) {
        console.error('Cache set error:', err)
    }
};

exports.clearCache = async (pattern) => {
    try {
        const keys = await new Promise((resolve, reject) => {
            client.keys(pattern, (err, keys) => {
                if (err) reject(err);
                resolve(keys);
            });
        });

        if (keys.length > 0) {
            await delAsycn(keys);
        }
    } catch (err) {
        console.error('Cache clear error:', err);
    }
};

// Cache middleware 
exports.cacheMiddleware = (cacheKey) => async (req, res, next) => {
    try {
        const cacheData = await exports.getCache(cacheKey);
        if (cacheData) {
            return res.json(cacheData);
        }

        const originalJson = res.json;
        res.json = (data) => {
            exports.setCache(cacheKey, data)
              .catch(err => console.error('Cache failed', err));
            originalJson.call(res, data);  
        };

        next();
    } catch (err) {
        next(err);
    };
};

// A proper cleanup method
exports.disconnect = async () => {
    try {
        await client.quit();
        console.log('Redis client disconected');
    } catch (err) {
        console.error('Redis disconnect error', err)
    }
};
