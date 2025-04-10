//payment test
//processing payment and fetching payment history
const request = require('supertest');
const app = require('../app/app');
const BookingModel = require('../models/booking.model'); 
const UserModel = require('../models/user.model');
const TransportModel = require('../models/transport.model');
const PaymentModel = require('../models/payment.model');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
jest.setTimeout(30000); // Set to 20 seconds to be safe

 
describe('Payment API', () => {
    let testUserId, testBookingId;

    beforeAll(async () => {
        await connectDB();

        const user = await UserModel.create({
             username: 'Payment User', //was name initially
             email: 'pay@example.com',
             password: 'securePassword123'
          });
        const transport = await TransportModel.create({ name: 'Matatu X', route: 'Kisumu-Eldoret' });
        const booking = BookingModel.create({
            userId: user._id,
            transportId: transport._id,
            date: '2025-02-25'
        });

        testUserId = user._id;
        testBookingId = booking._id;   
        
    });

    test('Should process payment', async () => {
        const res = await request(app)
        .post('/api/v1/payments')
        .send({
            userId: testUSerId,
            bookingId: testBookingId,
            amount: 1500,
            method: 'M-Pesa',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Payment successfully');
    });

    test('Should get payment history', async () => {
        const res = await request(app).get('/api/v1/payments');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    afterAll(async () => {
        await UserModel.deleteMany({});
        await TransportModel.deleteMany({});
        await BookingModel.deleteMany({});
        await PaymentModel.deleteMany({});
        await mongoose.connection.close();
    });
});