const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    emailOTP: {
        type: String,
        required: false
    },
    phoneOTP: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '10m' } // OTP expires after 10 minutes
    }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
