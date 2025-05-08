/** */

const Booking = require('../models/booking.model');
const Parcel = require('../models/parcel.model');
const { bookingStatus } = require('../constants/status.enum');
const { clearCahce } = require('../utils/redis.cache');
const { clearCache } = require('../utils/redis.client');

// create new booking
exports.createBooking = async (req, res) => {
    try {
        const { parcels, ...bookingData } = req.body;

        // create the booking
        const booking = new Booking(bookingData);
        await booking.save();

        // handles parcel if provided
        let parcelDocs = [];
        if (parcels && parcels.length > 0) {
            parcelDocs = await Promise.all(parcels.map(parcelData => 
                Parcel.create({ ...parcelData, booking: booking._id })
            ));

            // update booking with parcel references
            booking.parcels = parcelDocs.map(p => p._id);
            await booking.save();
        }

        // clear relevant cache
        clearCache(`user:${booking.user}:booking`);

        res.status(201).json({
            success: true,
            data: {
                booking,
                parcels: parcelDocs
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Booking creation failed',
            error: error.message
        });
    }
};

// Get all bookings (with pagination and filtering)
exports.getBookings = async (req, res) => {
    try {
    const { page =1, limit = 10, status, user, transport } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (user) filter.user = user;
    if (transport) filter.transport = transport;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { scheduleDate: 1 },
        populate: [
            { path: 'user', select: 'name email' },
            { path: 'transport', select: 'vehicleNumber capacity' },
            { path: 'parcels', select: 'description weight' }
        ]
    };

    const bookings = await Booking.paginate(filter, options);

    res.status(200).json({
        sucess: true,
        data: bookings
    });
} catch (error) { 
    res.status(500).json({
        success: false,
        message: 'Error fetching bookings',
        error: error.message
    });
  }
}
// Getting single booking
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('transport', 'vehicleNumber driver capacity')
        .populate('parcels');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// Updating booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = req.booking;

        if (!Object.values(bookingStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        booking.status = status;
        await booking.save();

        // clear relevant cache
        clearCache(`user:${booking.user}:booking`);
        clearCache(`booking:${booking._id}`);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};