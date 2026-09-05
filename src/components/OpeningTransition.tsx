import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShieldCheck, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface OpeningTransitionProps {
  onComplete: () => void;
}

export const OpeningTransition: React.FC<OpeningTransitionProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING SECURE PROTOCOL...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(35);
      setStatusText('CONNECTING ON-CHAIN PROVIDER...');
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(72);
      setStatusText('VERIFYING TREASURY 0x155A...5Af9 & SEEDS...');
    }, 750);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('PVP ARENA SYNCHRONIZED • ENTERING');
    }, 1200);

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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, #0A0E1A 0%, #05070D 55%, #020308 100%)' }}
        >
          <div className="absolute inset-0 cyber-grid cyber-grid-glow opacity-40 pointer-events-none" />

          <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
          <div className="absolute inset-0 pointer-events-none vignette opacity-70" />

          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[460px] sm:w-[680px] h-[460px] sm:h-[680px] rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-600/18 to-purple-600/30 pointer-events-none"
            style={{ filter: 'blur(130px)' }}
          />

          <motion.div
            animate={{
              scale: [0.9, 1.15, 0.9],
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-gradient-to-br from-amber-400/20 via-transparent to-emerald-400/18 pointer-events-none"
            style={{ filter: 'blur(80px)' }}
          />

          <motion.div
            animate={{ rotate: 360, opacity: [0.1, 0.35, 0.1] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[140%] h-[140%] pointer-events-none opacity-25"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,240,255,0.18) 80deg, transparent 160deg, rgba(112,0,255,0.18) 260deg, transparent 340deg)',
              filter: 'blur(40px)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center px-4 max-w-md w-full text-center">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-cyan-400/55 border-dashed"
                style={{ boxShadow: '0 0 25px rgba(0,240,255,0.25), inset 0 0 25px rgba(0,240,255,0.1)' }}
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2.5 sm:inset-3 rounded-full border-2 border-purple-500/45"
                style={{ boxShadow: '0 0 20px rgba(112,0,255,0.25), inset 0 0 20px rgba(112,0,255,0.12)' }}
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-amber-400/35 border-dotted"
              />

              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [0.95, 1.08, 0.95],
                }}
                transition={{
                  rotateY: { duration: 2.1, repeat: Infinity, ease: 'easeInOut' },
                  scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-2 backdrop-blur-md overflow-hidden group"
                style={{
                  background: 'linear-gradient(160deg, rgba(8,47,73,0.85) 0%, rgba(7,14,28,0.9) 50%, rgba(30,10,60,0.85) 100%)',
                  borderColor: 'rgba(0,240,255,0.75)',
                  boxShadow: '0 0 45px rgba(0,240,255,0.65), 0 0 22px rgba(112,0,255,0.35), inset 0 0 22px rgba(0,240,255,0.22), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
                <div className="relative flex flex-col items-center gap-0.5">
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
                    className="flex items-center gap-1"
                  >
                    <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" style={{ filter: 'drop-shadow(0 0 14px #00F0FF) drop-shadow(0 0 6px #22D3EE)' }} />
                    <Flame className="w-7 h-7 sm:w-9 sm:h-9 text-purple-400 opacity-80" style={{ filter: 'drop-shadow(0 0 12px #A855F7)' }} />
                  </motion.div>
                </div>
              </motion.div>

              {[0, 90, 180, 270].map((deg) => (
                <motion.div
                  key={deg}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: deg / 250 }}
                  className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-cyan-300 to-purple-400"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translate(${typeof window !== 'undefined' && window.innerWidth < 640 ? 66 : 86}px) translate(-50%, -50%)`,
                    boxShadow: '0 0 10px rgba(0,240,255,0.8)',
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-['Orbitron'] text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-white">
                CYBER<span className="text-cyan-400 text-glow-cyan text-shimmer">FLIP</span>
              </h1>
              <p className="mt-1.5 font-mono text-[11px] sm:text-xs text-slate-400 tracking-[0.3em] uppercase flex items-center justify-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                5-SEC ON-CHAIN PVP ARENA
                <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
              </p>
            </motion.div>

            <div className="w-full mt-7 sm:mt-8 space-y-2">
              <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10 shadow-inner relative">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: 'linear-gradient(90deg, #00F0FF 0%, #22D3EE 25%, #A855F7 60%, #7000FF 100%)',
                    boxShadow: '0 0 18px rgba(0,240,255,0.9), 0 0 8px rgba(112,0,255,0.7)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                      animation: 'premiumShimmer 2.4s linear infinite',
                    }}
                  />
                </motion.div>

                <motion.div
                  className="absolute top-0 h-full w-1 rounded-full bg-white pointer-events-none"
                  initial={{ left: '0%', opacity: 0 }}
                  animate={{ left: `${progress}%`, opacity: progress > 0 && progress < 100 ? 0.85 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    boxShadow: '0 0 12px #FFFFFF, 0 0 6px #00F0FF',
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
                <span className="text-cyan-300 font-semibold truncate pr-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                  {statusText}
                </span>
                <span className="font-bold font-['Orbitron'] shrink-0 flex items-center gap-1">
                  <span className="text-cyan-400 text-glow-cyan">{progress}</span>
                  <span className="text-slate-500">%</span>
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm"
              style={{
                background: 'linear-gradient(90deg, rgba(8,47,73,0.55) 0%, rgba(30,10,60,0.55) 100%)',
                border: '1px solid rgba(0,240,255,0.3)',
                boxShadow: '0 0 18px rgba(0,240,255,0.15), inset 0 0 12px rgba(0,240,255,0.08)',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px #10B981)' }} />
              <span className="text-[10px] font-mono text-slate-300">
                Commission Treasury: <strong className="text-cyan-300 font-bold">0x155A…5Af9</strong>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-8 flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors group/skip"
            >
              <span>Click anywhere to enter</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover/skip:translate-x-1 transition-transform" />
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="opening-shutter"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col"
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '-100%' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #04060C 0%, #07080C 100%)',
              borderBottom: '1px solid rgba(0,240,255,0.55)',
              boxShadow: '0 18px 50px rgba(0,240,255,0.35), 0 6px 20px rgba(112,0,255,0.2)',
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-purple-400 to-transparent" />
          </motion.div>
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '100%' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 relative overflow-hidden"
            style={{
              background: 'linear-gradient(0deg, #04060C 0%, #07080C 100%)',
              borderTop: '1px solid rgba(168,85,247,0.55)',
              boxShadow: '0 -18px 50px rgba(112,0,255,0.35), 0 -6px 20px rgba(0,240,255,0.2)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-cyan-400 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
