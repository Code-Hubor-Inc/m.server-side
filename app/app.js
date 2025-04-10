//handles the core setup of the Express application

const express = require('express');
const app = express();
const indexRoutes = require('../routes/index.routes');

//Mounting all routes
app.use(express.json());
app.use('/api/v1', indexRoutes);

module.exports = app; 