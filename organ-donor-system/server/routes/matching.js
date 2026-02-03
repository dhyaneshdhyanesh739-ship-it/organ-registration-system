const express = require('express');
const { findMatches, getMatches, acceptMatch } = require('../controllers/matchingController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication and hospital role
router.use(authenticate);
router.use(roleCheck(['hospital']));

router.post('/find/:requestId', findMatches);
router.get('/request/:requestId/matches', getMatches);
router.post('/accept/:requestId/:donorId', acceptMatch);

module.exports = router;
