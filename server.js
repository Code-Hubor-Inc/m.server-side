const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const indexRouter = require('./routes/index.routes');

const app = express();
const corsOptions = { origin: 'http://localhost:3000'};

// middlwares
app.use(cors(corsOptions));
app.use(express.json());

// centralized routes management 
app.use(indexRouter);

// MongoDB connection string
// const mongoURI = 'mongodb+srv://omarfaraj355:%40parent.test@cluster0.6cp9p.mongodb.net/parentDB?retryWrites=true&w=majority';

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;