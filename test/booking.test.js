//booking test
//create booking and fetching all bookings
const request = require('supertest');
const app = require('../app/app');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const UserModel = require('../models/user.model');
const TransportModel = require('../models/transport.model');
const BookingModel = require('../models/booking.model');

jest.setTimeout(30000); // Set to 20 seconds to be safe
 
describe('booking API', () => {
    let testUserId, testTransportId, testBookingId;

    beforeAll(async () => {
        await connectDB();

        // creating test user.
        const user = await UserModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        })

        // creating test transport.
        const transport = await TransportModel.create({
            vehicleNumber: 'KAA 123A',
            status: 'available'
        })

        testUserId = user._id;
        testTransportId = transport._id;

        test('Should create a new booking', async () => {
            const res = await request(app)
            .post('/api/v1/bookings')
            .send({
                user: testUserId,
                transport: testTransportId,
                pickupLocation: 'Nairobi',
                dropoffLocation: 'Mombasa',
                status: 'pending'
            })

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Booking created successfully');
            testBookingId = res.body.booking._id;
        })

        test('Should get all bookings', async () => {
            const res = await request(app).get('/api/v1/bookings');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('bookings');
            expect(Array.isArray(res.body.bookings)).toBe(true);
        })

        test('Should get a specific booking', async () => {
            const res = await request(app).get(`/api/v1/bookings/${testBookingId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('_id', testBookingId.toString());
        })
        
    afterAll(async () => {
        await UserModel.deleteMany({});
        await TransportModel.deleteMany({});
        await BookingModel.deleteMany({});
        await mongoose.connection.close();
    });
 });
});