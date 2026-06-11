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
        taxId: {
            type: String,
        },
        npiNumber: {
            type: String,
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
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere',
            },
        },
        contactPerson: {
            name: { type: String, required: true },
            designation: { type: String, required: true },
            phone: { type: String, required: true, match: [/^[0-9]{10}$/, 'Invalid phone number'] },
            email: { type: String, required: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
        },
        facilities: [String],
        specializations: [String],
        facilityChecklist: {
            patientBeds: { type: Number, default: 0 },
            adaAccessible: { type: Boolean, default: false },
            emergencyExitsMarked: { type: Boolean, default: false },
            fireSafetyUpToDate: { type: Boolean, default: false },
            backupGeneratorFunctional: { type: Boolean, default: false },
            wasteDisposalProtocols: { type: Boolean, default: false },
            staffCredentialsVerified: { type: Boolean, default: false },
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
