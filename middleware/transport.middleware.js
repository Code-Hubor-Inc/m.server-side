/**
 * @transport middleware
 */

const { body, param, query, validatetionResult } = require('express-validator');
const Transport = require('../models/transport.model');
const { transportTypes, transportStatus, maintenanceTypes } = require('../constants/transport.enum');

exports.validateTransportCreation = [
    body('vehicleNumber')
        .notEmpty().withMessage('vehicle number is required')
        .trim()
        .isLength({ min: 3, max: 15 }).withMessage('Vehicle number must be 3-15 characters'),
    body('type')
        .isIn(Object.values(transportTypes)).withMessage('Invalid transport type'),
    body('make')
        .notEmpty().withMessage('Make is required')
        .trim(),
    body('model')
        .notEmpty().withMessage('Model is required')
        .trim(),
    body('capacity-wight')
        .isFloat({ gt: 0 }).withMessage('Weight capacity must be a positive number'),
    body('driver')
        .optional()
        .isMongoId().withMessage('Invalid driver ID'),
    body('status')
        .optional()
        .isIn(Object.values(transportStatus)).withMessage('Invalid transport status'),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }    
];

exports.validateTransportUpdate = [
    body('vehicleNumber')
        .optional()
        .trim()
        .isLength({ min: 3, max: 15 }).withMessage('Vehicle number must be 3-15 characters'),
    body('type')
        .optional()
        .isIn(Object.values(transportTypes)).withMessage('Invalid transport type'),
    body('status')
        .optional()
        .isIn(Object.values(transportStatus)).withMessage('Invalid tranport status'),
    body('driver')
        .optional()
        .isMongoId().withMessage('Invalid driver ID'),
    body('currentLocation.coordinates')
        .optional()
        .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of two numbers')
        .custom(coords => {
            if (coords.some(isNaN)) throw new Error('Cordinates must be numbers');
            return true;
        }),
        
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }    
];

exports.validateMaintenanceRecord = [
    body('maintenanceTypes')
        .isIn(Object.values(maintenanceTypes)).withMessage('Invalid maintenance type'),
    body('milage')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Milage must be a positive number'),
    body('cost')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Cost must be a positive number'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 500 }).withMessage('Descvritpion must be at least 500 characters'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }    
];

exports.validateCoordinates = [
    query('longitude')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    query('latitude')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    query('maxDistance')
        .optional()
        .isIn({ gt: 0 }).withMessage('Max distance must be a positive number'),
        
    (req, res, next) => {
        const errors = validatetionResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }    
];

exports.checkTransportExists = async (req, res, next) => {
    try {
        const transport = await Transport.findById(req.params.id);
        if (!transport) {
            return res.status(400).json({
                success: false,
                message: 'Transport not found'
            });
        }
        req.transport = transport;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking transport existence',
            error: error.message
        });
    }
};