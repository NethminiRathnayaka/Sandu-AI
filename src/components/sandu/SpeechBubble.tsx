import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  typewriter?: boolean;
  speed?: number; // ms per char
  className?: string;
  onComplete?: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  typewriter = false,
  speed = 22,
  className = '',
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState(typewriter ? '' : text);

  useEffect(() => {
    if (!typewriter) {
      setDisplayedText(text);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText('');
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, typewriter, speed]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl p-4 shadow-lg border border-slate-200/80 dark:border-slate-700/80 max-w-lg ${className}`}
    >
      <p className="text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
        {displayedText}
        {typewriter && displayedText.length < text.length && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent-500 animate-pulse align-middle" />
        )}
      </p>
    </motion.div>
  );
};
