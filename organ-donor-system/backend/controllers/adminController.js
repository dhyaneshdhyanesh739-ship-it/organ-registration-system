const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const PatientDonor = require('../models/PatientDonor');
const OrganRequest = require('../models/OrganRequest');
const ReceiverRequest = require('../models/ReceiverRequest');
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
        const totalReceivers = await User.countDocuments({ role: 'receiver' });

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

        const pendingReceivers = await User.countDocuments({
            role: 'receiver',
            isVerified: false,
        });

        const pendingHospitals = await Hospital.countDocuments({
            verificationStatus: 'pending',
        });

        // Request statistics (Combined Receiver and Hospital requests)
        const pendingReceiverReqs = await ReceiverRequest.countDocuments({ status: 'pending' });
        const pendingHospitalReqs = await OrganRequest.countDocuments({ status: 'pending' });
        
        const matchedReceiverReqs = await ReceiverRequest.countDocuments({ status: 'approved' });
        const matchedHospitalReqs = await OrganRequest.countDocuments({ status: 'matched' });
        
        const completedReceiverReqs = await ReceiverRequest.countDocuments({ status: 'completed' });
        const completedHospitalReqs = await OrganRequest.countDocuments({ status: 'completed' });

        const pendingRequests = pendingReceiverReqs + pendingHospitalReqs;
        const matchedRequests = matchedReceiverReqs + matchedHospitalReqs;
        const completedRequests = completedReceiverReqs + completedHospitalReqs;
        const totalRequests = await ReceiverRequest.countDocuments() + await OrganRequest.countDocuments();

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
                    totalReceivers,
                    totalRequests,
                },
                pending: {
                    donors: pendingDonors,
                    receivers: pendingReceivers,
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

        const pendingReceivers = await User.find({
            role: 'receiver',
            isVerified: false,
        })
            .select('firstName lastName email phone createdAt')
            .sort({ createdAt: -1 });

        const pendingReceiverRequests = await ReceiverRequest.find({
            status: 'pending',
        })
            .populate('receiver', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .lean();

        const pendingHospitalRequests = await OrganRequest.find({
            status: 'pending',
        })
            .populate('hospital', 'hospitalName')
            .sort({ createdAt: -1 })
            .lean();

        const matchedReceiverRequests = await ReceiverRequest.find({
            status: 'approved',
        })
            .populate('receiver', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .lean();

        const matchedHospitalRequests = await OrganRequest.find({
            status: 'matched',
        })
            .populate('hospital', 'hospitalName')
            .sort({ createdAt: -1 })
            .lean();

        // Normalize data for frontend
        const normalizedPending = [
            ...pendingReceiverRequests.map(req => ({
                ...req,
                requestType: 'receiver',
                requesterName: req.receiver ? `${req.receiver.firstName} ${req.receiver.lastName}` : 'Unknown Receiver',
            })),
            ...pendingHospitalRequests.map(req => ({
                ...req,
                requestType: 'hospital',
                requesterName: req.hospital?.hospitalName || 'Unknown Hospital',
            }))
        ];

        const normalizedMatched = [
            ...matchedReceiverRequests.map(req => ({
                ...req,
                requestType: 'receiver',
                requesterName: req.receiver ? `${req.receiver.firstName} ${req.receiver.lastName}` : 'Unknown Receiver',
            })),
            ...matchedHospitalRequests.map(req => ({
                ...req,
                requestType: 'hospital',
                requesterName: req.hospital?.hospitalName || 'Unknown Hospital',
            }))
        ];

        // Filter out null users (already verified)
        const filteredDonors = pendingDonors.filter((d) => d.user !== null);

        const eligibleDonors = await Donor.find({
            donationStatus: 'active',
            consentGiven: true,
        })
            .populate('user', 'firstName lastName email')
            .select('bloodGroup organsForDonation user');

        res.json({
            success: true,
            pending: {
                donors: filteredDonors,
                receivers: pendingReceivers,
                hospitals: pendingHospitals,
                organRequests: normalizedPending,
                matchedRequests: normalizedMatched,
                eligibleDonors: eligibleDonors, // List of donors available for matching
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/donors
 * @desc    Get all donors
 * @access  Private (Admin only)
 */
const getAllDonors = async (req, res, next) => {
    try {
        const donors = await Donor.find()
            .populate('user', 'firstName lastName email phone createdAt isVerified')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: donors.length,
            donors,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/hospitals
 * @desc    Get all hospitals
 * @access  Private (Admin only)
 */
const getAllHospitals = async (req, res, next) => {
    try {
        const hospitals = await Hospital.find()
            .populate('user', 'firstName lastName email phone createdAt isVerified')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: hospitals.length,
            hospitals,
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
 * @route   PUT /api/admin/verify-receiver/:id
 * @desc    Verify receiver
 * @access  Private (Admin only)
 */
const verifyReceiver = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || user.role !== 'receiver') {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found',
            });
        }

        user.isVerified = true;
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, user.firstName, 'receiver');

        await AuditLog.create({
            user: req.user._id,
            action: 'admin_action',
            entityType: 'User',
            entityId: user._id,
            details: { action: 'verify_receiver' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Receiver verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/approve-receiver-request/:id
 * @desc    Approve a receiver's organ request
 * @access  Private (Admin only)
 */
const approveReceiverRequest = async (req, res, next) => {
    try {
        const { donorId } = req.body;
        
        let request = await ReceiverRequest.findById(req.params.id);
        let requestType = 'ReceiverRequest';

        if (!request) {
            request = await OrganRequest.findById(req.params.id);
            requestType = 'OrganRequest';
        }

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found in Receiver or Hospital systems',
            });
        }

        if (requestType === 'ReceiverRequest') {
            request.status = 'approved';
            request.matchedDonor = donorId;
            request.approvedAt = new Date();
        } else {
            request.status = 'matched';
            request.selectedDonor = donorId;
            request.completedAt = undefined; // Ensure it's not marked as completed yet
        }

        await request.save();

        // Update donor status
        if (donorId) {
            const donor = await Donor.findById(donorId);
            if (donor) {
                donor.donationStatus = 'matched';
                await donor.save();
            }
        }

        await AuditLog.create({
            user: req.user._id,
            action: 'admin_action',
            entityType: requestType,
            entityId: request._id,
            details: { action: 'approve_organ_match', donorId },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Organ request approved successfully',
            request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/complete-receiver-request/:id
 * @desc    Complete a matched organ request
 * @access  Private (Admin only)
 */
const completeReceiverRequest = async (req, res, next) => {
    try {
        let request = await ReceiverRequest.findById(req.params.id);
        let requestType = 'ReceiverRequest';

        if (!request) {
            request = await OrganRequest.findById(req.params.id);
            requestType = 'OrganRequest';
        }

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const donorId = request.matchedDonor || request.selectedDonor;
        if (!donorId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot complete request without a linked donor. Please approve a match first.',
            });
        }

        request.status = 'completed';
        request.completedAt = new Date();
        
        await request.save();

        // Update donor status to completed
        const donor = await Donor.findById(donorId);
        if (donor) {
            donor.donationStatus = 'completed';
            await donor.save();
        }

        await AuditLog.create({
            user: req.user._id,
            action: 'admin_action',
            entityType: requestType,
            entityId: request._id,
            details: { action: 'complete_organ_request' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Organ request marked as completed successfully',
            request,
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

/**
 * @route   GET /api/admin/receivers
 * @desc    Get all receivers
 * @access  Private (Admin only)
 */
const getAllReceivers = async (req, res, next) => {
    try {
        const receivers = await User.find({ role: 'receiver' })
            .select('-password -refreshToken')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: receivers.length,
            receivers,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/patient-donors
 * @desc    Get all hospital-registered patient donors
 * @access  Private (Admin only)
 */
const getAllPatientDonors = async (req, res, next) => {
    try {
        const patientDonors = await PatientDonor.find()
            .populate('hospital', 'hospitalName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: patientDonors.length,
            patientDonors,
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
    verifyReceiver,
    approveReceiverRequest,
    getAuditLogs,
    getAllUsers,
    getAllDonors,
    getAllHospitals,
    getAllReceivers,
    getAllPatientDonors,
    completeReceiverRequest,
};
