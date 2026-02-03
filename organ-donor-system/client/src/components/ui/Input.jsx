import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Mic, Loader } from 'lucide-react';
import { useState } from 'react';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className,
  containerClassName,
  id,
  required,
  enableVoice = false,
  ...props 
}) => {
  const [isListening, setIsListening] = useState(false);
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  const handleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (props.onChange) {
        const e = {
          target: {
            name: props.name,
            value: transcript
          }
        };
        props.onChange(e);
      }
    };
    recognition.start();
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </span>
          {enableVoice && window.webkitSpeechRecognition && (
            <button
              type="button"
              onClick={handleVoiceDictation}
              className={cn(
                "p-1 rounded-full transition-colors",
                isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-gray-400 hover:text-primary-600"
              )}
              aria-label={`Start voice dictation for ${label}`}
              title="Dictate"
            >
              {isListening ? <Loader className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
        
        <input
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          className={cn(
            'w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg transition-all duration-200 outline-none focus:ring-2',
            Icon && 'pl-10',
            error 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-transparent',
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          id={errorId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <span aria-hidden="true">⚠️</span> {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
