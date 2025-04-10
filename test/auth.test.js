//test for auth module
const request = require('supertest');
const app = require('../app/app'); 
const UserModel = require('../models/user.model');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
jest.setTimeout(30000); // Set to 20 seconds to be safe


describe('Auth Endpoints', () => {
    let testEmail = 'test@example.com';

    it('should register a new user', async () => {
        const res = await request(app)
        .post('/auth/signup')
        .send({
            username: 'test',
            email: testEmail,
            password: 'testpassword'
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success');
    });

    it('should login a user', async () => {
        const res = await request(app)
        .post('/auth/login')
        .send({
            email: testEmail,
            password: 'testpassword'
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});