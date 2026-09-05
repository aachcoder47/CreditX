import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoinSide } from '../types/game';
import { Zap, Flame, Sparkles } from 'lucide-react';

interface Coin3DProps {
  isFlipping: boolean;
  selectedSide: CoinSide;
  winningSide: CoinSide | null;
  flipDuration: number;
  onFlipComplete?: () => void;
}

export const Coin3D: React.FC<Coin3DProps> = ({
  isFlipping,
  selectedSide,
  winningSide,
  flipDuration = 5,
  onFlipComplete,
}) => {
  const [currentRotation, setCurrentRotation] = useState(selectedSide === 'HEADS' ? 0 : 180);
  const [showLandingFlash, setShowLandingFlash] = useState(false);
  const [reflectionX, setReflectionX] = useState(-30);
  const wasFlippingRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setReflectionX((prev) => (prev >= 130 ? -30 : prev + 0.8));
    }, 35);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isFlipping) {
      setCurrentRotation((prev) => {
        const base = Math.round(prev / 360) * 360;
        return selectedSide === 'HEADS' ? base : base + 180;
      });
    }
  }, [selectedSide, isFlipping]);

  useEffect(() => {
    if (isFlipping && !wasFlippingRef.current) {
      wasFlippingRef.current = true;
      setShowLandingFlash(false);
      setCurrentRotation((prev) => {
        const base = Math.ceil((prev + 2880) / 360) * 360;
        const targetOffset = winningSide === 'TAILS' ? 180 : 0;
        return base + targetOffset;
      });
    } else if (!isFlipping && wasFlippingRef.current) {
      wasFlippingRef.current = false;
      setShowLandingFlash(true);
      const timer = setTimeout(() => setShowLandingFlash(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, winningSide]);

  const isHeads = selectedSide === 'HEADS';
  const winAccent = winningSide === 'HEADS' ? '#00F0FF' : '#A855F7';

  return (
    <div className="relative flex items-center justify-center py-4 sm:py-6 select-none overflow-visible">
      <motion.div
        animate={{
          scale: isFlipping ? [1, 1.4, 1.2, 1.45, 1.15, 1] : [1, 1.12, 1],
          opacity: isFlipping ? [0.5, 1, 0.8, 1, 0.85, 0.7] : [0.4, 0.65, 0.4],
        }}
        transition={{
          duration: isFlipping ? flipDuration : 4,
          repeat: isFlipping ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute w-56 h-56 sm:w-80 sm:h-80 rounded-full pointer-events-none transition-colors duration-700 ${
          isHeads
            ? 'bg-cyan-400/35 shadow-[0_0_120px_rgba(0,240,255,0.55),0_0_60px_rgba(0,240,255,0.4),inset_0_0_80px_rgba(0,240,255,0.15)]'
            : 'bg-purple-600/35 shadow-[0_0_120px_rgba(112,0,255,0.55),0_0_60px_rgba(112,0,255,0.4),inset_0_0_80px_rgba(112,0,255,0.15)]'
        }`}
        style={{ filter: 'blur(80px)' }}
      />

      <motion.div
        animate={{
          scale: isFlipping ? [1, 1.2, 1] : [0.95, 1.08, 0.95],
          opacity: isFlipping ? [0.3, 0.7, 0.3] : [0.2, 0.45, 0.2],
        }}
        transition={{ duration: isFlipping ? flipDuration / 2.5 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full pointer-events-none ${
          isHeads ? 'bg-cyan-300/40' : 'bg-purple-400/40'
        }`}
        style={{ filter: 'blur(45px)' }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={isFlipping ? { rotate: 360, scale: [1, 1.15, 1] } : { rotate: 360 }}
          transition={{ duration: isFlipping ? flipDuration * 0.4 : 10, repeat: Infinity, ease: 'linear' }}
          className={`w-64 h-64 sm:w-88 sm:h-88 rounded-full border-2 transition-all duration-700 ${
            isFlipping
              ? 'border-cyan-400/60 shadow-[0_0_40px_rgba(0,240,255,0.45),inset_0_0_30px_rgba(0,240,255,0.15)] scale-110'
              : 'border-white/10 opacity-40'
          }`}
          style={{
            borderStyle: 'dashed',
            width: isFlipping ? '320px' : '280px',
            height: isFlipping ? '320px' : '280px',
            maxWidth: '90vw',
            maxHeight: '90vw',
          }}
        />

        <motion.div
          animate={isFlipping ? { rotate: -360, scale: [1, 1.08, 1] } : { rotate: -360 }}
          transition={{ duration: isFlipping ? flipDuration * 0.35 : 14, repeat: Infinity, ease: 'linear' }}
          className={`absolute w-56 h-56 sm:w-76 sm:h-76 rounded-full border transition-all duration-700 ${
            isFlipping
              ? 'border-purple-500/50 shadow-[0_0_35px_rgba(168,85,247,0.4),inset_0_0_25px_rgba(112,0,255,0.12)] scale-106'
              : 'border-white/5 opacity-30'
          }`}
          style={{
            width: isFlipping ? '280px' : '240px',
            height: isFlipping ? '280px' : '240px',
            maxWidth: '80vw',
            maxHeight: '80vw',
          }}
        />

        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
            isFlipping ? 'opacity-80 scale-102' : 'opacity-40'
          }`}
          style={{
            width: isFlipping ? '230px' : '200px',
            height: isFlipping ? '230px' : '200px',
            maxWidth: '70vw',
            maxHeight: '70vw',
            border: `1px solid ${winAccent}30`,
            boxShadow: `0 0 25px ${winAccent}25, inset 0 0 20px ${winAccent}10`,
          }}
        />
      </div>

      <AnimatePresence>
        {showLandingFlash && (
          <>
            <motion.div
              initial={{ scale: 0.7, opacity: 1 }}
              animate={{ scale: 2.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none z-20 ${
                winningSide === 'HEADS'
                  ? 'bg-cyan-400/50 shadow-[0_0_120px_#00F0FF,0_0_60px_#00F0FF]'
                  : 'bg-purple-500/50 shadow-[0_0_120px_#A855F7,0_0_60px_#A855F7]'
              }`}
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 3.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
              className={`absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full pointer-events-none z-19 border-2 ${
                winningSide === 'HEADS' ? 'border-cyan-300/60' : 'border-purple-300/60'
              }`}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: 0, y: 0 }}
              animate={{
                scale: [0.95, 1.02, 1],
                opacity: [0, 1, 1],
                x: [0, 0, 0],
                y: [0, -2, 0],
              }}
              transition={{ duration: 0.9, times: [0, 0.4, 1], ease: 'easeOut', delay: 0.25 }}
              className="absolute pointer-events-none z-21"
              style={{ top: '32%' }}
            >
              <Sparkles
                className={`w-8 h-8 sm:w-10 sm:h-10 ${
                  winningSide === 'HEADS' ? 'text-cyan-300' : 'text-purple-300'
                }`}
                style={{ filter: `drop-shadow(0 0 14px ${winAccent})` }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className="w-44 h-44 sm:w-56 sm:h-56 md:w-60 md:h-60 relative z-10"
        style={{ perspective: 1600 }}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{
            rotateY: currentRotation,
            rotateX: isFlipping ? [0, 26, -20, 16, -10, 4, 0] : 0,
            y: isFlipping ? [0, -95, -110, -55, -18, -5, 0] : [0, -10, 0],
            scale: isFlipping ? [1, 1.12, 1.18, 1.08, 1.02, 1] : 1,
          }}
          transition={
            isFlipping
              ? {
                  duration: flipDuration,
                  ease: [0.18, 0.89, 0.32, 1],
                }
              : {
                  rotateY: { duration: 0.65, ease: [0.25, 1, 0.5, 1] },
                  y: { repeat: Infinity, duration: 3.8, ease: 'easeInOut' },
                  scale: { duration: 0.3 },
                }
          }
          onAnimationComplete={() => {
            if (isFlipping && onFlipComplete) {
              onFlipComplete();
            }
          }}
        >
          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-3 sm:p-4 shadow-2xl"
            style={{
              transform: 'rotateY(0deg) translateZ(10px)',
              background: `
                radial-gradient(circle at 30% 20%, #1b4b6e 0%, #0f2a3d 30%, #081824 60%, #040a11 100%)
              `,
              border: '4px solid #00F0FF',
              boxShadow: `
                0 0 45px rgba(0, 240, 255, 0.6),
                0 0 25px rgba(0, 240, 255, 0.35),
                inset 0 0 35px rgba(0, 240, 255, 0.3),
                inset 0 -8px 22px rgba(0, 60, 80, 0.5),
                inset 0 6px 20px rgba(120, 230, 255, 0.18)
              `,
            }}
          >
            <div className="absolute inset-1.5 sm:inset-2 rounded-full border-[1.5px] border-cyan-400/40 flex items-center justify-center pointer-events-none shadow-[inset_0_0_18px_rgba(0,240,255,0.18)]" />
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-cyan-300/20 pointer-events-none" />

            <div className="absolute top-1.5 sm:top-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-cyan-300 font-bold uppercase">
              CYBERFLIP • ON-CHAIN
            </div>
            <div className="absolute bottom-1.5 sm:bottom-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-cyan-400/85 font-bold uppercase">
              1.98X MULTIPLIER
            </div>

            <div
              className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
              style={{
                background: `linear-gradient(${105 + reflectionX * 0.8}deg,
                  transparent ${reflectionX - 20}%,
                  rgba(140, 240, 255, 0.05) ${reflectionX - 10}%,
                  rgba(180, 250, 255, 0.28) ${reflectionX}%,
                  rgba(140, 240, 255, 0.05) ${reflectionX + 10}%,
                  transparent ${reflectionX + 20}%)`,
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-cyan-950/75 border border-cyan-400/65 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-108"
                style={{
                  boxShadow: '0 0 24px rgba(0,240,255,0.5), inset 0 0 16px rgba(0,240,255,0.2)',
                  background: 'linear-gradient(160deg, rgba(8,47,73,0.9) 0%, rgba(6,26,40,0.9) 100%)',
                }}
              >
                <Zap className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px #00F0FF) drop-shadow(0 0 5px #22D3EE)' }} />
              </div>
              <span className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg font-black font-['Orbitron'] tracking-widest text-cyan-300 text-glow-cyan text-shimmer">
                HEADS
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono text-cyan-400/85 tracking-widest uppercase">
                50% PROBABILITY
              </span>
            </div>

            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const sm = typeof window !== 'undefined' && window.innerWidth < 640;
              const big = deg % 90 === 0;
              return (
                <div
                  key={deg}
                  className={`absolute rounded-full ${big ? 'bg-cyan-200 shadow-[0_0_9px_#00F0FF]' : 'bg-cyan-300 shadow-[0_0_6px_#00F0FF]'}`}
                  style={{
                    width: big ? (sm ? '5px' : '7px') : (sm ? '2.5px' : '3.5px'),
                    height: big ? (sm ? '5px' : '7px') : (sm ? '2.5px' : '3.5px'),
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translate(${sm ? 78 : 104}px) translate(-50%, -50%)`,
                  }}
                />
              );
            })}
          </div>

          {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((z, i) => (
            <div
              key={z}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `translateZ(${z}px)`,
                border: `1.5px solid ${i === 4 ? 'rgba(10,18,35,0.95)' : 'rgba(12,22,40,0.85)'}`,
                background: `radial-gradient(circle, rgba(5,10,20,${0.92 - Math.abs(z) * 0.02}) 0%, rgba(2,5,12,0.98) 100%)`,
                boxShadow: Math.abs(z) === 8 ? `inset 0 0 12px ${i < 4 ? 'rgba(0,240,255,0.2)' : 'rgba(112,0,255,0.2)'}` : undefined,
              }}
            />
          ))}

          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-3 sm:p-4 shadow-2xl"
            style={{
              transform: 'rotateY(180deg) translateZ(10px)',
              background: `
                radial-gradient(circle at 30% 20%, #3c1666 0%, #220d42 30%, #120628 60%, #06020f 100%)
              `,
              border: '4px solid #A855F7',
              boxShadow: `
                0 0 45px rgba(168, 85, 247, 0.6),
                0 0 25px rgba(112, 0, 255, 0.35),
                inset 0 0 35px rgba(112, 0, 255, 0.32),
                inset 0 -8px 22px rgba(40, 10, 80, 0.5),
                inset 0 6px 20px rgba(220, 180, 255, 0.18)
              `,
            }}
          >
            <div className="absolute inset-1.5 sm:inset-2 rounded-full border-[1.5px] border-purple-400/40 flex items-center justify-center pointer-events-none shadow-[inset_0_0_18px_rgba(112,0,255,0.2)]" />
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-purple-300/20 pointer-events-none" />

            <div className="absolute top-1.5 sm:top-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-purple-300 font-bold uppercase">
              PROVABLY FAIR • PVP
            </div>
            <div className="absolute bottom-1.5 sm:bottom-2 text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-purple-400/85 font-bold uppercase">
              5-SEC SETTLEMENT
            </div>

            <div
              className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
              style={{
                background: `linear-gradient(${105 + reflectionX * 0.8}deg,
                  transparent ${reflectionX - 20}%,
                  rgba(230, 200, 255, 0.05) ${reflectionX - 10}%,
                  rgba(240, 220, 255, 0.28) ${reflectionX}%,
                  rgba(230, 200, 255, 0.05) ${reflectionX + 10}%,
                  transparent ${reflectionX + 20}%)`,
              }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-purple-950/75 border border-purple-400/65 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-108"
                style={{
                  boxShadow: '0 0 24px rgba(168,85,247,0.5), inset 0 0 16px rgba(112,0,255,0.22)',
                  background: 'linear-gradient(160deg, rgba(45,12,78,0.9) 0%, rgba(24,8,44,0.9) 100%)',
                }}
              >
                <Flame className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400" style={{ filter: 'drop-shadow(0 0 12px #A855F7) drop-shadow(0 0 5px #7000FF)' }} />
              </div>
              <span className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg font-black font-['Orbitron'] tracking-widest text-purple-300 text-glow-violet text-shimmer">
                TAILS
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono text-purple-400/85 tracking-widest uppercase">
                50% PROBABILITY
              </span>
            </div>

            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const sm = typeof window !== 'undefined' && window.innerWidth < 640;
              const big = deg % 90 === 0;
              return (
                <div
                  key={deg}
                  className={`absolute rounded-full ${big ? 'bg-purple-200 shadow-[0_0_9px_#A855F7]' : 'bg-purple-300 shadow-[0_0_6px_#A855F7]'}`}
                  style={{
                    width: big ? (sm ? '5px' : '7px') : (sm ? '2.5px' : '3.5px'),
                    height: big ? (sm ? '5px' : '7px') : (sm ? '2.5px' : '3.5px'),
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translate(${sm ? 78 : 104}px) translate(-50%, -50%)`,
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="absolute top-2 right-4 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] font-mono text-slate-400 pointer-events-none backdrop-blur-sm">
        <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span>3D CRYPTO ENGINE</span>
      </div>

      <div className="absolute bottom-3 left-4 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 text-[9px] font-mono text-slate-500 pointer-events-none">
        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
        RENDERED 60FPS
      </div>
    </div>
  );
};
