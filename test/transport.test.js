//transport tests
//listing availalbe transport and fetching transport details
const request = require('supertest');
const app = require('../app/app');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const TransportModel = require('../models/transport.model');
jest.setTimeout(30000); // Set to 20 seconds to be safe

  
describe('Transport API', () => {
     let testTransportId;
     let testDriverId;
 
     beforeAll(async () => {
        await connectDB();

        const transport = await TransportModel.create({
            vehicleNumber: 'ABC123',
            driverId: new mongoose.Types.ObjectId(),
            capacity: 4,
            status: 'available',
            availability: ['available', 'en-route', 'not-available']
            // whatever is defined in models is whats supposed to be in test and the real thing. 
        });
        testTransportId = transport._id;
        testDriverId = transport.driverId;
    });

        test('Should return all available transport options', async () => {
            const res = await request(app).get('/api/v1/transport');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.totalPages).toBeGreaterThan(0);
            expect(res.body.currentPage).toBe(1);
        })

        test('Should return details of a specific transport option', async () => {
            const res = await request(app).get(`/api/v1/transport/${testTransportId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('vehicelNumber');
            expect(res.body).toHaveProperty('capacity');
            expect(res.body).toHaveProperty('status');
            expect(Res.body.driverId).toBeDefined();
        });

        afterAll(async () => {
            await TransportModel.deleteMany({});
            await mongoose.connection.close();
        });
     });