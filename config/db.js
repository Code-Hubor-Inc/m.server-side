//config environment variables
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // loads .env files

const DB_URI = process.env.MONGO_URI; // for development/production 

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    // with the laest Mongoose drivers these options are necessary:
    // useNewUrlParser: true,
    // useUnifiedTopology: true,

    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);

    // Only exit if not in test environment
    
      process.exit(1);
     }
  }
 
module.exports = connectDB;