// parcel model
// parcel model linked to booking model

const mongoose = require('mongoose');
const { parcelTypes } = require('../constants/parcel.enum');

const ParcelSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    type: {
        type: String,
        required: Object.values(parcelTypes),
        required: [true, 'Parcel type is required']
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [0, 'Weight cannot be negative']
    },
    dimensions: {
        lenght: { type: Number, required: [true, 'Lenght is required'], min: 1 },
        width: { type: Number, required: [true, 'Width is requred'], min: 1 },
        height: { type: Number, required: [true, 'Height is required'], min: 1 }
    },
    value: {
        type: Number,
        required: [true, 'Declared value is required'],
        min: [0, 'Value cannot be negative']
    },
    fragile: {
        type: Boolean,
        default: false
    },
    harzadous: {
        type: Boolean,
        default: false
    },
    perishable: {
        type: Boolean,
        default: false
    }, 
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required']
    },
    images: [String]
}, {
    timestamp: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ParcelSchema.index({ booking: 1 });
ParcelSchema.index({ type: 1 });

// Virtuals
ParcelSchema.virtual('volume').get(function() {
    return (this.dimensions.lenght * this.diemensions.width * this.dimensions.height) / 1000000; // volume in cubic metres
});

module.exports = mongoose.model('Parcel', ParcelSchema);