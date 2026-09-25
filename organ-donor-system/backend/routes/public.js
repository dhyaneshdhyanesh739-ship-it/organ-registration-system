const express = require('express');
const router = express.Router();
const {
    getPublicStats,
    getPublicActivity,
    getPublicOrders,
    getVerifiedHospitals
} = require('../controllers/publicController');

router.get('/stats', getPublicStats);
router.get('/activity', getPublicActivity);
router.get('/orders', getPublicOrders);
router.get('/hospitals', getVerifiedHospitals);

module.exports = router;
