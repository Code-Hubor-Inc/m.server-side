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
    let testUserId, testTransportId;

    beforeAll(async () => {
        await connectDB();

        const user = await UserModel.create({
            user: 'testUserId.toString()',
            transport: 'testTransportId.toString()',
            pickupLocation: 'pickup location',
            dropoffLocation: 'dropoff location',
            bookingDate: '2023-03-15:00:00:00.000Z', //using ISO format
            status: 'pending'
                        
          });
        const transport = await TransportModel.create({ name: 'Matatu 101', route: 'Nairobi-Kisumu' });

        testUserId = user._id;
        testTransportId = transport._id;
    });

    test('Should create a new booking', async () => {
        const res = await request(app)
        .post('/api/v1/bookings')
        .send({
            userId: testUserId,
            transportId: testTransportId,
            date: '2023-03-15'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'booking created successfully');
    });

    test('Should get all bookings', async () => {
        const res = await request(app).get('/api/v1/bookings');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    afterAll(async () => {
        await UserModel.deleteMany({});
        await TransportModel.deleteMany({});
        await BookingModel.deleteMany({});
        await mongoose.connection.close();
    });
});