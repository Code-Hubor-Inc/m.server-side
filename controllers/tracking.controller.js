//trackingcontroller.js
const { TrackingModel } = require('../models/tracking.model');
// const connectDB = require('../config/db');
// const mongoose = require('mongoose');
const { setCache, getCache, clearCache } = require('../utils/redis.client');

exports.createTrack = async (req, res) => {
    try {
        const newTrack = new TrackingModel(req.body);
        await newTrack.save();

        //Clear cache tracks list when new data is added
        clearCache(/^tracks:/);

        res.status(200).json({ message:'Track created successfully', track: newTrack });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create track', error: error.message });
    }
};
 
exports.getTrackById = async (req, res) =>{
    try {
        const tracking = await TrackingModel.findById(req.params.id)
        .populate('user', 'name email')
        .lean();
       if (!tracking) {
        return res.status(404).json({ message: 'Tracking not found' });
       } 
       res.status(200).json(tracking);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Tracking data not found' });
        }
        res.status(400).json({ message: 'Bad request', error: error.message });
    }
}

exports.getTracks = async (req, res) => {
    try {
        //handling pagination and cache
        const limit =parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const cacheKey = `tracks:page:${page}:limit:${limit}`;

        //checking cache
        const cachedTracks = await getCache(cacheKey);
        if (cachedTracks) return res.status(200).json(cachedTracks);

        //fetching from database
        const tracks = await TrackingModel.find()
        .populate('location', 'name cordinates') //only fetches necesary fields
        .lean()
        .limit(limit)
        .skip((page - 1) * limit);

        //get total count for pagination
        const totalTracks = await TrackingModel.countDocument();
        const totalPages = Math.ceil(totalTracks / limit);

        //store in cache
        setCache(cacheKey, { tracks, totalPages, currentPage: page }, 600);
            
        res.status(200).json({ tracks, totalPages, currentPage: page });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};