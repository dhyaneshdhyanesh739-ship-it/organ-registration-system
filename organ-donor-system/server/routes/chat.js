const express = require('express');
const { getMessages, markAsRead, getConversations } = require('../controllers/chatController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/messages/:roomId', getMessages);
router.get('/conversations', getConversations);
router.put('/read/:roomId', markAsRead);

module.exports = router;
