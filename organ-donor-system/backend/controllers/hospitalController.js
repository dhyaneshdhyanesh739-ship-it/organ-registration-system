const Hospital = require('../models/Hospital');
const OrganRequest = require('../models/OrganRequest');
const PatientDonor = require('../models/PatientDonor');
const AuditLog = require('../models/AuditLog');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendOrganRequestNotification } = require('../utils/emailService');

/**
 * @route   POST /api/hospital/profile
 * @desc    Create hospital profile
 * @access  Private (Hospital only)
 */
const createHospitalProfile = async (req, res, next) => {
    try {
        const existingProfile = await Hospital.findOne({ user: req.user._id });
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Hospital profile already exists',
            });
        }

        const hospitalData = { ...req.body, user: req.user._id };

        // Parse JSON strings from FormData
        const jsonFields = ['address', 'contactPerson', 'facilities', 'specializations', 'facilityChecklist'];
        jsonFields.forEach((field) => {
            if (typeof req.body[field] === 'string') {
                try {
                    hospitalData[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    console.error(`Failed to parse ${field}:`, e);
                }
            }
        });

        // Cleanup location if it has no coordinates to avoid 2dsphere index errors
        if (hospitalData.location && (!hospitalData.location.coordinates || hospitalData.location.coordinates.length === 0)) {
            delete hospitalData.location;
        }

        // Handle file upload for registration certificate
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'hospital-documents');
            hospitalData.documents = {
                registrationCertificate: {
                    url: uploadResult.url,
                    cloudinaryId: uploadResult.publicId,
                },
            };
        }

        const hospital = await Hospital.create(hospitalData);

        await AuditLog.create({
            user: req.user._id,
            action: 'hospital_create',
            entityType: 'Hospital',
            entityId: hospital._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Hospital profile created successfully. Awaiting verification.',
            hospital,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/hospital/profile
 * @desc    Get hospital profile
 * @access  Private (Hospital only)
 */
const getHospitalProfile = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id }).populate(
            'user',
            'firstName lastName email phone isVerified'
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        res.json({
            success: true,
            hospital,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/hospital/profile
 * @desc    Update hospital profile
 * @access  Private (Hospital only)
 */
const updateHospitalProfile = async (req, res, next) => {
    try {
        // Parse JSON strings from FormData
        const jsonFields = ['address', 'contactPerson', 'facilities', 'specializations', 'facilityChecklist'];
        jsonFields.forEach((field) => {
            if (typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (e) {
                    console.error(`Failed to parse ${field}:`, e);
                }
            }
        });

        // Cleanup location if it has no coordinates to avoid 2dsphere index errors
        if (req.body.location && (!req.body.location.coordinates || req.body.location.coordinates.length === 0)) {
            delete req.body.location;
        }

        const hospital = await Hospital.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        await AuditLog.create({
            user: req.user._id,
            action: 'hospital_update',
            entityType: 'Hospital',
            entityId: hospital._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            hospital,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/hospital/request
 * @desc    Create organ request
 * @access  Private (Hospital only)
 */
const createOrganRequest = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        if (hospital.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Hospital must be verified to create organ requests',
            });
        }

        const request = await OrganRequest.create({
            ...req.body,
            hospital: hospital._id,
        });

        // Update hospital stats
        hospital.activeRequests += 1;
        hospital.totalRequests += 1;
        await hospital.save();

        // Send notification email
        await sendOrganRequestNotification(
            req.user.email,
            hospital.hospitalName,
            request.organType,
            request._id
        );

        await AuditLog.create({
            user: req.user._id,
            action: 'organ_request_create',
            entityType: 'OrganRequest',
            entityId: request._id,
            details: { organType: request.organType, bloodGroup: request.bloodGroup },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Organ request created successfully',
            request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/hospital/requests
 * @desc    Get all hospital requests
 * @access  Private (Hospital only)
 */
const getHospitalRequests = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        const requests = await OrganRequest.find({ hospital: hospital._id })
            .populate('selectedDonor', 'bloodGroup organsForDonation')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/hospital/request/:id
 * @desc    Get single request with matches
 * @access  Private (Hospital only)
 */
const getRequestById = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        const request = await OrganRequest.findOne({
            _id: req.params.id,
            hospital: hospital._id,
        }).populate({
            path: 'matchedDonors.donor',
            select: 'bloodGroup organsForDonation age address.city address.state',
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        res.json({
            success: true,
            request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/hospital/request/:id/cancel
 * @desc    Cancel organ request
 * @access  Private (Hospital only)
 */
const cancelRequest = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });

        const request = await OrganRequest.findOne({
            _id: req.params.id,
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
                message: 'Request cannot be cancelled',
            });
        }

        request.status = 'cancelled';
        request.cancelledAt = new Date();
        request.cancellationReason = req.body.reason;
        await request.save();

        // Update hospital stats
        hospital.activeRequests = Math.max(0, hospital.activeRequests - 1);
        await hospital.save();

        await AuditLog.create({
            user: req.user._id,
            action: 'organ_request_cancel',
            entityType: 'OrganRequest',
            entityId: request._id,
            details: { reason: req.body.reason },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Request cancelled successfully',
            request,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/hospital/patient-donor
 * @desc    Register a new patient as a donor (hospital fast-track)
 * @access  Private (Hospital only)
 */
const registerPatientDonor = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        const patientDonor = await PatientDonor.create({
            ...req.body,
            hospital: hospital._id,
        });

        await AuditLog.create({
            user: req.user._id,
            action: 'patient_donor_register',
            entityType: 'PatientDonor',
            entityId: patientDonor._id,
            details: { name: `${patientDonor.firstName} ${patientDonor.lastName}` },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Patient Donor registered successfully',
            patientDonor,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/hospital/patient-donors
 * @desc    Get all patient donors registered by this hospital
 * @access  Private (Hospital only)
 */
const getPatientDonors = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital profile not found',
            });
        }

        const patientDonors = await PatientDonor.find({ hospital: hospital._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: patientDonors.length,
            patientDonors,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/hospital/activity
 * @desc    Get hospital activity logs
 * @access  Private (Hospital only)
 */
const getHospitalActivity = async (req, res, next) => {
    try {
        const activity = await AuditLog.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            count: activity.length,
            activity,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createHospitalProfile,
    getHospitalProfile,
    updateHospitalProfile,
    createOrganRequest,
    getHospitalRequests,
    getRequestById,
    cancelRequest,
    getHospitalActivity,
    registerPatientDonor,
    getPatientDonors,
};
