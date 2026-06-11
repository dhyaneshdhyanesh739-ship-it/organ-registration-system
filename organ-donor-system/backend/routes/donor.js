const express = require('express');
const {
    createDonorProfile,
    getDonorProfile,
    updateDonorProfile,
    updateConsent,
    getDonorStats,
    getDonorActivity,
    getDonationHistory,
} = require('../controllers/donorController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

// All routes require authentication and donor role
router.use(authenticate);
router.use(roleCheck(['donor']));

router.post('/profile', upload.single('idDocument'), createDonorProfile);
router.get('/profile', getDonorProfile);
router.put('/profile', upload.single('idDocument'), updateDonorProfile);
router.put('/consent', updateConsent);
router.get('/stats', getDonorStats);
router.get('/activity', getDonorActivity);
router.get('/history', getDonationHistory);

module.exports = router;
