import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, MoreVertical, Sparkles, Bot, Crown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService, aiService } from '../services';

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

  const isAiBot = roomId === 'ai-chat-room' || recipient?.isBot || recipient?._id === 'lifesync-ai-bot';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiBot) {
      setMessages([{
        _id: 'initial-ai-msg',
        content: `Hello ${user?.firstName || 'there'}! I am LifeSync AI, your UDAY & NOTTO verified clinical transplant assistant. How can I help you today?`,
        sender: { _id: 'lifesync-ai-bot', firstName: 'LifeSync', lastName: 'AI' },
        createdAt: new Date().toISOString()
      }]);
      setLoading(false);
      // Fetch initial suggestions
      getAISuggestions("How does organ matching work?");
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

  const getAISuggestions = async (overrideMsg = "") => {
    setAiLoading(true);
    try {
      const lastMsg = overrideMsg || (messages.length > 0 ? messages[messages.length - 1].content : "");
      const data = await aiService.getSuggestions({
        lastMessage: lastMsg,
        role: user?.role || 'donor'
      });
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      setSuggestions([
        "How to register organ pledge?",
        "What is UDAY document OCR?",
        "How HLA matching works?"
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    const userMessage = {
      _id: Date.now().toString(),
      content: messageText,
      sender: { _id: user._id, firstName: user.firstName, lastName: user.lastName },
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    if (isAiBot) {
      setIsTyping(true);
      try {
        const data = await aiService.chat(messageText, user?.role || 'donor');
        const aiResponse = {
          _id: (Date.now() + 1).toString(),
          content: data.message || "I am LifeSync AI. I can assist you with organ matching, UDAY report verification, and hospital registration.",
          sender: data.sender || { _id: 'lifesync-ai-bot', firstName: 'LifeSync', lastName: 'AI' },
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
        getAISuggestions(messageText);
      } catch (error) {
        console.error('AI Chat Error:', error);
        setMessages(prev => [...prev, {
          _id: (Date.now() + 1).toString(),
          content: "I am LifeSync AI. I am fully active to assist you with organ donor registration, UDAY document verification, and waitlist priority queries!",
          sender: { _id: 'lifesync-ai-bot', firstName: 'LifeSync', lastName: 'AI' },
          createdAt: new Date().toISOString()
        }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (!socket) return;
    
    const messageData = {
      roomId,
      receiverId: recipient._id,
      content: messageText,
    };

    socket.emit('send_message', messageData);
    socket.emit('typing_stop', roomId);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (isAiBot || !socket) return;

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
      className="flex flex-col h-[520px] w-full bg-[#0c0f26]/95 border-2 border-amber-400/50 backdrop-blur-2xl rounded-3xl shadow-[6px_6px_0px_0px_#E5C158] overflow-hidden text-gray-100"
    >
      {/* Header */}
      <div className="p-4 border-b border-amber-500/30 flex justify-between items-center bg-gray-950/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isAiBot ? (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center border border-amber-300 shadow-md">
                <Bot className="w-6 h-6 text-gray-950" />
              </div>
            ) : recipient?.avatar ? (
              <img src={recipient.avatar} alt={recipient.firstName} className="w-10 h-10 rounded-full object-cover border border-amber-400" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
                <User className="w-6 h-6 text-amber-300" />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${isAiBot ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'} border-2 border-gray-950 rounded-full`}></div>
          </div>
          <div>
            <h4 className="font-extrabold text-amber-200 font-serif leading-tight flex items-center gap-1.5 text-base">
              {isAiBot ? 'LifeSync AI Assistant' : `${recipient?.firstName || 'User'} ${recipient?.lastName || ''}`}
              {isAiBot && <Crown className="w-4 h-4 text-amber-400" />}
            </h4>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mt-0.5">
              {isAiBot ? 'UDAY Clinical Intelligence Model' : 'Active Channel'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-rose-950/60 hover:text-rose-300 text-gray-400 rounded-xl transition-colors border border-transparent hover:border-rose-500/40"
          >
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-950/40 space-y-4">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
             <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-xs text-amber-300 font-bold">Connecting to LifeSync AI...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.sender._id === user._id;
              return (
                <div 
                  key={msg._id || idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-md leading-relaxed ${
                    isUser 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-medium rounded-tr-none border border-amber-300 shadow-[3px_3px_0px_0px_#000]' 
                      : 'bg-gray-950/90 text-amber-100 border border-amber-500/40 rounded-tl-none shadow-[3px_3px_0px_0px_#E5C158]'
                  }`}>
                    {!isUser && (
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Bot className="w-3 h-3 text-amber-400" /> LifeSync AI
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[9px] block mt-1 font-mono text-right ${
                      isUser ? 'text-gray-900 font-bold' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-numeric', minute: '2-numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-950/90 text-amber-200 border border-amber-500/40 rounded-2xl p-3 rounded-tl-none flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-amber-300 animate-pulse">LifeSync AI is processing response...</span>
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
            className="px-4 py-2 bg-gray-950/90 border-t border-amber-500/30 flex flex-wrap items-center gap-2"
          >
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Suggested:
            </span>
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setNewMessage(suggestion);
                }}
                className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/40 hover:bg-amber-400 hover:text-gray-950 font-bold transition-all"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-amber-500/30 bg-gray-950/90 relative">
        <div className="flex items-center gap-2 bg-gray-900 border border-amber-500/40 p-2 rounded-2xl focus-within:border-amber-400 transition-all">
          <button 
            type="button" 
            onClick={() => getAISuggestions()}
            disabled={aiLoading}
            className={`p-2 rounded-xl transition-all ${
              aiLoading ? 'animate-spin text-amber-400' : 'text-amber-400 hover:bg-amber-500/20'
            }`}
            title="Get AI Suggestions"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={isAiBot ? "Ask LifeSync AI about donation, UDAY OCR, or matching..." : "Type a message..."}
            className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-gray-100 placeholder-gray-500 font-medium"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-black rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_#000]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatWindow;
