const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const OrganRequest = require('../models/OrganRequest');
const AuditLog = require('../models/AuditLog');
const { findMatchingDonors } = require('../utils/matchingAlgorithm');
const { sendMatchFoundNotification } = require('../utils/emailService');

/**
 * @route   POST /api/matching/find/:requestId
 * @desc    Find matching donors for a request
 * @access  Private (Hospital only)
 */
const findMatches = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        const request = await OrganRequest.findOne({
            _id: req.params.requestId,
            hospital: hospital._id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        if (request.status === 'completed' || request.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot find matches for completed or cancelled requests',
            });
        }

        // Find matching donors
        const matches = await findMatchingDonors(Donor, request, hospital.location);

        // Update request with matches
        request.matchedDonors = matches.map((match) => ({
            donor: match.donor,
            matchScore: match.matchScore,
            distance: match.distance,
            breakdown: match.breakdown,
        }));

        request.status = matches.length > 0 ? 'matched' : 'searching';
        await request.save();

        // Send notification if matches found
        if (matches.length > 0) {
            await sendMatchFoundNotification(
                req.user.email,
                hospital.hospitalName,
                request.organType,
                matches.length
            );

            await AuditLog.create({
                user: req.user._id,
                action: 'match_found',
                entityType: 'OrganRequest',
                entityId: request._id,
                details: { matchCount: matches.length },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
        }

        res.json({
            success: true,
            message: `Found ${matches.length} matching donor(s)`,
            matchCount: matches.length,
            matches: matches.map((m) => ({
                matchScore: m.matchScore,
                distance: m.distance,
                breakdown: m.breakdown,
                bloodGroup: m.donorDetails.bloodGroup,
                age: m.donorDetails.age,
                city: m.donorDetails.address.city,
                state: m.donorDetails.address.state,
            })),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/matching/request/:requestId/matches
 * @desc    Get matches for a request
 * @access  Private (Hospital only)
 */
const getMatches = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        const request = await OrganRequest.findOne({
            _id: req.params.requestId,
            hospital: hospital._id,
        }).populate({
            path: 'matchedDonors.donor',
            select: 'bloodGroup organsForDonation age address.city address.state gender',
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        res.json({
            success: true,
            matchCount: request.matchedDonors.length,
            matches: request.matchedDonors,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/matching/accept/:requestId/:donorId
 * @desc    Accept a match for a request
 * @access  Private (Hospital only)
 */
const acceptMatch = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        const request = await OrganRequest.findOne({
            _id: req.params.requestId,
            hospital: hospital._id,
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        if (request.status !== 'matched' && request.status !== 'searching') {
            return res.status(400).json({
                success: false,
                message: 'Can only accept matches for active requests',
            });
        }

        const donor = await Donor.findById(req.params.donorId).populate('user');
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found',
            });
        }

        // Update request
        request.selectedDonor = donor._id;
        request.status = 'completed';
        request.completedAt = new Date();
        await request.save();

        // Update donor status
        donor.donationStatus = 'matched';
        await donor.save();

        // Update hospital stats (optional but good for tracking)
        hospital.successfulMatches = (hospital.successfulMatches || 0) + 1;
        hospital.activeRequests = Math.max(0, (hospital.activeRequests || 1) - 1);
        await hospital.save();

        // Audit Log
        await AuditLog.create({
            user: req.user._id,
            action: 'match_accepted',
            entityType: 'OrganRequest',
            entityId: request._id,
            details: { donorId: donor._id },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Match accepted successfully',
            request,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    findMatches,
    getMatches,
    acceptMatch,
};
