/**
 * user test
 * 
 */

const request = require('supertest');
const app = require('../app/app');
const mongoose = require('mongoose');
const User = require('../models/user.model');

describe('User API', () => {
    let adminToken, userToken;

    beforeAll(async () => {
        // Create admin user
        await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        // Create regular user
        await User.create({
            name: 'Test User',
            email: 'user@test.com',
            password: 'password123',
            role: 'customer'
        });

        // Get tokens (simplified for example)
        adminToken = 'mock-admin-token';
        userToken = 'mock-user-token';

        // login and grabbing new tokens
        const adminRes = await request(app)
              .post('/api/v1/auth/login')
              .send({ email: 'admin@test.com', password: 'password123' })
              .expect(200);
            adminToken = adminRes.body.token;
            
        const userRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'user@test.com', password: 'password123' })
            .expect(200)
           userToken = userRes.body.token;      
    });

    describe('GET /api/v1/users', () => {
        test('should get all users (admin)', async () => {
            const res = await request(app)
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('PATCH /api/v1/users/update-me', () => {
        test('should update logged-in user details', async () => {
            const res = await request(app)
                .patch('/api/v1/users/update-me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Updated Name' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe('Updated Name');
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });
});