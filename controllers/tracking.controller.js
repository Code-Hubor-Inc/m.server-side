/**
 * @transport controller
 */

const Tracking = require('../models/tracking.model');
const Booking = require('../models/booking.model');
const Transport = require('../models/transport.model');
const { TrackingEvents, trackingStatus } = require('../constants/tracking.enum');
const { clearCache } = require('../utils/redis.cache');

exports.createTrackingEvent = async (req, res) => {
    try {
        const { bookingId, eventType, location, notes, metadata } = req.body;

        // Validate booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404)/json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate transport exists
        const transport = await Transport.findById(booking.transport);
        if (!transport) {
            return res.status(404).json({
                success: false,
                message: 'Transport not found'
            });
        }

        // Create tracking event
        const trackingEvent = await Tracking.create({
            booking: bookingId,
            transport: booking.transport,
            eventType,
            location,
            notes,
            metadata,
            recordedBy: req.user._id
        });

        // Update booking status if needed
        if (['delivered', 'cancelled'].includes(eventType)) {
            booking.status = eventType === 'delivered' ? 'completed' : 'cancelled';
            await booking.save();
            clearCahce('booking:${booking._id}')
        }

        res.status(201).json({
            success: true,
            message: 'Tracking event recorded successfully',
            data: trackingEvent
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to record tracking event',
            error: error.message
        });
    }
};

exports.getTrackingHistory = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { limit = 50, page = 1 } = req.query;

        // Validate booking exist and user has acceess
        const bookng = await Bookng.findByID(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this tracking history'
            });
        }

        // Get tracking events with pagination
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { timestamp: -1 },
            populate: [
                { path: 'transportDetails', select: 'vehicleNumber type' },
                { path: 'recordedByDetails', select: 'name role' }
            ]
        };

        const trackingEvents = await Tracking.paginate(
            { booking: bookingId },
            options
        );

        res.status(200).json({
            success: true,
            data: trackingEvents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving tracking history',
            error: error.message
        });
    }
};

exports.getCurrentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Validate booking exists and user has access(secure access)
        if (!mongoose.isValidObjectId(bookingId)) {
            return res.status(404).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        // Convert to ObjectId immediately after validation
        const bookingObjectId = new mongoose.Types.ObjectId(bookingId);

        // USer the ObjectId in all queries
        const booking = await Booking.findById(bookingObjectId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        }
        
        // Authorize checks
        if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this tracking information'
            });
        }

        // Get most recent tracking event
        const latestEvent = await Tracking.findOne({ booking: bookingObjectId })
        .sort({ timestamp: -1 })
        .populate('transportDetails', 'vehicleNumber type')
        .lean();

        if (!latestEvent) {
            return res.status(404).json({
                success: false,
                message: 'No tracking event found for this booking'
            });
        }

        // Calculate progress
        const progress = calculateProgress(booking, latestEvent);

        res.status(200).json({
            success: true,
            data: {
                ...latestEvent,
                progress
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving current status',
            error: error.message
        });
    }
};

// Helper function to calculate progress
function calculateProgress(booking, latestEvent) {
    // In real app, this would use actual route calculation
    const events = {
        pickup: 25,
        in_transit: 50,
        delayed: 60,
        delivered: 100,
        cancelled: 0
    };

    return {
        percentage: event[latestEvent.eventType] || 0,
        currentStatus: latestEvent.eventType,
        lastUpdated: latestEvent.timestamp
    };
}