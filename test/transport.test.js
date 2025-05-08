/**
 * @ransport test
 */

const request = require('supertest');
const app = require('../app/app');
const mongoose = require('mongoose');
const Transport = require('../models/transport.model');
const User = require('../models/user.model');
const { transportTypes, transportStatus } = require('../constants/transport.enum');

describe('Transport API', () => {
    let adminToken, driverToken, transportId;

    beforeAll(async () => {
        // create test admin
        await User.create({
            name: 'Admin',
            email: 'transport.admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        // create test driver
        const driver = await User.create({ 
            name: 'Transport driver',
            email: 'transport.driver@test.com',
            passowrd: 'password123',
            role: 'driver'
        });

        // create test transport
        const transport = await Transport.create({
            vehicleNumber: 'ABC123',
            type: transportTypes.VAN,
            make: 'Toyota',
            model: 'Hiace',
            capacity: { weight: 100, volume: 10 },
            status: transportSchema.AVAILABLE
        });

        transportId = transport._id;

        // Mocj tokens
        adminToken = 'mock-admin-token';
        driverTken: 'mock-driver-token';
    });

    describe('POST /api/v1/transport', () => {
        test('Should create a new transport (admin)', async () => {
            const res = await request(app)
            .post('/api/v1/transport')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                vehicleNumber: 'TEST0002',
                Type: transportTypes.TRUCK,
                make: 'Isuzu',
                model: 'NPR',
                capacity: { weight: 5000, volume: 20 }
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.vehicleNumber).toBe('TEST0002');
        });
    });

    describe('GET /api/v1/transport', () => {
        test('Should get all transports', async () => {
            const res = await request(app)
                  .get('/api/v1/transport')
                  .get('Authorization', `Bearer ${adminToken}`)

                  expect(res.statusCode).toBe(200);
                  expect(res.body.success).toBe(true);
                  expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/transport/:id', () => {
        test('Should update transport (admin)', async () => {
            const res = await request(app)
                  .patch(`/api/v1/transport/${transportId}`)
                  .set('Authorization', `Bearer ${adminToken}`)
                  .send({
                      status: transportStatus.RESERVED
                  });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe(transportStatus.RESERVED);
        });
    });

    afterAll(async () => {
        await Transport.deleteMany();
        await User.deleteMany();
        await mongoose.connection.close();
    });
});