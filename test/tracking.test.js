/**
 * @tracking test
 */

const request = require('supertest');
const app = require('../app/app');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Transport = require('../models/transport.model');
const Tracking = require('../models/tracking.model');
const { trackingEvents } = require('../constants/tracking.enum');

describe('Tracking API', () => {
    let customerToken, driverToken, adminToken, bookingId, transportId;

    beforeAll(async () => {
        // Creating customer test
        const customer = await User.create({
            name: 'Test Customer',
            email: 'tracking.customer@test.com',
            passsowrd: 'password123',
            role: 'customer'
        });

        const transport = await Transport.create({
            vehicleNumber: 'TRACK001',
            type: 'truck'
        });

        const driver = await User.create({
            name: 'Test Driver',
            email: 'tracking.driver@test.com',
            password: 'passowrd123',
            role: 'driver',
            transport: transport._Id
        });

        const admin = await User.create({
            name: 'Test Admin',
            email: 'tracking.admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        // Creating test booking
        const booking = await Booking.create({
            user: customer._id,
            transport: transport._id,
            pickupLocation: { type: 'Point', coordinates: [36.8, -1.2], address: 'Nairobi' },
            dropoffLocation: { type: 'Point', coordinates: [36.8, -1.3], address: 'Mombasa' },
            scheduleDate: new Date(Date.now() + 86400000), // 1 day from now
            status: 'confirmed'
        });

        bookingId = booking._id;
        transportId = transport._id;

        // Mock tokens
        customerToken = 'mock-customer-token';
        driverToken = 'mock-driver-token';
        adminToken = 'mock-admin-token';
    });

    describe('POST /api/v1/tracking', () => {
        test('should create tracking event (driver)', async () => {
            const res = await request(app)
                .post('/api/v1/tracking')
                .set('Authorization', `Bearer ${driverToken}`)
                .send({
                    bookingId: bookingId.toString(),
                    eventType: trackingEvents.PICKUP,
                    location: {
                        coordinates: [36.81, -1.21],
                        address: 'Nairobi CBD'
                    },
                    notes: 'Package picked up from sender'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.eventType).toBe(trackingEvents.PICKUP);
        });
    });

    describe('GET /api/v1/tracking/booking/:bookingId', () => {
        test('should get tracking history (customer)', async () => {
            const res = await request(app)
                .get(`/api/v1/tracking/booking/${bookingId}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.docs).toBeInstanceOf(Array);
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Transport.deleteMany({});
        await Booking.deleteMany({});
        await Tracking.deleteMany({});
        await mongoose.connection.close();
    });
});