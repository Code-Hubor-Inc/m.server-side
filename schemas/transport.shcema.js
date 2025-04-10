//manages trasnport data ie Driver/vehicle
//ensure data integrity when adding, updaing trasnport details
const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    // unique identifier for the transport
    vehicleNumber: {
         type: String,
         required: true,
         unique: true,
         index: true,
         lowercase: true,
         trim: true 
    },
    // reference to the user model representing the driver
    driverId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true 
    },
    // maximum number of passengers the transport can carry
    capacity: {
         type: Number,
         required: true,
         min: [1, 'Capacity must be greater tthan 0'],
         validate: [function(value) {
            return value > 0;
         }, 'Capacity must be greater than 0'] 
    },
    // current status of the transport
    status: {
         type: String,
         enum: ['available', 'in-transit', 'maintenance'],
         default: 'available'
    },
    // array of strings representing the current availability status 
    availability: {
        type: [String],
        default: ['available', 'en-route', 'not-available']
    },
    // addional metadata about the transport
    metadata: {
        type: Object,
        default: {}
    }     
});

module.exports = mongoose.model('Transport', transportSchema); 