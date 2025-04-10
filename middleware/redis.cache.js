//this is a middlware that checks cache before running controller logic
const { getCache, setCache } = require('../utils/redis.client');
// const redis = require('redis');

const cacheMiddlware = (cacheKeyPrefix, duration = 600) => {
  return async (req, res, next) => {
    try {
        // construct a unique key using the prefix and the original URL
        const cacheKey = `${cacheKeyPrefix}:${req.originalUrl}`;

        // use the correctly defined variable (cacheKe) instead of key
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        //Override res.json to store response in cache before sending it
        // the data is first cached
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            setCache(cacheKey, data, duration);
            originalJson(data);
        };
        
        next();
    } catch (error) {
        console.error('Cache Middlware Error:', error);
        next();
      }
    }
};

module.exports = cacheMiddlware; 