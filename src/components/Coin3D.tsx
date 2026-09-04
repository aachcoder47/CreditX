import React from 'react';
import { motion } from 'framer-motion';
import type { CoinSide } from '../types/game';
import { Zap, Flame } from 'lucide-react';

interface Coin3DProps {
  isFlipping: boolean;
  selectedSide: CoinSide;
  winningSide: CoinSide | null;
  flipDuration: number; // in seconds (5)
  onFlipComplete?: () => void;
}

export const Coin3D: React.FC<Coin3DProps> = ({
  isFlipping,
  selectedSide,
  winningSide,
  flipDuration = 5,
  onFlipComplete,
}) => {
  // Compute target rotation
  // 0 deg = Heads, 180 deg = Tails
  // When flipping, do 10-12 full rotations (e.g. 10 * 360 = 3600 deg) + final landing side
  const targetRotation = winningSide === 'TAILS' ? 3600 + 180 : 3600;

  return (
    <div className="relative flex items-center justify-center py-6 select-none">
      {/* Dynamic Ambient Glow Behind Coin */}
      <motion.div
        animate={{
          scale: isFlipping ? [1, 1.25, 1.1, 1.3, 1] : 1,
          opacity: isFlipping ? [0.6, 0.9, 0.7, 1, 0.7] : 0.45,
          rotate: isFlipping ? 360 : 0,
        }}
        transition={{
          duration: isFlipping ? flipDuration : 4,
          repeat: isFlipping ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute w-64 h-64 rounded-full blur-[70px] pointer-events-none transition-colors duration-500 ${
          selectedSide === 'HEADS'
            ? 'bg-cyan-400/40 shadow-[0_0_80px_rgba(0,240,255,0.6)]'
            : 'bg-purple-600/40 shadow-[0_0_80px_rgba(112,0,255,0.6)]'
        }`}
      />

      {/* Orbital High-Tech Rings (Active during 5s flip) */}
      {isFlipping && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
            animate={{ scale: 1.4, opacity: [0.3, 0.8, 0.3], rotate: 720 }}
            transition={{ duration: flipDuration, ease: 'linear' }}
            className="absolute w-72 h-72 rounded-full border border-cyan-400/40 border-dashed pointer-events-none"
          />
          <motion.div
            initial={{ scale: 1.2, opacity: 0, rotate: 0 }}
            animate={{ scale: 1.6, opacity: [0.2, 0.7, 0.2], rotate: -720 }}
            transition={{ duration: flipDuration, ease: 'linear' }}
            className="absolute w-80 h-80 rounded-full border border-purple-500/40 pointer-events-none"
          />
        </>
      )}

      {/* 3D Perspective Container */}
      <div 
        className="w-52 h-52 sm:w-60 sm:h-60"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={
            isFlipping
              ? {
                  rotateY: targetRotation,
                  rotateX: [0, 25, -20, 15, -10, 0],
                  y: [0, -80, -95, -40, -10, 0],
                  scale: [1, 1.08, 1.15, 1.05, 1],
                }
              : {
                  rotateY: selectedSide === 'HEADS' ? 0 : 180,
                  rotateX: 0,
                  y: [0, -6, 0],
                  scale: 1,
                }
          }
          transition={
            isFlipping
              ? {
                  duration: flipDuration,
                  ease: [0.25, 0.1, 0.25, 1], // Realistic cubic bezier deceleration
                }
              : {
                  rotateY: { duration: 0.6, ease: 'easeOut' },
                  y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
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
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-4"
            style={{
              transform: 'rotateY(0deg) translateZ(8px)',
              background: 'radial-gradient(circle at 35% 30%, #173247 0%, #0c1a26 40%, #060b12 85%)',
              border: '4px solid #00F0FF',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.4), inset 0 0 25px rgba(0, 240, 255, 0.3)',
            }}
          >
            {/* Outer Inscription Ring */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/30 flex items-center justify-center pointer-events-none">
              <div className="absolute top-2 text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-cyan-300 font-bold uppercase">
                CYBERFLIP • SOLANA
              </div>
              <div className="absolute bottom-2 text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-cyan-400/80 font-bold uppercase">
                1.98X MULTIPLIER
              </div>
            </div>

            {/* Cyan Specular Sheen */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent pointer-events-none" />

            {/* Inner Metallic Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-sm">
                <Zap className="w-9 h-9 sm:w-12 sm:h-12 text-cyan-400 drop-shadow-[0_0_10px_#00F0FF]" />
              </div>
              <span className="mt-2 text-base sm:text-lg font-black font-['Orbitron'] tracking-widest text-cyan-300 drop-shadow-[0_0_8px_#00F0FF]">
                HEADS
              </span>
              <span className="text-[10px] font-mono text-cyan-400/70 tracking-widest uppercase">
                50% PROBABILITY
              </span>
            </div>

            {/* Edge Grip Rivets */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF]"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translate(94px) translate(-50%, -50%)`,
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
                border: '4px solid rgba(15, 23, 42, 0.9)',
                background: 'rgba(10, 15, 25, 0.95)',
              }}
            />
          ))}

          {/* ================= TAILS FACE (Electric Violet) ================= */}
          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-4"
            style={{
              transform: 'rotateY(180deg) translateZ(8px)',
              background: 'radial-gradient(circle at 35% 30%, #30164e 0%, #1c0c2e 40%, #0a0414 85%)',
              border: '4px solid #A855F7',
              boxShadow: '0 0 35px rgba(168, 85, 247, 0.45), inset 0 0 25px rgba(112, 0, 255, 0.35)',
            }}
          >
            {/* Outer Inscription Ring */}
            <div className="absolute inset-2 rounded-full border border-purple-400/30 flex items-center justify-center pointer-events-none">
              <div className="absolute top-2 text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-purple-300 font-bold uppercase">
                PROVABLY FAIR • PVP
              </div>
              <div className="absolute bottom-2 text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-purple-400/80 font-bold uppercase">
                5-SECOND SETTLEMENT
              </div>
            </div>

            {/* Violet Specular Sheen */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-purple-400/15 to-transparent pointer-events-none" />

            {/* Inner Metallic Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-950/60 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-sm">
                <Flame className="w-9 h-9 sm:w-12 sm:h-12 text-purple-400 drop-shadow-[0_0_10px_#A855F7]" />
              </div>
              <span className="mt-2 text-base sm:text-lg font-black font-['Orbitron'] tracking-widest text-purple-300 drop-shadow-[0_0_8px_#A855F7]">
                TAILS
              </span>
              <span className="text-[10px] font-mono text-purple-400/70 tracking-widest uppercase">
                50% PROBABILITY
              </span>
            </div>

            {/* Edge Grip Rivets */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#A855F7]"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translate(94px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
