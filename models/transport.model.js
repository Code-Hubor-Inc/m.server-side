/**
 * @transport shcema
 * to stre details about available transport options ie trucks, vans.
 */

const mongoose = require('mongoose');
const { transportTypes, transportStatus, maintenanceTypes } = require('../constants/transport.enum');

const TransportSchema = new mongoose.Schema({
   vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      uppercase: true,
      tirm: true,
      validate: {
         validator: function(v) {
            return /^[A-Z0-9]{3,15}$/.test(v);
         },
         message: 'Vehicle number must be 3-15 alpanumeric characters'
      }
   },
   type: {
      type: String,
      enum: Object.values(transportTypes),
      required: [true, 'Transport type is required'],
      index: true
   },
   make : {
      type: String,
      required: [true, 'Make is required'],
      trim: true
   },
   model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
   },
   year: {
      type: String,
      min: [1900, 'Invalid year'],
      max: [new Date().getFullYear(), 'Invalid year']
   },
   capacity: {
      weight: {
         type: Number,
         required: [true, 'Weight capacity is required'],
         min: [0, 'Weight cannot be negative']
      },
      volume: { // in cubic metrics 
         type: Number,
         required: [true, 'Volume capacity is required'],
         min: [0, 'Capacity cannot be negative']
      },
      passengers: {
         type: Number,
         min: [0, 'Passenger cannot be negative']
      }
   },
   status: {
      type: String,
      enum: Object.values(transportStatus),
      default: transportStatus.AVAILABLE,
      index: true
   },
   currentLocation: {
      type: {
         type: String,
         default: 'Point',
         enum: ['Point']
      },
      cordinates: {
         type: [Number],
         required: function() { return this.status === transportStatus.IN_USE; },
         validate: {
            validator: validateCoordinates,
            message: 'Invalid coordinates provided'
         }
      },
      address: String,
      updateAt: Date,
   },
   driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      validate: {
         validator: async function(v) {
            if (!v) return true; // No driver assigned
            const user = await mongoose.model('User').findById(v);
            return user && user.role === 'driver';
         },
         message: 'Driver must be a user with a driver role'
      }
   },
   maintenanceRecords: [{
      type: {
         type: String,
         enum: Object.values(maintenanceTypes),
         required: true
      },
      date: {
         type: Date,
         default: Date.now
      },
      milage: Number,
      cost: Number,
      description: String,
      performedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      nextService: Date
   }],
   insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
      coverage: String
   },
   features: [{
      type: String,
      trim: true
   }],
   isActive: {
      type: Boolean,
      default: true, 
      index: true
   }
}, {
   timestanp: true,
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
});

// Indexes
TransportSchema.index({ vehicleNumber: 1 }, { unique: true });
TransportSchema.index({ currentLocation: '2dsphere' });
TransportSchema.index({ status: 1, type: 1 });
TransportSchema.index({ driver: 1, status: 1 });

// Virtauls populate
TransportSchema.virtual('driverDetails', {
   ref: 'User',
   localField: 'driver',
   foreignField: '_id',
   justOne: false,
   match: { status: { $in: ['confirmed', 'in_progress'] } }
});

TransportSchema.virtual('bookings', {
   ref: 'Booking',
   localField: '_id',
   foreignField: 'transport',
   justOne: false
});

TransportSchema.virtual('activeRecord', {
   ref: 'Booking',
   localField: '_id',
   foreignField: 'transport',
   justOne: false,
   match: { status: 'In_progress' }
});

// Helper function for coordinate validation
function validateCoordinates(value) {
   return coords.length === 2 &&
      coords[0] >= -180 && coords[0] <= 180 &&
      coords[1] >= -90 && coords[1] <= 90;
}

// Pre-save hook to update location timestamp
TransportSchema.pre('save', function(next) {
   if (this.isModdified('currentLocation.coordinates')) {
      this.currentLocation.updateAt = new Date();
   }
   next();
})

// Static method for finding available transports
TransportSchema.statics.findAvailable = function(criteria = {}) {
   return this.find({
      ...criteria,
      status: transportStatus.AVAILABLE,
      isActive: true
   });
};

// Instance method to check availability
TransportSchema.methods.isAvailable = function() {
   return this.status === transportStatus.AVAILABLE && this.isActive;
};

module.exports = mongoose.model('Transport', TransportSchema);