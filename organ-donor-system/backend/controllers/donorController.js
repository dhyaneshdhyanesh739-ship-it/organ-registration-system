const Donor = require('../models/Donor');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const ReceiverRequest = require('../models/ReceiverRequest');
const OrganRequest = require('../models/OrganRequest');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { sendDonorWelcomeEmail } = require('../utils/emailService');

/**
 * @route   POST /api/donor/profile
 * @desc    Create donor profile
 * @access  Private (Donor only)
 */
const createDonorProfile = async (req, res, next) => {
    try {
        // Check if profile already exists
        const existingProfile = await Donor.findOne({ user: req.user._id });
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Donor profile already exists',
            });
        }

        const donorData = { ...req.body, user: req.user._id };

        // Parse JSON strings from FormData
        const jsonFields = [
            'address',
            'organsForDonation',
            'medicalHistory',
            'hlaMarkers',
            'biometrics',
            'idProof',
            'emergencyContact',
            'location',
        ];

        jsonFields.forEach((field) => {
            if (typeof req.body[field] === 'string') {
                try {
                    donorData[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    console.error(`Failed to parse ${field}:`, e);
                }
            }
        });

        // Set default consent if creating profile
        donorData.consentGiven = true;
        donorData.consentDate = new Date();
        donorData.donationStatus = 'active';

        // Handle file upload if present
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'donor-documents');
            donorData.idProof = {
                ...donorData.idProof,
                documentUrl: uploadResult.url,
                cloudinaryId: uploadResult.publicId,
            };
        }

        const donor = await Donor.create(donorData);

        // Send welcome email
        await sendDonorWelcomeEmail(req.user.email, req.user.fullName);

        // Create audit log
        await AuditLog.create({
            user: req.user._id,
            action: 'donor_create',
            entityType: 'Donor',
            entityId: donor._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Donor profile created successfully',
            donor,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/donor/profile
 * @desc    Get donor profile
 * @access  Private (Donor only)
 */
const getDonorProfile = async (req, res, next) => {
    try {
        const donor = await Donor.findOne({ user: req.user._id }).populate(
            'user',
            'firstName lastName email phone isVerified'
        );

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor profile not found',
            });
        }

        res.json({
            success: true,
            donor,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/donor/profile
 * @desc    Update donor profile
 * @access  Private (Donor only)
 */
const updateDonorProfile = async (req, res, next) => {
    try {
        let donor = await Donor.findOne({ user: req.user._id });

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor profile not found',
            });
        }

        // Parse JSON strings from FormData
        const jsonFields = [
            'address',
            'organsForDonation',
            'medicalHistory',
            'hlaMarkers',
            'biometrics',
            'idProof',
            'emergencyContact',
            'location',
        ];

        jsonFields.forEach((field) => {
            if (typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    console.error(`Failed to parse ${field}:`, e);
                }
            }
        });

        // Handle file upload if present
        if (req.file) {
            // Delete old file if exists
            if (donor.idProof?.cloudinaryId) {
                await deleteFromCloudinary(donor.idProof.cloudinaryId);
            }

            const uploadResult = await uploadToCloudinary(req.file.buffer, 'donor-documents');
            req.body.idProof = {
                ...req.body.idProof,
                documentUrl: uploadResult.url,
                cloudinaryId: uploadResult.publicId,
            };
        }

        donor = await Donor.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        // Create audit log
        await AuditLog.create({
            user: req.user._id,
            action: 'donor_update',
            entityType: 'Donor',
            entityId: donor._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            donor,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/donor/consent
 * @desc    Update consent status
 * @access  Private (Donor only)
 */
const updateConsent = async (req, res, next) => {
    try {
        const { consentGiven } = req.body;

        const donor = await Donor.findOne({ user: req.user._id });

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor profile not found',
            });
        }

        donor.consentGiven = consentGiven;
        donor.donationStatus = consentGiven ? 'active' : 'inactive';
        if (consentGiven) {
            donor.consentDate = new Date();
        }

        await donor.save();

        // Create audit log
        await AuditLog.create({
            user: req.user._id,
            action: consentGiven ? 'donor_consent_given' : 'donor_consent_revoked',
            entityType: 'Donor',
            entityId: donor._id,
            details: { consentGiven },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: `Consent ${consentGiven ? 'given' : 'revoked'} successfully`,
            donor,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/donor/stats
 * @desc    Get donor statistics
 * @access  Private (Donor only)
 */
const getDonorStats = async (req, res, next) => {
    try {
        const donor = await Donor.findOne({ user: req.user._id });

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor profile not found',
            });
        }

        const stats = {
            donationStatus: donor.donationStatus,
            organsRegistered: donor.organsForDonation.length,
            consentGiven: donor.consentGiven,
            consentDate: donor.consentDate,
            profileVerified: req.user.isVerified,
        };

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/donor/activity
 * @desc    Get donor activity history
 * @access  Private (Donor only)
 */
const getDonorActivity = async (req, res, next) => {
    try {
        const activity = await AuditLog.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            activity,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/donor/history
 * @desc    Get donor donation history
 * @access  Private (Donor only)
 */
const getDonationHistory = async (req, res, next) => {
    try {
        const donor = await Donor.findOne({ user: req.user._id });

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor profile not found',
            });
        }

        // Fetch from ReceiverRequest (Direct receiver flow)
        const receiverRequests = await ReceiverRequest.find({
            matchedDonor: donor._id,
            status: { $in: ['approved', 'completed'] },
        })
            .populate('receiver', 'firstName lastName email')
            .lean();

        // Fetch from OrganRequest (Hospital flow)
        const organRequests = await OrganRequest.find({
            selectedDonor: donor._id,
            status: { $in: ['matched', 'completed'] },
        })
            .populate({
                path: 'hospital',
                select: 'hospitalName',
            })
            .lean();

        // Unify the data
        const unifiedHistory = [
            ...receiverRequests.map(req => ({
                id: req._id,
                organType: req.organType,
                recipientName: req.receiver ? `${req.receiver.firstName} ${req.receiver.lastName}` : 'Direct Receiver',
                recipientType: 'Receiver',
                status: req.status,
                date: req.updatedAt,
            })),
            ...organRequests.map(req => ({
                id: req._id,
                organType: req.organType,
                recipientName: req.hospital?.hospitalName || 'Hospital Patient',
                recipientType: 'Hospital',
                status: req.status,
                date: req.updatedAt,
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            history: unifiedHistory,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDonorProfile,
    getDonorProfile,
    updateDonorProfile,
    updateConsent,
    getDonorStats,
    getDonorActivity,
    getDonationHistory,
};
