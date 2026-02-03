const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const OrganRequest = require('../models/OrganRequest');
const AuditLog = require('../models/AuditLog');
const { sendVerificationEmail } = require('../utils/emailService');

/**
 * @route   GET /api/admin/analytics
 * @desc    Get system analytics
 * @access  Private (Admin only)
 */
const getAnalytics = async (req, res, next) => {
    try {
        // Total counts
        const totalDonors = await Donor.countDocuments();
        const totalHospitals = await Hospital.countDocuments();
        const totalRequests = await OrganRequest.countDocuments();

        // Active donors
        const activeDonors = await Donor.countDocuments({
            donationStatus: 'active',
            consentGiven: true,
        });

        // Pending verifications
        const pendingDonors = await User.countDocuments({
            role: 'donor',
            isVerified: false,
        });

        const pendingHospitals = await Hospital.countDocuments({
            verificationStatus: 'pending',
        });

        // Request statistics
        const pendingRequests = await OrganRequest.countDocuments({ status: 'pending' });
        const matchedRequests = await OrganRequest.countDocuments({ status: 'matched' });
        const completedRequests = await OrganRequest.countDocuments({ status: 'completed' });

        // Organ distribution
        const organDistribution = await Donor.aggregate([
            { $unwind: '$organsForDonation' },
            { $group: { _id: '$organsForDonation', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Blood group distribution
        const bloodGroupDistribution = await Donor.aggregate([
            { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        // Monthly registrations (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRegistrations = await Donor.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Recent activity
        const recentActivity = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'firstName lastName role');

        res.json({
            success: true,
            analytics: {
                overview: {
                    totalDonors,
                    activeDonors,
                    totalHospitals,
                    totalRequests,
                },
                pending: {
                    donors: pendingDonors,
                    hospitals: pendingHospitals,
                },
                requests: {
                    pending: pendingRequests,
                    matched: matchedRequests,
                    completed: completedRequests,
                },
                organDistribution,
                bloodGroupDistribution,
                monthlyRegistrations,
                recentActivity,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/pending-verifications
 * @desc    Get pending verifications
 * @access  Private (Admin only)
 */
const getPendingVerifications = async (req, res, next) => {
    try {
        const pendingDonors = await Donor.find()
            .populate({
                path: 'user',
                match: { isVerified: false },
                select: 'firstName lastName email phone createdAt',
            })
            .sort({ createdAt: -1 });

        const pendingHospitals = await Hospital.find({
            verificationStatus: 'pending',
        })
            .populate('user', 'firstName lastName email phone createdAt')
            .sort({ createdAt: -1 });

        // Filter out null users (already verified)
        const filteredDonors = pendingDonors.filter((d) => d.user !== null);

        res.json({
            success: true,
            pending: {
                donors: filteredDonors,
                hospitals: pendingHospitals,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/verify-donor/:id
 * @desc    Verify donor
 * @access  Private (Admin only)
 */
const verifyDonor = async (req, res, next) => {
    try {
        const donor = await Donor.findById(req.params.id).populate('user');

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found',
            });
        }

        // Update user verification status
        await User.findByIdAndUpdate(donor.user._id, { isVerified: true });

        // Send verification email
        await sendVerificationEmail(donor.user.email, donor.user.fullName, 'donor');

        await AuditLog.create({
            user: req.user._id,
            action: 'admin_action',
            entityType: 'Donor',
            entityId: donor._id,
            details: { action: 'verify_donor' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Donor verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/verify-hospital/:id
 * @desc    Verify or reject hospital
 * @access  Private (Admin only)
 */
const verifyHospital = async (req, res, next) => {
    try {
        const { status, rejectionReason } = req.body;

        const hospital = await Hospital.findById(req.params.id).populate('user');

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found',
            });
        }

        hospital.verificationStatus = status;
        hospital.verifiedBy = req.user._id;
        hospital.verifiedAt = new Date();

        if (status === 'rejected') {
            hospital.rejectionReason = rejectionReason;
        } else if (status === 'verified') {
            await User.findByIdAndUpdate(hospital.user._id, { isVerified: true });
            await sendVerificationEmail(hospital.user.email, hospital.hospitalName, 'hospital');
        }

        await hospital.save();

        await AuditLog.create({
            user: req.user._id,
            action: status === 'verified' ? 'hospital_verified' : 'hospital_rejected',
            entityType: 'Hospital',
            entityId: hospital._id,
            details: { status, rejectionReason },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: `Hospital ${status} successfully`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private (Admin only)
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, action, userId } = req.query;

        const query = {};
        if (action) query.action = action;
        if (userId) query.user = userId;

        const logs = await AuditLog.find(query)
            .populate('user', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { role, isVerified } = req.query;

        const query = {};
        if (role) query.role = role;
        if (isVerified !== undefined) query.isVerified = isVerified === 'true';

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnalytics,
    getPendingVerifications,
    verifyDonor,
    verifyHospital,
    getAuditLogs,
    getAllUsers,
};
