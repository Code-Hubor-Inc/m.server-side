/** */

const mongoose = require('mongoose');
const { bookingStatus } = require('../constants/status.enum')

const BookingSchema = new mongoose.Schema({
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: [true, 'User reference is required']
      }, 
      transport: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Transport',
         required: [true, 'Transport reference is required']
      },
      pickupLocation: {
         type: String,
         required: [true, 'Pickup location is required'],
         trim: true,
         minlength: [3, 'Dropoff location must be atleast 3 charaters']
      },
      dropoffLocation: {
         type: String,
         required: [true, 'Dropoff location is required'],
         trim: true,
         minlength: [3, 'Dropoff location must be atleast 3 characters']
      },
      bookingDate: {
         type: Date,
         default: Date.now,
         required: true
      }, 
      scheduleDate: {
         type: Date,
         required: [true, 'Schedule date is required']
      },
      status: {
         type: String,
         enum: Object.values(bookingStatus),
         default: bookingStatus. PENDING,
         index: true
      },
      parcels: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Parcel'
      }],
      notes: {
         type: String,
         trim: true,
         maxlength: [500, 'Notes cannot exceed 500 characters']
      }
   }, {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
   })
   
   // Add indexes for frequently queried fields
   BookingSchema.index({ user: 1, status: 1 });
   BookingSchema.index({ transport: 1, scheduleDate: 1 });

   // Virtual population for better performance
   BookingSchema.virtual('parcelDetaisl', {
      ref: 'Parcel',
      localField: 'parcels',
      foreignField: '_id',
      justOne: false //for one to many relationship
   });

module.exports = mongoose.model('Booking', BookingSchema);