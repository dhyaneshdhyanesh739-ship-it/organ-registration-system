const mongoose = require('mongoose');

const receiverRequestSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organType: {
            type: String,
            required: [true, 'Organ type is required'],
        },
        bloodGroup: {
            type: String,
            required: [true, 'Blood group is required'],
        },
        urgency: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
            required: [true, 'Urgency level is required'],
        },
        notes: {
            type: String,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending',
        },
        matchedDonor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donor',
        },
        approvedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
receiverRequestSchema.index({ receiver: 1, status: 1 });
receiverRequestSchema.index({ organType: 1, bloodGroup: 1, status: 1 });

module.exports = mongoose.model('ReceiverRequest', receiverRequestSchema);
