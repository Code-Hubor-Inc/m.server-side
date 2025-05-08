//payment shcema.
//for processing and tracking payments.
//implement this section once the basic flow is functional.
 
const mongoose = require('mongoose');
const { paymentMethods, paymentStatus, currencyTypes } = require('../constants/payment.enum');

const PaymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'USer reference is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'],
        set: v => parseFloat(v.toFixed(2))
    },
    currency: {
        type: String,
        default: 'KES',
        uppercase: true,
        enum: Object.values(currencyTypes)
    },
    method: {
        type: String,
        enum: Object.values(paymentMethods),
        required: [true, 'Payment method is required']
    },
    status: {
        type: String,
        enum: Object.values(paymentStatus),
        default: paymentStatus.PENDING,
    },
    transactionId: {
        type: String,
        trim: true
    },
    paymentDate: Date,
    receiptUrl: String,
    failureReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Failure reason cannot exceed 500 characters']
    },
    refunds: [{
        amount: Number,
        reason: String,
        processedAt: Date,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],    
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
 
// Indexes
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ paymentDate: 1 });

// Virtual populate
PaymentSchema.virtual('bookingDetails', {
    ref: 'Booking',
    localField: 'booking',
    foreignField: '_id',
    justOne: true
});

PaymentSchema.virtual('userDetaisl', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

// pre-save hook to set payment date when status changes to completed
PaymentSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === paymentStatus.COMPLETED && !this.paymentDate) {
        this.paymentDate = new Date();
    }
    next();
});

module.exports = mongoose.model('Payment', PaymentSchema);