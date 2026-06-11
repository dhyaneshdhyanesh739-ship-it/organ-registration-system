const express = require('express');
const {
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
} = require('../controllers/hospitalController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

// All routes require authentication and hospital role
router.use(authenticate);
router.use(roleCheck(['hospital']));

// Profile routes
router.post('/profile', upload.single('registrationCertificate'), createHospitalProfile);
router.get('/profile', getHospitalProfile);
router.put('/profile', updateHospitalProfile);

// Request routes
router.post('/request', createOrganRequest);
router.get('/requests', getHospitalRequests);
router.get('/request/:id', getRequestById);
router.put('/request/:id/cancel', cancelRequest);
router.get('/activity', getHospitalActivity);

// Patient Donor routes
router.post('/patient-donor', registerPatientDonor);
router.get('/patient-donors', getPatientDonors);

module.exports = router;
