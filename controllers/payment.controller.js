/**
 * Payment Controller
 */

const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const { paymentStatus } = require('../constants/payment.enum');
const { clearCache } = require('../utils/redis.cache');

exports.initiatePayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;

        // validate booking exists and is payable
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'confirmed') {
            return res.status(404).json({
                sucess: false,
                message: 'Booking is not in a payable state'
            });
        }

        // calculate amount (in real app, this would be more complex)
        const amount = calculateBookingAmount(booking);

        // create payment record
        const payment = await payment.create({
            booking: bookingId,
            user: req.user._id,
            amount,
            method: paymentMethod,
            status: paymentStatus.PENDING
        });

        // processing payment based on method
        let paymentResult;
        switch (paymentMethod) {
            case 'mpesa':
                paymentResult = await processMpesaPayment(payment);
                break;
            case 'card':
                paymentResult = await processCardPayment(payment);
                break;
                //other payment methods can be added here
            default: 
            throw new Error('Unsupported payment method'); 
        }

        // updating payment with processor response
        payment.transactionId = paymentResult.transactionId;
        payment.paymentDetails = paymentResult.details;
        payment.status = paymentResult.success ? paymentStatus.COMPLETED : paymentStatus.FAILED;
        if (!paymentResult.success) {
            payment.failureReason = paymentResult.error;
        }
        await payment.save();

        // update booking status if payment is successfully
        if (paymentResult.status === paymentStatus.COMPLETED) {
            booking.status = 'paid';
            await booking.save();
            clearCache('booking:${booking._id');
        } 

        res.status(200).json({
            success: paymentResult.success,
            message: paymentResult.message,
            data: {
                payment,
                netxSteps: paymentResult.nextSteps || null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Payment initiation failed',
            error: error.message
        })
    }
};

exports.getPaymentDetails = async (req, res) => {
    try {
        const payment = await Payment.findById(req.param.id)
        .populate('bookingDetails', 'pickupStation dropoffLocation scheduleDate')
        .populate('userDetails', 'name email phone');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Authorization check
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payment'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment details',
            error: error.message
        });
    }
};

exports.processRefunds = async (req, res) => {
    try {
        const { paymentId, refundAmount, reason } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // validate refund amount
        if (refundAmount <= 0 || refundAmount > payment.amount) {
            return res.status(404).json({
                success: false,
                message: 'Invalid refund amount'
            });
        }

        // Process refund
        const refundResult = await processPaymentRefund(payment, refundAmount);
        
        // update payment record
        payment.refunds.push({
            amount: refundAmount,
            reason,
            processedAt: new Date(),
            processedBy: req.user._id
        });

        if (refundResult.fullRefund) {
            payment.status = paymentStatus.REFUNDED;
        }

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                payment,
                refund: refundResult
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Refund processing failed',
            error: error.message
        });
    } 
};

// helper functions (separate file in real app)
async function processMpesaPayment(payment) {
    // Implement M-Pesa processing logic
    return {
        success: true,
        transactionId: `MPESA_${Date.now()}`,
        details: { /* M-Pesa response */ },
        message: 'Payment initiated via M-Pesa'
    };
}

async function processCardPayment(payment) {
    // Implement card processing logic
    return {
        success: true,
        transactionId: `CARD_${Date.now()}`,
        details: { /* Card processor response */ },
        message: 'Payment processed via card'
    };
}

async function processPaymentRefund(payment, amount) {
    // Implement refund logic
    return {
        success: true,
        fullRefund: amount === payment.amount,
        message: `Refund of ${amount} processed`
    };
}

function calculateBookingAmount(booking) {
    // Implement actual pricing logic
    return 1500; // Example flat rate
}