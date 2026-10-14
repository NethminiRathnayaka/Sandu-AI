import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SanduAvatar } from './SanduAvatar';

export const FloatingSandu: React.FC = () => {
  const {
    activeTab,
    setChatDrawerOpen,
    sanduExpression,
    sanduOutfitColor,
    isChatDrawerOpen
  } = useAppStore();

  // Show floating avatar only on non-home tabs when drawer is closed
  if (activeTab === 'home' || isChatDrawerOpen) {
    return null;
  }

  return (
    <motion.div
      drag
      dragConstraints={{ left: -300, right: 20, top: -500, bottom: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setChatDrawerOpen(true)}
      className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-30 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="relative group">
        {/* Glow halo */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-accent-500 to-pink-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse-subtle" />

        {/* Character Bubble */}
        <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full shadow-2xl border-2 border-white dark:border-slate-800 flex items-center justify-center">
          <SanduAvatar
            size="sm"
            expression={sanduExpression}
            outfitColor={sanduOutfitColor}
          />

          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-accent-600 text-white p-1 rounded-full shadow-md border-2 border-white dark:border-slate-900">
            <MessageCircle className="w-3 h-3" />
          </span>
        </div>

        {/* Hover hint */}
        <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg shadow-lg">
          Chat with SANDU ✨
        </div>
      </div>
    </motion.div>
  );
};
