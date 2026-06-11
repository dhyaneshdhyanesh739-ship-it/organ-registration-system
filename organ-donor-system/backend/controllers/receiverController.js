const Donor = require('../models/Donor');
const ReceiverRequest = require('../models/ReceiverRequest');
const User = require('../models/User');

/**
 * @route   GET /api/receiver/available-organs
 * @desc    Get list of available organs from active, consenting donors
 * @access  Private (Receiver)
 */
const getAvailableOrgans = async (req, res, next) => {
    try {
        const { organType, bloodGroup } = req.query;

        const query = {
            donationStatus: 'active',
            consentGiven: true,
        };

        if (organType) {
            query.organsForDonation = organType;
        }

        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }

        const donors = await Donor.find(query)
            .populate('user', 'firstName lastName')
            .select('bloodGroup organsForDonation address donationStatus createdAt');

        // Build a flattened list of available organs per donor
        const availableOrgans = [];
        donors.forEach(donor => {
            donor.organsForDonation.forEach(organ => {
                if (!organType || organ === organType) {
                    availableOrgans.push({
                        donorId: donor._id,
                        organType: organ,
                        bloodGroup: donor.bloodGroup,
                        city: donor.address?.city,
                        state: donor.address?.state,
                        registeredAt: donor.createdAt,
                    });
                }
            });
        });

        // Aggregate organ counts
        const organSummary = {};
        availableOrgans.forEach(item => {
            if (!organSummary[item.organType]) {
                organSummary[item.organType] = 0;
            }
            organSummary[item.organType]++;
        });

        res.json({
            success: true,
            total: availableOrgans.length,
            organSummary,
            availableOrgans,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/receiver/request
 * @desc    Submit a new organ need request from a receiver
 * @access  Private (Receiver)
 */
const submitOrganRequest = async (req, res, next) => {
    try {
        const { organType, bloodGroup, urgency, notes } = req.body;

        const request = new ReceiverRequest({
            receiver: req.user._id,
            organType,
            bloodGroup,
            urgency,
            notes,
            status: 'pending',
        });

        await request.save();

        res.status(201).json({
            success: true,
            message: 'Your organ request has been submitted. Our team will match you with a suitable donor.',
            request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/receiver/my-requests
 * @desc    Get all organ requests submitted by the logged-in receiver
 * @access  Private (Receiver)
 */
const getMyRequests = async (req, res, next) => {
    try {
        const requests = await ReceiverRequest.find({ receiver: req.user._id })
            .populate({
                path: 'matchedDonor',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email phone'
                }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            requests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/receiver/organ-summary
 * @desc    Get aggregate count of available organs by type
 * @access  Private (Receiver)
 */
const getOrganSummary = async (req, res, next) => {
    try {
        const donors = await Donor.find({ donationStatus: 'active', consentGiven: true }).select('organsForDonation bloodGroup');

        const organCounts = {};
        const bloodGroupCounts = {};

        donors.forEach(donor => {
            donor.organsForDonation.forEach(organ => {
                organCounts[organ] = (organCounts[organ] || 0) + 1;
            });
            bloodGroupCounts[donor.bloodGroup] = (bloodGroupCounts[donor.bloodGroup] || 0) + 1;
        });

        res.json({
            success: true,
            organCounts,
            bloodGroupCounts,
            totalActiveDonors: donors.length,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableOrgans,
    submitOrganRequest,
    getOrganSummary,
    getMyRequests,
};
