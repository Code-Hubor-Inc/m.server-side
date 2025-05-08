/**
 * Tracking Schema
 * To track status and location of goods
 * implement this section later once the basic flow is functional
 */
const mongoose = require('mongoose');
const { trackingEvents, trackingStatus } = require('../constants/tracking.enum');
const transport = require('../models/transport.model');

const TrackingSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required'],
        index: true
    },
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transport',
        required: [true, 'Transport reference is required'],
        index: true
    },
    eventType: {
        type: String,
        enum: Object.values(trackingEvents),
        required: [true, 'Event type is required'],
        index: true
    },
    status: {
        type: String,
        enum: Object.values(trackingEvents),
        default: trackingStatus.ACTIVE,
        index: true
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordinates are required'],
            validate: {
                validator: validateCoordinates,
                message: 'Invalid cordianates provided'
            }
        },
        address: {
            type: String, 
            required: [true, 'Address is required'],
            trim: true
            },
            city: String,
            Country: String    
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        ref: 'User',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recorded by reference is required']
    },
    estimatedTimeArrival: {
         type: Date,
         validate: {
            validator: function(v) {
                return v > this.timestamp;
            },
            message: 'ETA must be after current timestamp'
         }
    },
    metadata: {
        speed: {
            type: Number,
            min: 0,
            max: 200,
            set: v => parseFloat(v.toFixed(2))
        },
        batteryLevel: {
            type: Number,
            min: 0,
            max: 100
        },
        odometer: Number,
        temparature: Number
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
TrackingSchema.index({ booking: 1, timestamp: -1 });
TrackingSchema.index({ eventType: 1 });
TrackingSchema.index({ transport, timestamp: -1 });
TrackingSchema.index({ location: '2dsphere' });

// Virtual populate
TrackingSchema.virtual('bookingDetails', {
    ref: 'Booking',
    localField: 'booking',
    foreignField: '_id',
    justOne: true
});

TrackingSchema.virtual('transportDEtails', {
    ref: 'Transport',
    localField: 'transport',
    foreignField: '_id',
    justOne: true
});

TrackingSchema.virtual('recordedByDetails', {
    ref: 'User',
    localField: 'recordedBy',
    foreignField: '_id',
    justOne: true
});

// helper function for cordinate validation
function validateCoordinates(coords) {
    return coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 &&
              coords[1] >= -90 && coords[1] <= 90;
};
// Pre-save hook for ETA calculation
TrackingSchema.pre('save', function(next) {
    if (this.isModified('location') && this.eventType === 'in_transit') {
        // in real app calculate ETA based on the route and current position
        this.estimatedTimeArrival = new Date(Date.now() + 3600000); //default 1 h
    }
})

module.exports = mongoose.model('Tracking', TrackingSchema);