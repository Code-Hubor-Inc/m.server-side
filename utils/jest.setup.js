// jest setup
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/parent_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});