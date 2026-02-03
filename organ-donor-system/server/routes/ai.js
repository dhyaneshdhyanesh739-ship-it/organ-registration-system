const express = require('express');
const { getSmartHelp, explainMedicalTerms, chatWithAI } = require('../controllers/aiController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/suggest', getSmartHelp);
router.post('/explain', explainMedicalTerms);
router.post('/chat', chatWithAI);

module.exports = router;
