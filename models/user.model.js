const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { userRoles, accountStatus } = require('../constants/user.enum');

const UserSchema = new mongoose.Schema({
    name: {
         type: String,
         required: true,
         trim: true,
         maxlength: [50, 'Name cannot exceed 50 characters'],
         minlength: [2, 'Name must be atleast 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
         validator: function(v) {
            return /^\+?[1-9]\d{1,14}$/.test(v); // E.164 format
         },
         message: 'Please provide a valid phone number with country code'
      }
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Exclude from query results by default
    },
    role: {
      type: String,
      emun: Object.values(userRoles),
      default: userRoles.CUSTOMER,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(accountStatus),
      default: accountStatus.ACTIVE,
      index: true
    },
    avatar: {
      type: String,
      default: 'default-avatar.png'
    },
    transport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transport',
      validate: {
         validator: async function(v) {
            if (!this.role !== 'driver') return true;
            return !!await mongoose.model('Transport').findById(v);
      },
      message: 'Driver must be assigned a valid transport'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
   type: Boolean,
   default: false
  },
  twoFactorEnabled: {
   type: Boolean,
   default: false
  },
  lastLogin: Date,
  loginAttempts: {
   type: Number,
   default: 0
  },
  lockUntil: Date 
}, {
   timestamp: true,
   toJSON: {virtuals: true },
   toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Virtual populate
UserSchema.virtual('bookings', {
   ref: 'Booking',
   localField: '_id',
   foreignField: 'user',
   justOne: false
});

UserSchema.virtual('assignedTransport', {
   ref: 'Transport',
   localField: 'transport',
   foreignField: '_id',
   justOne: false
});

// Middleware
UserSchema.pre('save', async function(next) {
   if (!this.isModified('password')) return next();

   // hashing the password
   this.password = await bcrypt.hash(this.password, 12);

   // set passwordChangedAt
   if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;

   next();
});

// Instance methods
UserSchema.methods.correctPassword = async function(candidatePassword) {
   return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
   if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
      return JWTTimestamp < changedTimestamp;
   }
   return false;
};

UserSchema.methods.createPasswordResetToken = function() {
   const resetToken = crypto.randomBytes(32).toString('hex');
   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
   return resetToken;   
};

UserSchema.methods.isAccountLocked = function() {
   return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', UserSchema);
// module.exports = User;