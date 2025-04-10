//bookingcontroller.js
const { BookingModel } = require('../models/booking.model');
const ParcelModel = require('../models/parcel.model');
const { setCache, getCache, clearCache } = require('../utils/redis.client');
 
exports.createBooking = async (req, res) => {
    try {
        // Destructure booking data from the request body and leaves the rest for booking.
        const { parcels, ...bookingData } = req.body;
        
        // creating booking
        const newBooking = new BookingModel(bookingData);
        await newBooking.save();

        // handle parcel if provided
        let parcelDocs = [];
        if (Array.isArray(parcels) && parcels.length > 0) {
            parcelDocs = await Promise.all(parcels.map(async (parcelData) => {
              return await ParcelModel.create({
                ...parcelData,
                bookingId: newBooking._id
              });  
            }));

            // optional: save parcel reference in booking
            newBooking.parcels = parcelDocs.map(p => p._id);
            await newBooking.save();
        }

        //clear cache for bookings
        clearCache(/^bookings:/);

        res.status(201).json({ 
            message: 'Booking created successfully', 
            booking: newBooking,
            parcels: parcelDocs        
        });
    } catch (error) {
        res.status(400).json({ message: 'Booking creation failed', error: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await BookingModel.findById(req.params.id)
        .populate('user, name email')
        .populate('transport', 'vehicleNumber status')
        .populate('parcels') //populatin parcel data if needed
        .lean();
       if (!booking) {
        res.status(404).json({ message: 'Booking not found' });
       } 
       res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message})
    }
};

exports.getBookings = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const cacheKey = `bookings:page:${page}:limit:${limit}`;

        //check cache
        const cachedBookings = await getCache(cacheKey);
        if (cachedBookings) return res.status(200).json(cachedBookings);

        //Fetch from Database with pagination
        const bookings = await BookingModel.find()
        // will be using .select() to reduce query lag especially when working with .populate() or large collecions.
        .select('pickupLocation dropoffLocation status bookingDate' ) //only fetching that from booking
        .populate('user', 'name email') //fetch only name and email
        .populate('transport', 'vehicleNumber status') //fecthing specific transport details
        .lean()
        .limit(limit)
        .skip((page - 1) * limit);

        //get total count for pagination
        const totalBookings = await BookingModel.countDocuments();
        const totalPages = Math.ceil(totalBookings / limit);

        const result = { bookings, totalPages, currentPage: page };

        //store in cache
        setCache(cacheKey, result, 600);
       
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: 'Server error', error: error.message });
    }
}; 