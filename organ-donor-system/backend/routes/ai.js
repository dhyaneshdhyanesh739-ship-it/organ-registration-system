const express = require('express');
const { 
    getSmartHelp, 
    explainMedicalTerms, 
    chatWithAI,
    scanDonorDocument,
    calculateDonorHistoryText
} = require('../controllers/aiController');
const authenticate = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.use(authenticate);

router.post('/suggest', getSmartHelp);
router.post('/explain', explainMedicalTerms);
router.post('/chat', chatWithAI);
router.post('/scan-document', upload.single('document'), scanDonorDocument);
router.post('/calculate-history-text', calculateDonorHistoryText);

module.exports = router;
