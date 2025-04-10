//payment shcema.
//for processing and tracking payments.
//implement this section once the basic flow is functional.
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { 
        type: Number, 
        required: true,
        validate: [function(value) {
            return value > 0;
        }, 'Amount must be greater than 0'] 
    },
    paymentMethod: { type: String, enum: ['card', 'mpesa', 'stripe'], required: true, index: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Payment', PaymentSchema); 