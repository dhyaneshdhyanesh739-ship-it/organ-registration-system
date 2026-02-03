import { useState, useEffect, useCallback, useMemo } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, HelpCircle, Command, Loader2, Keyboard, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textCommand, setTextCommand] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Speech Recognition Setup
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US'; // Changed to en-US for better compatibility
    rec.maxAlternatives = 1;
    
    return rec;
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = useCallback((command, isTextInput = false) => {
    const cmd = command.toLowerCase();
    
    if (cmd.includes('home') || cmd.includes('main page')) {
      if (!isTextInput) speak('Going to home page');
      toast.success('Navigating to home page');
      navigate('/');
    } else if (cmd.includes('dashboard')) {
      if (!isTextInput) speak('Opening your dashboard');
      toast.success('Opening dashboard');
      navigate('/donor/dashboard');
    } else if (cmd.includes('organ') || cmd.includes('info')) {
      if (!isTextInput) speak('Opening organ information gallery');
      toast.success('Opening organs page');
      navigate('/organs');
    } else if (cmd.includes('register')) {
      if (!isTextInput) speak('Opening registration page');
      toast.success('Opening registration');
      navigate('/register');
    } else if (cmd.includes('login') || cmd.includes('sign in')) {
      if (!isTextInput) speak('Opening login page');
      toast.success('Opening login');
      navigate('/login');
    } else if (cmd.includes('help')) {
      setShowHelper(true);
      if (!isTextInput) speak('Here are some commands you can use. You can say home, dashboard, organs, or register.');
    } else {
      if (!isTextInput) {
        speak("I didn't quite catch that. Try saying help for available commands.");
      } else {
        toast.error("Command not recognized. Try 'help' for available commands.");
      }
    }
  }, [navigate, toast]);

  const handleTextCommand = (e) => {
    e.preventDefault();
    if (!textCommand.trim()) return;
    
    setTranscript(textCommand);
    handleCommand(textCommand, true);
    setTextCommand('');
    setShowTextInput(false);
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      // Check if online
      if (!navigator.onLine) {
        toast.error('No internet connection. Voice recognition requires an active internet connection.');
        return;
      }

      setTranscript('');
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        
        // Handle specific errors
        if (err.name === 'InvalidStateError') {
          // Recognition is already started, stop and restart
          recognition.stop();
          setTimeout(() => {
            try {
              recognition.start();
            } catch (retryErr) {
              toast.error('Failed to start voice recognition. Please try again.');
            }
          }, 100);
        } else {
          toast.error('Failed to start voice recognition. Please check your microphone permissions.');
        }
      }
    }
  };

  useEffect(() => {
    if (!recognition) return;

    const onStart = () => setIsListening(true);
    const onEnd = () => setIsListening(false);
    const onResult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      handleCommand(result);
    };
    const onError = (event) => {
      console.group('🎤 Speech Recognition Error');
      console.error('Error type:', event.error);
      console.error('Error event:', event);
      console.log('Navigator online:', navigator.onLine);
      console.log('Current URL:', window.location.href);
      console.log('Protocol:', window.location.protocol);
      console.log('Is secure context:', window.isSecureContext);
      console.groupEnd();
      
      setIsListening(false);
      
      switch(event.error) {
        case 'not-allowed':
          toast.error('Microphone access denied. Please allow microphone permissions.');
          break;
        case 'network':
          console.error('🌐 NETWORK ERROR DETAILS:');
          console.error('This usually means:');
          console.error('1. No internet connection');
          console.error('2. Firewall blocking Google speech services');
          console.error('3. Network restrictions (corporate/school network)');
          console.error('4. VPN/Proxy interference');
          console.error('\n💡 Try opening: http://localhost:5173/voice-diagnostic.html');
          
          toast.error('Network error. Check internet connection. Open /voice-diagnostic.html for detailed diagnostics.');
          break;
        case 'no-speech':
          // Don't show error for no speech detected
          console.log('No speech detected');
          break;
        case 'aborted':
          // Don't show error for user-initiated abort
          console.log('Recognition aborted');
          break;
        case 'audio-capture':
          toast.error('No microphone detected. Please connect a microphone.');
          break;
        case 'service-not-allowed':
          toast.error('Speech recognition service not available. Please use HTTPS or localhost.');
          break;
        default:
          toast.error(`Recognition error: ${event.error}. Please try again.`);
      }
    };

    recognition.addEventListener('start', onStart);
    recognition.addEventListener('end', onEnd);
    recognition.addEventListener('result', onResult);
    recognition.addEventListener('error', onError);

    return () => {
      recognition.removeEventListener('start', onStart);
      recognition.removeEventListener('end', onEnd);
      recognition.removeEventListener('result', onResult);
      recognition.removeEventListener('error', onError);
      recognition.stop();
    };
  }, [recognition, handleCommand, toast]);

  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Help Panel */}
      <AnimatePresence>
        {showHelper && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-primary-100 dark:border-gray-700 max-w-xs w-full mb-2"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Command className="w-5 h-5 text-primary-600" />
                Voice Commands
              </h3>
              <button 
                onClick={() => setShowHelper(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label="Close help"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <p className="font-medium text-gray-500">Navigation:</p>
              <ul className="space-y-2">
                <li className="flex justify-between"><span>"Go to Home"</span> <kbd className="bg-gray-50 px-1 rounded border">🏠</kbd></li>
                <li className="flex justify-between"><span>"Go to Dashboard"</span> <kbd className="bg-gray-50 px-1 rounded border">📊</kbd></li>
                <li className="flex justify-between"><span>"Show Organs"</span> <kbd className="bg-gray-50 px-1 rounded border">🫀</kbd></li>
              </ul>
              
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400">Pro Tip: Just say the destination name!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Command Input */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-primary-100 dark:border-gray-700 max-w-sm w-full mb-2"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary-600" />
                Type Command
              </h3>
              <button 
                onClick={() => setShowTextInput(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label="Close text input"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleTextCommand} className="space-y-3">
              <input
                type="text"
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                placeholder="Type: home, dashboard, organs, register, login..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={!textCommand.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Execute Command
              </button>
            </form>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Type commands like "go to home" or just "dashboard"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Transcript Bubble */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium max-w-xs truncate"
            >
              "{transcript}"
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="relative">
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-primary-500 rounded-full"
            />
          )}
          <button
            onClick={toggleListening}
            className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
            title={isListening ? 'Stop' : 'Voice Assistant'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button
            onClick={() => setShowHelper(!showHelper)}
            className="absolute -top-1 -left-1 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="How to use voice assistant"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary-600" />
          </button>

          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="absolute -bottom-1 -left-1 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Type command instead"
            title="Type Command"
          >
            <Keyboard className="w-3.5 h-3.5 text-green-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
