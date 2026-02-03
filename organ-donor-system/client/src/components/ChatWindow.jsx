import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, MoreVertical, Paperclip, Smile, Sparkles, Wand2, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService, aiService } from '../services';
import Button from './ui/Button';

const ChatWindow = ({ roomId, recipient, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (roomId === 'ai-chat-room') {
        setMessages([{
            _id: 'initial-ai-msg',
            content: `Hello! I am LifeSync AI. How can I assist you with organ matching or donation today?`,
            sender: { _id: 'lifesync-ai-bot', firstName: 'LifeSync', lastName: 'AI' },
            createdAt: new Date().toISOString()
        }]);
        setLoading(false);
        return;
    }

    fetchMessages();
    
    if (socket) {
      socket.emit('join_room', roomId);

      socket.on('receive_message', (message) => {
        if (message.roomId === roomId) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('user_typing_start', (data) => {
        if (data.userId !== user._id) setIsTyping(true);
      });

      socket.on('user_typing_stop', (data) => {
        if (data.userId !== user._id) setIsTyping(false);
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing_start');
        socket.off('user_typing_stop');
      };
    }
  }, [roomId, socket]);

  useEffect(scrollToBottom, [messages, isTyping]);

  const fetchMessages = async () => {
    try {
      const data = await chatService.getMessages(roomId);
      setMessages(data.messages || []);
      await chatService.markAsRead(roomId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestions = async () => {
    setAiLoading(true);
    try {
      const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : "";
      const data = await aiService.getSuggestions({
        lastMessage: lastMsg,
        role: user.role,
        organType: "Kidney" // Placeholder, should be derived from context
      });
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: { _id: user._id, firstName: user.firstName, lastName: user.lastName },
        createdAt: new Date().toISOString()
    };

    if (roomId === 'ai-chat-room') {
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsTyping(true);
        try {
            const data = await aiService.chat(userMessage.content, user.role);
            const aiResponse = {
                _id: (Date.now() + 1).toString(),
                content: data.message,
                sender: data.sender,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('AI Chat Error:', error);
        } finally {
            setIsTyping(false);
        }
        return;
    }

    if (!socket) return;
    
    const messageData = {
        roomId,
        receiverId: recipient._id,
        content: newMessage.trim(),
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
    socket.emit('typing_stop', roomId);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;

    socket.emit('typing_start', roomId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', roomId);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="flex flex-col h-[500px] w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            {recipient.isBot ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            ) : recipient.avatar ? (
              <img src={recipient.avatar} alt={recipient.firstName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-3 h-3 ${recipient.isBot ? 'bg-blue-400 animate-pulse' : 'bg-green-500'} border-2 border-white dark:border-gray-800 rounded-full`}></div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
              {recipient.firstName} {recipient.lastName}
            </h4>
            <span className="text-[10px] text-gray-500 font-medium">{recipient.isBot ? 'System Assistant' : 'Online'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/10">
        {loading ? (
          <div className="h-full flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={msg._id || idx}
                className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.sender._id === user._id 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-600 rounded-tl-none'
                }`}>
                  <p>{msg.content}</p>
                  <span className={`text-[9px] block mt-1 ${
                    msg.sender._id === user._id ? 'text-primary-100' : 'text-gray-400'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-numeric', minute: '2-numeric' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-3 rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-600">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2 flex flex-wrap gap-2"
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setNewMessage(suggestion);
                  setSuggestions([]);
                }}
                className="text-[10px] bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full border border-primary-100 dark:border-primary-800 hover:bg-primary-100 transition-colors"
                title="AI Suggested Reply"
              >
                {suggestion}
              </button>
            ))}
            <button 
              onClick={() => setSuggestions([])}
              className="text-[10px] text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <button 
            type="button" 
            onClick={getAISuggestions}
            disabled={aiLoading}
            className={`p-2 rounded-xl transition-all ${
              aiLoading ? 'animate-pulse text-primary-400' : 'text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30'
            }`}
            title="Get AI Suggestions"
          >
            <Sparkles className={`w-5 h-5 ${aiLoading ? 'animate-spin' : ''}`} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white"
          />
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatWindow;
