const express = require('express');
const {
    getAnalytics,
    getPendingVerifications,
    verifyDonor,
    verifyHospital,
    getAuditLogs,
    getAllUsers,
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
router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);

module.exports = router;
