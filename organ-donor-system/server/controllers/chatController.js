const Message = require('../models/Message');
const User = require('../models/User');

/**
 * @route   GET /api/chat/messages/:roomId
 * @desc    Get message history for a room
 * @access  Private
 */
const getMessages = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        // Check if user is part of the room
        if (!roomId.includes(req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this conversation',
            });
        }

        const messages = await Message.find({ roomId })
            .sort({ createdAt: 1 })
            .populate('sender', 'firstName lastName avatar')
            .populate('receiver', 'firstName lastName avatar');

        res.json({
            success: true,
            messages,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/chat/read/:roomId
 * @desc    Mark all messages in a room as read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        await Message.updateMany(
            { roomId, receiver: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({
            success: true,
            message: 'Messages marked as read',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/chat/conversations
 * @desc    Get list of active conversations for current user
 * @access  Private
 */
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Find unique roomIds where user is a participant
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: '$roomId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { 'lastMessage.createdAt': -1 } },
        ]);

        // Populate participant details
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.lastMessage.sender.toString() === userId.toString()
                    ? conv.lastMessage.receiver
                    : conv.lastMessage.sender;

                const otherUser = await User.findById(otherUserId).select('firstName lastName avatar role');

                return {
                    roomId: conv._id,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount,
                    otherUser,
                };
            })
        );

        res.json({
            success: true,
            conversations: populatedConversations,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    markAsRead,
    getConversations,
};
