//transportcontroller.js
const { TransportModel } =require('../models/transport.model');
const { setCache, getCache } = require('../utils/redis.client');

exports.createTransport = async (req, res) => {
    try {
        const newTransport = new TransportModel(req.body);
        await newTransport.save();
        res.send('Transport created successfully');
    } catch (error) {
        res.status(400).send(error);
    }
};
 
exports.getTransportsById = async (req, res) => {
    const transportId = req.params.id;
    const cacheKey = `transport:${transportId}`;
 
    try {
        //checking cache
        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.status(200).json(cachedData);

        //fetching from database
        const transport = await TransportModel.findById(transportId)
        .populate('driver', 'name email')
        .lean();
        
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        //store in cache for 10 mins
        await setCache(cacheKey, transport, 600)

        res.status(200).json(transport);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTransports = async(req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const cacheKey = `transports:page${page}:limit${limit}`;

        //check cache
        const cachedData = await getCache(cacheKey);
        if (cachedData) return res.status(200).json(cachedData);

        //Fetch from database with pagination
        const transports = await TransportModel.find()
        .populate('driver', 'name email')
        .skip((page -1) * limit)
        .limit(parseInt(limit))
        .lean();

        const totalCount = await TransportModel.countDocuments();
        const response = {
            transports,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
        };

        //store in cache
        await setCache(cacheKey, response, 600); //cache for 10 mins

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};