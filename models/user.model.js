//user shcema for the database
//for managing customer and admin accounts

const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
         type: String,
         required: true,
         index: true,
         validate: [function(value) {
            return value.trim() !== '';
         }, 'Username cannot be empty'] 
      },
    email: { 
        type: String,
         required: true,
         unique: true,
         index: true,
         validate: [function(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
         }, 'Invalid email address'] 
      },
    password: {
         type: String,
         required: true,
         minlenght: 8,
         },
    role: { type: String, enum: ['customer', /*'transporter'*/, 'admin'], default: 'customer'},
    date: { type: Date, default: Date.now }
});

//hashing middleware
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);