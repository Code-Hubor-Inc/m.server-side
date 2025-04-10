//tracking test
//checking parcel status and fetching parcel by id
const request = require('supertest');
const app = require('../app/app');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const ParcelModel = require('../models/parcel.model'); 
jest.setTimeout(30000)

describe('Parcel Tracking API', () => {
    let testParcelId;

    beforeAll(async () => {
        await connectDB();
        const parcel = await ParcelModel.create({
            booking: '', //main
            sender: 'John Doe',
            reciever: 'Jane Doe',
            Status: 'In Transit', //main
            currentLocation: '', //main
            origin: 'Nairobi',
            destination: 'Kisumu'
        });
        testParcelId = parcel._id; 

      });

    test('Should return the status of a parcel', async () => {
        const res = await request(app).get(`/api/v1/tracking/${testParcelId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status');
    });

    test('Should return 404 for an invalid percel ID', async () => {
        const res = await request(app).get(`/api/v1/tracking/${testParcel}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status');
    });

    test('Should return 404 for an invalid parcel ID', async () => {
        const res = await request(app).get('/api/v1/tracking/000000000000000000000000'); 
        expect(res.statusCode).toBe(404);
    });

    afterAll(async () => {
        await ParcelModel.deleteMany({});
        await mongoose.connection.close();
    });
});