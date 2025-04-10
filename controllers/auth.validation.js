// validation schema for authentication-related operations
const validator = require('validator');

module.exports.validateRegisterInput = (data) => {
    const errors = {};

    //check if email is provided and valid
    if (!data.email || !validator.isEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // check if password is provided and meets criteria
    if (!data.password || data.password.length < 8) {
        errors.password = 'Please enter a password with at least 8 characters';
    }

    // Additional validation can be added here: name exist, password confirmation
    return errors;
}; 