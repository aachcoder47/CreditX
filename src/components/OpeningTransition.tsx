import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface OpeningTransitionProps {
  onComplete: () => void;
}

export const OpeningTransition: React.FC<OpeningTransitionProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING SECURE PROTOCOL...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Stage 1: 0% -> 35% (Protocol init)
    const t1 = setTimeout(() => {
      setProgress(35);
      setStatusText('CONNECTING ON-CHAIN PROVIDER...');
    }, 300);

    // Stage 2: 35% -> 72% (Fair seed loading & commission treasury)
    const t2 = setTimeout(() => {
      setProgress(72);
      setStatusText('VERIFYING TREASURY 0x155A...5Af9 & SEEDS...');
    }, 750);

    // Stage 3: 72% -> 100% (Ready)
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('PVP ARENA SYNCHRONIZED • ENTERING');
    }, 1200);

    // Stage 4: Trigger exit animation
    const t4 = setTimeout(() => {
      handleExit();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    soundFx.playWhoosh();
    setTimeout(() => {
      onComplete();
    }, 700);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="opening-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleExit}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080C] overflow-hidden cursor-pointer select-none"
        >
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 cyber-grid cyber-grid-glow opacity-35 pointer-events-none" />

          {/* Ambient Glowing Energy Spheres */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/25 blur-[120px] pointer-events-none"
          />

          {/* Center Hologram Pod */}
          <div className="relative z-10 flex flex-col items-center px-4 max-w-md w-full text-center">
            {/* Holographic Coin Ring */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
              {/* Rotating Dashed Outer Halo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-cyan-400/50 border-dashed"
              />

              {/* Counter-Rotating Violet Halo */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-purple-500/40"
              />

              {/* Pulsing Coin Emblem */}
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  rotateY: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-950/80 via-[#0a121e] to-purple-950/80 border-2 border-cyan-400/70 flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.6)] backdrop-blur-md"
              >
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 drop-shadow-[0_0_12px_#00F0FF]" />
              </motion.div>
            </div>

            {/* Brand Title */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <h1 className="font-['Orbitron'] text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-white">
                CYBER<span className="text-cyan-400 text-glow-cyan">FLIP</span>
              </h1>
              <p className="mt-1.5 font-mono text-[11px] sm:text-xs text-slate-400 tracking-[0.25em] uppercase">
                5-Second On-Chain PVP Arena
              </p>
            </motion.div>

            {/* Futuristic Progress Bar */}
            <div className="w-full mt-7 sm:mt-8 space-y-2">
              <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_15px_rgba(0,240,255,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>

              {/* Status Diagnostic readout */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
                <span className="text-cyan-300 font-semibold truncate pr-2">
                  {statusText}
                </span>
                <span className="font-bold text-white shrink-0">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Verified Commission Treasury Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-slate-300"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commission Treasury: <strong className="text-cyan-300">0x155A...5Af9</strong></span>
            </motion.div>

            {/* Skip Prompt */}
            <div className="mt-8 flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors">
              <span>Click anywhere to enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>
      ) : (
        /* Cinematic Shutter Reveal on Exit */
        <motion.div
          key="opening-shutter"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col"
        >
          {/* Top Curtain slides up */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 bg-[#07080C] border-b border-cyan-400/50 shadow-[0_15px_40px_rgba(0,240,255,0.3)]"
          />
          {/* Bottom Curtain slides down */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 bg-[#07080C] border-t border-purple-500/50 shadow-[0_-15px_40px_rgba(112,0,255,0.3)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
