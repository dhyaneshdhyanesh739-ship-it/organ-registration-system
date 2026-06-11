const express = require('express');
const router = express.Router();
const {
    getPublicStats,
    getPublicActivity,
    getPublicOrders
} = require('../controllers/publicController');

router.get('/stats', getPublicStats);
router.get('/activity', getPublicActivity);
router.get('/orders', getPublicOrders);

module.exports = router;
