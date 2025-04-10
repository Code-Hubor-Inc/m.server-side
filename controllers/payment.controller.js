//paymentcontroller.js
const { PaymentModel } = require('../models/payment.model');
const { setCache, getCache, clearCache } = require('../utils/redis.client');

exports.processPayments = async (req, res) => {
    try {
        const payment = new PaymentModel(req.body);
        await payment.save();

        //clear cached payments list when a new list is added
        clearCache(/^payments:/);

        res.status(201).json({ message: 'Payment processsed successfully', payment });
    } catch (error) {
        res.status(400).json({ message: 'Payment process failed', error: error.message });
    }
};
  
exports.getPaymentById = async(req, res) => {
    try {
        const payment = await PaymentModel.findById(req.params.id)
        .populate('user', 'name email')
        .lean();
       if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
       } 
       res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message});
    }
};

exports.getPayments = async (req, res) => {
    try {
        const limit = perseInt(req.query.limit) || 10;
        const page = parseInt(req.query.limit) || 1;
        const cacheKey = `payments:page:${page}:limit:${limit}`;
        
        //check cache
        const cachedPayments = await getCache(cacheKey);
        if (cachedPayments) return res.status(200).json(cachedPayments);

        //Fetch for Database with pagination
        const payments = PaymentModel.findById(req.params.id)
        .populate('transaction')
        .lean()
        .limit(limit)
        .skip((page - 1) * limit);

        //get total count for pagination 
        const totalPayments = await PaymentModel.countDocuments();
        const totalPages = Math.ceil(totalPayments / limit);
        
        //store in cache
        setCache(cacheKey, { payments, totalPages, currentPage: page}, 600);

        res.status(200).json({ payments, totalPages, currentPage: page });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 