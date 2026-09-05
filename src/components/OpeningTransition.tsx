import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFx } from '../utils/audio';

interface OpeningTransitionProps {
  onComplete: () => void;
}

export const OpeningTransition: React.FC<OpeningTransitionProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleExit();
    }, 950);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    soundFx.playWhoosh();
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="opening-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onClick={handleExit}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030509]/95 backdrop-blur-2xl cursor-pointer select-none px-4"
        >
          {/* Ethereal Ambient Bloom */}
          <div className="absolute w-72 h-72 rounded-full bg-cyan-500/20 blur-[100px] pointer-events-none" />

          {/* Centered CreditX Brand Reveal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_30px_rgba(0,240,255,0.4)] mb-4">
              <div className="w-full h-full bg-[#060A13] rounded-[14px] flex items-center justify-center">
                <span className="font-display font-black text-2xl sm:text-3xl text-cyan-400">
                  X
                </span>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Credit<span className="text-cyan-400">X</span>
            </h1>

            <p className="font-mono-ui text-xs text-slate-400 mt-1 uppercase tracking-widest">
              Decentralized Double-or-Nothing
            </p>

            {/* Micro Progress Bar */}
            <div className="w-36 h-1 rounded-full bg-white/10 mt-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.85, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
