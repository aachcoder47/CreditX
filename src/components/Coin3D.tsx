import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoinSide } from '../types/game';
import { Zap, Flame, Sparkles } from 'lucide-react';

interface Coin3DProps {
  isFlipping: boolean;
  selectedSide: CoinSide;
  winningSide: CoinSide | null;
  flipDuration: number; // in seconds (e.g. 5)
  onFlipComplete?: () => void;
}

export const Coin3D: React.FC<Coin3DProps> = ({
  isFlipping,
  selectedSide,
  winningSide,
  flipDuration = 5,
  onFlipComplete,
}) => {
  // Keep track of accumulated continuous rotation so it NEVER spins backwards
  const [currentRotation, setCurrentRotation] = useState(selectedSide === 'HEADS' ? 0 : 180);
  const [showLandingFlash, setShowLandingFlash] = useState(false);
  const wasFlippingRef = useRef(false);

  // Handle side toggle while idle (smooth 180 flip forward or backward without 3600 rewinding)
  useEffect(() => {
    if (!isFlipping) {
      setCurrentRotation((prev) => {
        const base = Math.round(prev / 360) * 360;
        return selectedSide === 'HEADS' ? base : base + 180;
      });
    }
  }, [selectedSide, isFlipping]);

  // Handle flip launch: spin forward continuously by ~8-10 turns and land on target
  useEffect(() => {
    if (isFlipping && !wasFlippingRef.current) {
      wasFlippingRef.current = true;
      setShowLandingFlash(false);

      setCurrentRotation((prev) => {
        // Calculate next landing target: add at least 8 full rotations (2880 deg)
        const base = Math.ceil((prev + 2880) / 360) * 360;
        const targetOffset = winningSide === 'TAILS' ? 180 : 0;
        return base + targetOffset;
      });
    } else if (!isFlipping && wasFlippingRef.current) {
      wasFlippingRef.current = false;
      // Trigger landing sparkle/flash
      setShowLandingFlash(true);
      const timer = setTimeout(() => setShowLandingFlash(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, winningSide]);

  const isHeads = selectedSide === 'HEADS';

  return (
    <div className="relative flex items-center justify-center py-4 sm:py-6 select-none overflow-visible">
      {/* Ambient Pulsing Underglow */}
      <motion.div
        animate={{
          scale: isFlipping ? [1, 1.35, 1.15, 1.4, 1] : [1, 1.08, 1],
          opacity: isFlipping ? [0.6, 0.95, 0.75, 1, 0.7] : [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: isFlipping ? flipDuration : 3.5,
          repeat: isFlipping ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full blur-[65px] sm:blur-[85px] pointer-events-none transition-colors duration-700 ${
          isHeads
            ? 'bg-cyan-400/40 shadow-[0_0_90px_rgba(0,240,255,0.7)]'
            : 'bg-purple-600/40 shadow-[0_0_90px_rgba(112,0,255,0.7)]'
        }`}
      />

      {/* Futuristic Orbit Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Tech Ring */}
        <div 
          className={`w-60 h-60 sm:w-80 sm:h-80 rounded-full border border-dashed transition-all duration-700 ${
            isFlipping 
              ? 'border-cyan-400/60 animate-spin-slow scale-110 shadow-[0_0_25px_rgba(0,240,255,0.3)]' 
              : 'border-white/10 opacity-40'
          }`}
        />
        {/* Inner Counter-Rotating Ring */}
        <div 
          className={`absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full border transition-all duration-700 ${
            isFlipping 
              ? 'border-purple-500/50 animate-spin-reverse-slow scale-105' 
              : 'border-white/5 opacity-30'
          }`}
        />
      </div>

      {/* Landing Flash Burst */}
      <AnimatePresence>
        {showLandingFlash && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full pointer-events-none z-20 ${
              winningSide === 'HEADS' 
                ? 'bg-cyan-400/40 shadow-[0_0_80px_#00F0FF]' 
                : 'bg-purple-500/40 shadow-[0_0_80px_#A855F7]'
            }`}
          />
        )}
      </AnimatePresence>

      {/* 3D Perspective Container (Responsive size) */}
      <div 
        className="w-44 h-44 sm:w-56 sm:h-56 md:w-60 md:h-60 relative z-10"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{
            rotateY: currentRotation,
            rotateX: isFlipping ? [0, 22, -18, 14, -8, 0] : 0,
            y: isFlipping ? [0, -75, -90, -45, -12, 0] : [0, -8, 0],
            scale: isFlipping ? [1, 1.1, 1.14, 1.06, 1] : 1,
          }}
          transition={
            isFlipping
              ? {
                  duration: flipDuration,
                  ease: [0.18, 0.89, 0.32, 1], // Cinematic high-friction deceleration curve
                }
              : {
                  rotateY: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
                  y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
                  scale: { duration: 0.3 },
                }
          }
          onAnimationComplete={() => {
            if (isFlipping && onFlipComplete) {
              onFlipComplete();
            }
          }}
        >
          {/* ================= HEADS FACE (Cyber Cyan) ================= */}
          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-3 sm:p-4 shadow-2xl"
            style={{
              transform: 'rotateY(0deg) translateZ(8px)',
              background: 'radial-gradient(circle at 35% 25%, #13344b 0%, #0c1c28 45%, #050b11 90%)',
              border: '3.5px solid #00F0FF',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.5), inset 0 0 25px rgba(0, 240, 255, 0.25)',
            }}
          >
            {/* Outer Inscription Ring */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-cyan-400/30 flex items-center justify-center pointer-events-none">
              <div className="absolute top-1.5 sm:top-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-cyan-300 font-bold uppercase">
                CYBERFLIP • ON-CHAIN
              </div>
              <div className="absolute bottom-1.5 sm:bottom-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-cyan-400/80 font-bold uppercase">
                1.98X MULTIPLIER
              </div>
            </div>

            {/* Specular Light Reflection Sweep */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-300/15 to-transparent pointer-events-none" />

            {/* Inner Metallic Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-950/70 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <Zap className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-cyan-400 drop-shadow-[0_0_10px_#00F0FF]" />
              </div>
              <span className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg font-black font-['Orbitron'] tracking-widest text-cyan-300 text-glow-cyan">
                HEADS
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
                50% PROBABILITY
              </span>
            </div>

            {/* Edge Rivet Details */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#00F0FF]"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translate(${typeof window !== 'undefined' && window.innerWidth < 640 ? 76 : 100}px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>

          {/* ================= 3D COIN EDGE DEPTH LAYERS ================= */}
          {[-6, -4, -2, 0, 2, 4, 6].map((z) => (
            <div
              key={z}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `translateZ(${z}px)`,
                border: '3px solid rgba(13, 20, 35, 0.95)',
                background: 'rgba(8, 12, 22, 0.95)',
              }}
            />
          ))}

          {/* ================= TAILS FACE (Electric Violet) ================= */}
          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-3 sm:p-4 shadow-2xl"
            style={{
              transform: 'rotateY(180deg) translateZ(8px)',
              background: 'radial-gradient(circle at 35% 25%, #2a1147 0%, #19092c 45%, #080312 90%)',
              border: '3.5px solid #A855F7',
              boxShadow: '0 0 35px rgba(168, 85, 247, 0.5), inset 0 0 25px rgba(112, 0, 255, 0.3)',
            }}
          >
            {/* Outer Inscription Ring */}
            <div className="absolute inset-2 sm:inset-2.5 rounded-full border border-purple-400/30 flex items-center justify-center pointer-events-none">
              <div className="absolute top-1.5 sm:top-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-purple-300 font-bold uppercase">
                PROVABLY FAIR • PVP
              </div>
              <div className="absolute bottom-1.5 sm:bottom-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-purple-400/80 font-bold uppercase">
                5-SECOND SETTLEMENT
              </div>
            </div>

            {/* Specular Light Reflection Sweep */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-purple-300/15 to-transparent pointer-events-none" />

            {/* Inner Metallic Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-purple-950/70 border border-purple-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <Flame className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400 drop-shadow-[0_0_10px_#A855F7]" />
              </div>
              <span className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg font-black font-['Orbitron'] tracking-widest text-purple-300 text-glow-violet">
                TAILS
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono text-purple-400/80 tracking-widest uppercase">
                50% PROBABILITY
              </span>
            </div>

            {/* Edge Rivet Details */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-purple-300 shadow-[0_0_6px_#A855F7]"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translate(${typeof window !== 'undefined' && window.innerWidth < 640 ? 76 : 100}px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Sparkle Micro-Badges */}
      <div className="absolute top-2 right-4 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400 pointer-events-none">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>3D CRYPTO ENGINE</span>
      </div>
    </div>
  );
};
