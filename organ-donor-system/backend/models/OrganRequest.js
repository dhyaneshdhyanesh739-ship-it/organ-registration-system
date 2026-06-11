const mongoose = require('mongoose');

const organRequestSchema = new mongoose.Schema(
    {
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
        },
        organType: {
            type: String,
            enum: [
                'Heart',
                'Liver',
                'Kidneys',
                'Lungs',
                'Pancreas',
                'Intestines',
                'Corneas',
                'Skin',
                'Bone',
                'Heart Valves',
                'Blood Vessels',
            ],
            required: [true, 'Organ type is required'],
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: [true, 'Blood group is required'],
        },
        urgency: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
            required: [true, 'Urgency level is required'],
            default: 'medium',
        },
        patientDetails: {
            age: {
                type: Number,
                required: true,
                min: 0,
                max: 120,
            },
            gender: {
                type: String,
                enum: ['male', 'female', 'other'],
                required: true,
            },
            medicalCondition: {
                type: String,
                required: true,
            },
            height: { type: Number, min: 0 }, // in cm
            weight: { type: Number, min: 0 }, // in kg
            timeOnWaitlist: {
                type: Number, // in days
                default: 0,
            },
        },
        hlaMarkers: {
            hlaA: { type: String },
            hlaB: { type: String },
            hlaC: { type: String },
            hlaDR: { type: String },
            hlaDQ: { type: String },
            hlaDP: { type: String },
        },
        preferredLocation: {
            maxDistance: {
                type: Number, // in kilometers
                default: 500,
            },
            city: String,
            state: String,
        },
        status: {
            type: String,
            enum: ['pending', 'searching', 'matched', 'completed', 'cancelled', 'expired'],
            default: 'pending',
        },
        matchedDonors: [
            {
                donor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Donor',
                },
                matchScore: {
                    type: Number,
                    min: 0,
                    max: 100,
                },
                distance: {
                    type: Number, // in kilometers
                },
                breakdown: {
                    blood: Number,
                    hla: Number,
                    distance: Number,
                    age: Number,
                    size: Number,
                    urgencyMultiplier: Number,
                },
                matchedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        selectedDonor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donor',
        },
        requestNotes: {
            type: String,
            maxlength: 1000,
        },
        expiryDate: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
organRequestSchema.index({ hospital: 1, status: 1 });
organRequestSchema.index({ organType: 1, bloodGroup: 1, status: 1 });
organRequestSchema.index({ urgency: 1, createdAt: -1 });

// Set expiry date on creation (30 days by default)
organRequestSchema.pre('save', function (next) {
    if (this.isNew && !this.expiryDate) {
        this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('OrganRequest', organRequestSchema);
