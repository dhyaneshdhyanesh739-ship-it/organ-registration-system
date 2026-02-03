const { Server } = require('socket.io');
const Message = require('./models/Message');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        const { userId, role } = socket.handshake.auth;

        if (userId) {
            // Join user-specific room
            socket.join(`user:${userId}`);

            // Join role-specific room
            socket.join(`role:${role}`);

            console.log(`👤 User ${userId} joined rooms`);
        }

        // Chat Events
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`💬 User ${userId} joined chat room: ${roomId}`);
        });

        socket.on('send_message', async (data) => {
            try {
                const { roomId, receiverId, content } = data;

                // Save message to database
                const newMessage = await Message.create({
                    sender: userId,
                    receiver: receiverId,
                    content,
                    roomId
                });

                const populatedMessage = await Message.findById(newMessage._id)
                    .populate('sender', 'firstName lastName avatar')
                    .populate('receiver', 'firstName lastName avatar');

                // Emit to the room
                io.to(roomId).emit('receive_message', populatedMessage);

                // Also notify receiver if they are not in the room (for generic notification)
                socket.to(`user:${receiverId}`).emit('new_chat_notification', {
                    roomId,
                    senderName: populatedMessage.sender.firstName,
                    message: content.substring(0, 50) + (content.length > 50 ? '...' : '')
                });

            } catch (error) {
                console.error('❌ Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('typing_start', (roomId) => {
            socket.to(roomId).emit('user_typing_start', { userId });
        });

        socket.on('typing_stop', (roomId) => {
            socket.to(roomId).emit('user_typing_stop', { userId });
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Notification helpers
const notifyUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

const notifyRole = (role, event, data) => {
    if (io) {
        io.to(`role:${role}`).emit(event, data);
    }
};

const notifyAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    notifyUser,
    notifyRole,
    notifyAll,
};
