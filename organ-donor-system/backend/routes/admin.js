const express = require('express');
const {
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
} = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(roleCheck(['admin']));

router.get('/analytics', getAnalytics);
router.get('/pending-verifications', getPendingVerifications);
router.put('/verify-donor/:id', verifyDonor);
router.put('/verify-hospital/:id', verifyHospital);
router.put('/verify-receiver/:id', verifyReceiver);
router.put('/approve-receiver-request/:id', approveReceiverRequest);
router.put('/complete-receiver-request/:id', completeReceiverRequest);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);
router.get('/donors', getAllDonors);
router.get('/hospitals', getAllHospitals);
router.get('/receivers', getAllReceivers);
router.get('/patient-donors', getAllPatientDonors);

module.exports = router;
