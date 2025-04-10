//Manages transport booking operations: Creating booking, View user booking, cancel a booking
const express =require('express'); 
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
// const cacheMiddleware = require('../middleware/redis.cache');

router.get('/api/booking', async (req, res) => {
    try {
        const bookings = await bookingController.getBookings();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
}); 
router.get('/:id', async (req, res) => {
    try {
        const booking = await bookingController.getBookingById(req.params.id);
        if (booking) {
            res.status(200).json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching booking' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newBooking = await bookingController.createBooking(req.body);
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ error: 'Error creating booking' });
    }
});
// router.get('/health', (req, res) => {
//     res.json({ message: 'Booking route is working', status: 'OK'});
// });
// router.get('/', cacheMiddleware('bookings'), bookingController.getBookings);
// router.get('/:id', cacheMiddleware('booking'), bookingController.getBookingById);
// router.post('/', bookingController.createBooking); 

module.exports = router; 