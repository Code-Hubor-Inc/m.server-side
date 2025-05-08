/**
 * payment test
 * Processing payment and fetching payment hostory
 */
 
const request = require('supertest');
const app = require('../app/app');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Payment = require('../models/payment.model');
const { paymentStatus } = require('../constants/paymentEnums');

describe('Payment API', () => {
    let customerToken, adminToken, bookingId;

    beforeAll(async () => {
        // Setup test data
        const customer = await User.create({
            name: 'Payment Customer',
            email: 'payment.customer@test.com',
            password: 'password123',
            role: 'customer'
        });

        const admin = await User.create({
            name: 'Payment Admin',
            email: 'payment.admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        const booking = await Booking.create({
            user: customer._id,
            transport: new mongoose.Types.ObjectId(), // Mock transport
            pickupLocation: { type: 'Point', coordinates: [36.8, -1.2], address: 'Nairobi' },
            dropoffLocation: { type: 'Point', coordinates: [36.8, -1.3], address: 'Mombasa' },
            scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
            status: 'confirmed'
        });

        bookingId = booking._id;

        // Get auth tokens (simplified)
        customerToken = 'mock-customer-token';
        adminToken = 'mock-admin-token';
    });

    describe('POST /api/v1/payments/initiate', () => {
        test('should initiate payment for valid booking', async () => {
            const res = await request(app)
                .post('/api/v1/payments/initiate')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    bookingId: bookingId.toString(),
                    paymentMethod: 'mpesa'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.payment).toHaveProperty('status', paymentStatus.COMPLETED);
        });

        test('should reject unauthorized users', async () => {
            const res = await request(app)
                .post('/api/v1/payments/initiate')
                .set('Authorization', `Bearer ${adminToken}`) // Admin can't initiate payments
                .send({
                    bookingId: bookingId.toString(),
                    paymentMethod: 'mpesa'
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/v1/payments/:id', () => {
        test('should retrieve payment details for owner', async () => {
            // First create a payment
            const payment = await Payment.create({
                booking: bookingId,
                user: (await User.findOne({ email: 'payment.customer@test.com' }))._id,
                amount: 1500,
                method: 'mpesa',
                status: paymentStatus.COMPLETED
            });

            const res = await request(app)
                .get(`/api/v1/payments/${payment._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data._id).toBe(payment._id.toString());
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Booking.deleteMany({});
        await Payment.deleteMany({});
        await mongoose.connection.close();
    });
});