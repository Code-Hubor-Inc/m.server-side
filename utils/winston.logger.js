//Description: this file is used to create a logger instance that logs errors to a file and the console.
//this logger instance can be imported and used in any file that requires logging.
const winston = require('winston');

const logger = winston.createLoger({
    level: 'error', //only logs errors and high priority logs
    format: winston.fomrat.json(),
    transport: [
        new winston.transports.file({ filename: 'error.logs' }), //save logs in a file
        new winston.transports.console(), //Displays logs in the console
    ]
});

module.exports = logger;

//how its used in code
//const logger = require('./logger); //file path to logger.js

//try {
//   throw new Error('Something went wrong');
// } catch (error) {
// logger.error(error.message)
// } 