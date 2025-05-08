/**
 * @transport controller
 */

const Transport = require('../models/transport.model');
const  User = require('../models/user.model');
const { transportStatus } = require('../constants/transport.enum');
const { clearCache } = require('../utils/redis.cache');

exports.createTransport = async (req, res) => {
    try {
        const transportData = req.body;

        // Validate driver if provided
        if (transportData.driver) {
            const driver = await User.findById(transportData.driver);
            if (!driver || driver.role !== 'driver') {
                return res.status(400).json({ 
                    success: false,
                    message: 'Assigned user must be a driver'
                });
            }
        }

        const transport = await Transport.create(transportData);

        res.status(201).json({
            success: true,
            message: 'Transport created successfully',
            data: transport
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create transport',
            error: error.message
        });
    }
};

exports.getAllTransports = async (req, res) => {
    try {
        const { status, type, available, page = 1, limit = 10 } = req.query;
        const filter = { isActive: true };

        if (status) filter.status = status;
        if (type) filter.type = type;
        if (available) filter.status = transportStatus.AVAILABLE;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { vehicleNumber: 1 },
            populate: 'driverDetails'
        };

        const transports = await Transport.paginate(filter, options);

        res.status(200).json({
            success: true,
            message: 'Transports retrieved successfully',
            data: transports
        });

    } catch(error) {
        res.status(400).json({
            success: false,
            message: 'Failed to retrieve transports',
            error: error.message
        });
    }
};

exports.getTransportById = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id)
            .populate('driverDetails', 'name email phone')
            .populate('bookings', 'pickupLocation dropoffLocation status')
            .populate('activeBookings');

        if (!transport) {
            return res.status(404).json({
                success: false,
                message: 'Transport not found'
            });
        }

        res.status(200).json({
            success: true,
            data: transport
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching transport',
            error: error.message
        });
    }
};

exports.updateTransport = async (req, res) => {
    try {
        const updates = req.body;
        const transport = await Transport.findById(req.params.id);

        if (!transport) {
            return res.status(404).json({
                success: false,
                message: 'Transport not found'
            });
        }

        // Validate driver if being updated
        if (updates.driver) {
            const driver = await User.findById(updates.driver);
            if (!driver || driver.role !== 'driver') {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned user must be a driver'
                });
            }
        }

        Object.keys(updates).forEach(key => {
            transport[key] = updates[key];
        });

        await transport.save();
        clearCache(`transport:${transport._id}`);

        res.status(200).json({
            success: true,
            message: 'Transport updated successfully',
            data: transport
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update transport',
            error: error.message
        });
    }
};

exports.deactivateTransport = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id);

        if (!transport) {
            return res.status(404).json({
                success: false,
                message: 'Transport not found'
            });
        }

        // Check if transport has active bookings
        const activeBookings = await mongoose.model('Booking').countDocuments({
            transport: transport._id,
            status: { $in: ['confirmed', 'in_progress'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate transport with active bookings'
            });
        }

        transport.isActive = false;
        transport.status = transportStatus.OUT_OF_SERVICE;
        await transport.save();

        clearCache(`transport:${transport._id}`);

        res.status(200).json({
            success: true,
            message: 'Transport deactivated successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deactivating transport',
            error: error.message
        });
    }
};

exports.addMaintenanceRecord = async (req, res) => {
    try {
        const { maintenanceType, mileage, cost, description } = req.body;
        const transport = await Transport.findById(req.params.id);

        if (!transport) {
            return res.status(404).json({
                success: false,
                message: 'Transport not found'
            });
        }

        transport.maintenanceRecords.push({
            type: maintenanceType,
            mileage,
            cost,
            description,
            performedBy: req.user._id
        });

        // Update status if needed
        if (maintenanceType === 'repair') {
            transport.status = transportStatus.MAINTENANCE;
        }

        await transport.save();
        clearCache(`transport:${transport._id}`);

        res.status(200).json({
            success: true,
            message: 'Maintenance record added',
            data: transport
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to add maintenance record',
            error: error.message
        });
    }
};

// for validating coordinates
exports.validateCoordinates = (req, res, next) => {
    const { lat, lng } = req.query;

    const isValidateLatitude = (val) => !isNaN(val) && val >= -90 && val <= 90;
    const isValidateLongotude = (val) => !isNaN(val) && val >= -180 && val <= 180;

    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: 'Latitude and Longotude are required'
        });
    }

    if (!isValidateLatitude(Number(lat)) || !isValidateLongotude(Number(lng))) {
        return res.status(400).json({
            sucess: false,
            message: 'Invalid latitude or longitude values'
        });
    }

    next();
}

exports.findNearbyTransports = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 10000 } = req.query; // Default 10km
        
        if (!longitude || !latitude) {
            return res.status(400).json({
                success: false,
                message: 'Longitude and latitude are required'
            });
        }

        const transports = await Transport.find({
            status: transportStatus.AVAILABLE,
            isActive: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).limit(20);

        res.status(200).json({
            success: true,
            data: transports
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error finding nearby transports',
            error: error.message
        });
    }
};