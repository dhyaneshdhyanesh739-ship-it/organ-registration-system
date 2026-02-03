import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, User, Search, UserCheck, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services';
import ChatWindow from './ChatWindow';

const ChatList = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket) {
      socket.on('new_chat_notification', (data) => {
        // Refresh conversations if a new message comes in
        fetchConversations();
      });

      return () => {
        socket.off('new_chat_notification');
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      const aiBot = {
          roomId: 'ai-chat-room',
          otherUser: {
              _id: 'lifesync-ai-bot',
              firstName: 'LifeSync',
              lastName: 'AI',
              role: 'AI Assistant',
              avatar: null,
              isBot: true
          },
          lastMessage: {
              content: 'How can I help you today?',
              createdAt: new Date().toISOString()
          },
          unreadCount: 0
      };
      setConversations([aiBot, ...(data.conversations || [])]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (conv) => {
    setActiveChat(conv);
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col items-start gap-4">
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && conversations.some(c => c.unreadCount > 0) && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full text-[10px] font-bold flex items-center justify-center">
                {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0)}
            </span>
        )}
        <div className="absolute left-16 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-200 border dark:border-gray-700">
            Messages
        </div>
      </motion.button>

      {/* Chat Interface Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            className="flex gap-4 items-end"
          >
            {/* Conversation List Slider */}
            <div className="w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Messages</h3>
                  <UserCheck className="w-4 h-4 text-primary-600" />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-10 text-center space-y-4">
                        <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-500">Loading chats...</p>
                    </div>
                ) : conversations.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No messages yet</p>
                        <p className="text-xs text-gray-500 mt-1">Accept matches to start coordinating with donors.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {conversations.map((conv) => (
                      <button
                        key={conv.roomId}
                        onClick={() => handleOpenChat(conv)}
                        className={`w-full p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                          activeChat?.roomId === conv.roomId ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-primary-600' : ''
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          {conv.otherUser.isBot ? (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <Bot className="w-6 h-6 text-white" />
                            </div>
                          ) : conv.otherUser.avatar ? (
                            <img src={conv.otherUser.avatar} alt={conv.otherUser.firstName} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${conv.otherUser.isBot ? 'bg-blue-400 animate-pulse' : 'bg-green-500'} border-2 border-white dark:border-gray-800 rounded-full`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                              {conv.otherUser.firstName} {conv.otherUser.lastName}
                            </h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {new Date(conv.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className={`text-xs truncate mt-1 ${conv.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {conv.lastMessage.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] uppercase font-black text-primary-500 tracking-widest">{conv.otherUser.role}</span>
                             {conv.unreadCount > 0 && (
                                <span className="bg-primary-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">New</span>
                             )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Chat Window */}
            {activeChat && (
              <div className="w-96 shadow-2xl">
                <ChatWindow
                  roomId={activeChat.roomId}
                  recipient={activeChat.otherUser}
                  onClose={() => setActiveChat(null)}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatList;
