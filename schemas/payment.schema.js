//manages payment related data
//ensure payment request are valid
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KSH' },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' };
    paymentDate: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Payment', paymentSchema);