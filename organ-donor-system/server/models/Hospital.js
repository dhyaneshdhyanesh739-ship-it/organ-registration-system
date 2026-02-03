const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        hospitalName: {
            type: String,
            required: [true, 'Hospital name is required'],
            trim: true,
        },
        registrationNumber: {
            type: String,
            required: [true, 'Registration number is required'],
            unique: true,
            trim: true,
        },
        hospitalType: {
            type: String,
            enum: ['government', 'private', 'trust'],
            required: [true, 'Hospital type is required'],
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true, match: [/^[0-9]{6}$/, 'Invalid pincode'] },
            country: { type: String, default: 'India' },
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere',
            },
        },
        contactDetails: {
            landline: {
                type: String,
                match: [/^[0-9]{10,12}$/, 'Invalid landline number'],
            },
            emergencyNumber: {
                type: String,
                required: true,
                match: [/^[0-9]{10}$/, 'Invalid emergency number'],
            },
            email: {
                type: String,
                required: true,
                match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
            },
        },
        facilities: {
            hasTransplantUnit: {
                type: Boolean,
                default: false,
            },
            hasICU: {
                type: Boolean,
                default: false,
            },
            bedCapacity: {
                type: Number,
                min: 0,
            },
            specializations: [String],
        },
        documents: {
            registrationCertificate: {
                url: { type: String, required: true },
                cloudinaryId: String,
            },
            accreditationCertificate: {
                url: String,
                cloudinaryId: String,
            },
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        verifiedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
        },
        activeRequests: {
            type: Number,
            default: 0,
        },
        totalRequests: {
            type: Number,
            default: 0,
        },
        successfulMatches: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for location-based queries
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
