module.exports = {
    transportTypes: {
        TRUCK: 'truck',
        VAN: 'van', 
        MOTORBIKE: 'motorbike',
        PICKUP: 'pickup',
        SEDAN: 'sedan',
        SUV: 'suv',
        BUS: 'bus',
        TRAILER: 'trailer'
    },
    transportStatus: {
        AVAILABLE: 'available',
        IN_USE: 'in_use',
        MAINTAINANCE: 'maintenance',
        OUT_OF_SERVICE: 'out_of_service',
        RESERVED: 'reserved'
    },
    maintenanceTypes: {
        ROUTINE: 'routine',
        REPAIR: 'repair',
        INSPECTION: 'inspection',
        UPGRADE: 'upgrade',
        TIRE_CHANGE: 'tire_change',
        OIL_CHANGE: 'oil_change'
    }
};