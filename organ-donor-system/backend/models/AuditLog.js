const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                'user_login',
                'user_logout',
                'user_register',
                'donor_create',
                'donor_update',
                'donor_consent_given',
                'donor_consent_revoked',
                'hospital_create',
                'hospital_update',
                'hospital_verified',
                'hospital_rejected',
                'organ_request_create',
                'organ_request_update',
                'organ_request_cancel',
                'match_found',
                'match_selected',
                'admin_action',
                'user_promoted_to_admin',
                'data_export',
                'settings_update',
                'password_reset_request',
                'password_reset_success',
                'google_login',
                'google_register',
                'facebook_login',
                'facebook_register',
                'patient_donor_register',
            ],
        },
        entityType: {
            type: String,
            enum: ['User', 'Donor', 'Hospital', 'OrganRequest', 'System', 'ReceiverRequest', 'PatientDonor'],
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        status: {
            type: String,
            enum: ['success', 'failure', 'warning'],
            default: 'success',
        },
        errorMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
