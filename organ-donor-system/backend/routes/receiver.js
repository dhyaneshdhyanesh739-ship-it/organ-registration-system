const express = require('express');
const { getAvailableOrgans, submitOrganRequest, getOrganSummary, getMyRequests } = require('../controllers/receiverController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET available organs from active donors
router.get('/available-organs', getAvailableOrgans);

// GET summary counts of available organs
router.get('/organ-summary', getOrganSummary);

// GET my requests
router.get('/my-requests', getMyRequests);

// POST submit an organ need request
router.post('/request', submitOrganRequest);

module.exports = router;
