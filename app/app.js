//handles the core setup of the Express application
 
const express = require('express');
const app = express();
const indexRoutes = require('../routes/index.routes');
const bookingRouter = require('../routes/booking.routes')

// configuring cookie parser middleware
// app.use(cookieParser());

//Mounting all routes
app.use(express.json());
app.use('/', indexRoutes);
app.use('/api/v1/booking', bookingRouter);
app.use((req, res, next) => {
    console.log('This runs last');
    next();
});

// Error handling
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message
    });
});


module.exports = app; 