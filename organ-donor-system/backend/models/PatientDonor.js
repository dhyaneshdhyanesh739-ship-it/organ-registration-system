const mongoose = require('mongoose');

const patientDonorSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
        },
        dateOfBirth: {
            type: Date,
            required: [true, 'Date of birth is required'],
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: [true, 'Gender is required'],
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: [true, 'Blood group is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
        organsForDonation: {
            type: [String],
            required: [true, 'At least one organ must be selected'],
        },
        consentGiven: {
            type: Boolean,
            default: false,
            required: [true, 'Consent verification is required'],
        },
        status: {
            type: String,
            enum: ['active', 'matched', 'completed'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PatientDonor', patientDonorSchema);
