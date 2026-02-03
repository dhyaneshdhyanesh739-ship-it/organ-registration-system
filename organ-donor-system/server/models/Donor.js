const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
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
        organsForDonation: {
            type: [String],
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
            required: [true, 'Please select at least one organ'],
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: 'At least one organ must be selected',
            },
        },
        medicalHistory: {
            chronicDiseases: [String],
            currentMedications: [String],
            allergies: [String],
            surgeries: [String],
            smokingStatus: {
                type: String,
                enum: ['never', 'former', 'current'],
                default: 'never',
            },
            alcoholConsumption: {
                type: String,
                enum: ['never', 'occasional', 'regular'],
                default: 'never',
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
        biometrics: {
            height: { type: Number, min: 0 }, // in cm
            weight: { type: Number, min: 0 }, // in kg
        },
        idProof: {
            type: {
                type: String,
                enum: ['aadhaar', 'passport', 'driving_license', 'voter_id'],
                required: true,
            },
            number: {
                type: String,
                required: true,
            },
            documentUrl: {
                type: String,
                required: true,
            },
            cloudinaryId: String,
        },
        consentGiven: {
            type: Boolean,
            default: false,
            required: true,
        },
        consentDate: {
            type: Date,
        },
        emergencyContact: {
            name: { type: String, required: true },
            relationship: { type: String, required: true },
            phone: {
                type: String,
                required: true,
                match: [/^[0-9]{10}$/, 'Invalid phone number'],
            },
        },
        donationStatus: {
            type: String,
            enum: ['active', 'inactive', 'matched', 'completed'],
            default: 'inactive',
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for location-based queries
donorSchema.index({ location: '2dsphere' });
donorSchema.index({ bloodGroup: 1, donationStatus: 1 });

// Update lastUpdated on save
donorSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    if (this.consentGiven && !this.consentDate) {
        this.consentDate = Date.now();
    }
    if (this.consentGiven && this.isModified('consentGiven')) {
        this.donationStatus = 'active';
    }
    next();
});

// Virtual for age
donorSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

donorSchema.set('toJSON', { virtuals: true });
donorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Donor', donorSchema);
