import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoinSide } from '../types/game';
import { Sparkles, Shield, Award } from 'lucide-react';

interface Coin3DProps {
  isFlipping: boolean;
  selectedSide: CoinSide;
  winningSide: CoinSide | null;
  flipDuration?: number;
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
      setReflectionX((prev) => (prev >= 130 ? -30 : prev + 0.9));
    }, 32);
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
      const timer = setTimeout(() => setShowLandingFlash(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [isFlipping, winningSide]);

  const isHeads = selectedSide === 'HEADS';
  const winAccent = winningSide === 'HEADS' ? '#00F0FF' : '#F59E0B';

  return (
    <div className="relative flex items-center justify-center py-4 sm:py-7 select-none overflow-visible w-full">
      {/* Ambient Radial Bloom - Soft & Institutional (Hatom style) */}
      <motion.div
        animate={{
          scale: isFlipping ? [1, 1.25, 1.15, 1.3, 1] : [1, 1.08, 1],
          opacity: isFlipping ? [0.35, 0.7, 0.5, 0.75, 0.4] : [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: isFlipping ? flipDuration : 4.5,
          repeat: isFlipping ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full pointer-events-none transition-colors duration-700 ${
          isHeads
            ? 'bg-cyan-500/25 shadow-[0_0_100px_rgba(0,240,255,0.35)]'
            : 'bg-amber-500/25 shadow-[0_0_100px_rgba(245,158,11,0.35)]'
        }`}
        style={{ filter: 'blur(70px)' }}
      />

      {/* Landing Celebration Aura */}
      <AnimatePresence>
        {showLandingFlash && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className={`absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full pointer-events-none z-20 ${
                winningSide === 'HEADS'
                  ? 'bg-cyan-400/35 shadow-[0_0_90px_#00F0FF]'
                  : 'bg-amber-400/35 shadow-[0_0_90px_#F59E0B]'
              }`}
            />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute pointer-events-none z-21 flex items-center justify-center"
            >
              <Sparkles
                className={`w-9 h-9 sm:w-12 sm:h-12 ${
                  winningSide === 'HEADS' ? 'text-cyan-300' : 'text-amber-300'
                }`}
                style={{ filter: `drop-shadow(0 0 16px ${winAccent})` }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3D Coin Container with responsive sizing */}
      <div
        className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 relative z-10"
        style={{ perspective: 1400 }}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{
            rotateY: currentRotation,
            rotateX: isFlipping ? [0, 22, -18, 12, -6, 2, 0] : 0,
            y: isFlipping ? [0, -85, -100, -50, -15, -4, 0] : [0, -8, 0],
            scale: isFlipping ? [1, 1.1, 1.15, 1.05, 1.02, 1] : 1,
          }}
          transition={
            isFlipping
              ? {
                  duration: flipDuration,
                  ease: [0.16, 0.95, 0.32, 1],
                }
              : {
                  rotateY: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
                  y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                  scale: { duration: 0.3 },
                }
          }
          onAnimationComplete={() => {
            if (isFlipping && onFlipComplete) {
              onFlipComplete();
            }
          }}
        >
          {/* ─── HEADS FACE (Cyan / Platinum Mint) ─── */}
          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-3 sm:p-5 shadow-2xl overflow-hidden"
            style={{
              transform: 'rotateY(0deg) translateZ(8px)',
              background: `
                radial-gradient(circle at 35% 25%, #1A2836 0%, #0D1722 45%, #070D14 100%)
              `,
              border: '2px solid rgba(0, 240, 255, 0.65)',
              boxShadow: `
                0 0 35px rgba(0, 240, 255, 0.35),
                inset 0 0 25px rgba(0, 240, 255, 0.2),
                inset 0 -6px 16px rgba(0, 20, 35, 0.8),
                inset 0 4px 12px rgba(180, 245, 255, 0.25)
              `,
            }}
          >
            {/* Concentric Mint Rings */}
            <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-cyan-400/30 pointer-events-none" />
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-cyan-300/15 pointer-events-none" />

            {/* Specular Light Reflection Sweep */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
              style={{
                background: `linear-gradient(${110 + reflectionX * 0.7}deg,
                  transparent ${reflectionX - 25}%,
                  rgba(180, 245, 255, 0.04) ${reflectionX - 12}%,
                  rgba(255, 255, 255, 0.35) ${reflectionX}%,
                  rgba(180, 245, 255, 0.04) ${reflectionX + 12}%,
                  transparent ${reflectionX + 25}%)`,
              }}
            />

            {/* Inscription Labels */}
            <div className="absolute top-2 sm:top-3 text-[8px] sm:text-[9px] font-mono-ui font-semibold tracking-[0.2em] text-cyan-300/90 uppercase">
              CREDITX • VERIFIED
            </div>
            <div className="absolute bottom-2 sm:bottom-3 text-[8px] sm:text-[9px] font-mono-ui font-semibold tracking-[0.2em] text-cyan-400/80 uppercase">
              1.98X MULTIPLIER
            </div>

            {/* Center Monogram Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(3, 105, 161, 0.4) 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.5)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <Shield className="w-6 h-6 sm:w-9 sm:h-9 text-cyan-300" style={{ filter: 'drop-shadow(0 0 8px #00F0FF)' }} />
              </div>
              <span className="mt-1 sm:mt-1.5 font-display text-sm sm:text-base md:text-lg font-bold tracking-wider text-white">
                HEADS
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono-ui text-cyan-400/80 tracking-wider uppercase">
                50.0% PROBABILITY
              </span>
            </div>

            {/* Mint Dentils Around Rim */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-300/70"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translate(0, -${typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 96}px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>

          {/* ─── 3D Rim Layers for Realistic Edge Thickness ─── */}
          {[-6, -4, -2, 0, 2, 4, 6].map((z) => (
            <div
              key={z}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `translateZ(${z}px)`,
                background: 'linear-gradient(90deg, rgba(8,13,20,0.95), rgba(15,25,38,0.95))',
                border: '1.5px solid rgba(0, 240, 255, 0.2)',
              }}
            />
          ))}

          {/* ─── TAILS FACE (Gold / Amber Sovereign Mint) ─── */}
          <div
            className="absolute inset-0 rounded-full backface-hidden flex flex-col items-center justify-center p-3 sm:p-5 shadow-2xl overflow-hidden"
            style={{
              transform: 'rotateY(180deg) translateZ(8px)',
              background: `
                radial-gradient(circle at 35% 25%, #2B1D0C 0%, #191005 45%, #0B0702 100%)
              `,
              border: '2px solid rgba(245, 158, 11, 0.75)',
              boxShadow: `
                0 0 35px rgba(245, 158, 11, 0.35),
                inset 0 0 25px rgba(245, 158, 11, 0.2),
                inset 0 -6px 16px rgba(40, 20, 0, 0.8),
                inset 0 4px 12px rgba(255, 220, 150, 0.25)
              `,
            }}
          >
            {/* Concentric Mint Rings */}
            <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-amber-400/30 pointer-events-none" />
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-amber-300/15 pointer-events-none" />

            {/* Specular Light Reflection Sweep */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
              style={{
                background: `linear-gradient(${110 + reflectionX * 0.7}deg,
                  transparent ${reflectionX - 25}%,
                  rgba(255, 230, 180, 0.04) ${reflectionX - 12}%,
                  rgba(255, 255, 255, 0.35) ${reflectionX}%,
                  rgba(255, 230, 180, 0.04) ${reflectionX + 12}%,
                  transparent ${reflectionX + 25}%)`,
              }}
            />

            {/* Inscription Labels */}
            <div className="absolute top-2 sm:top-3 text-[8px] sm:text-[9px] font-mono-ui font-semibold tracking-[0.2em] text-amber-300/90 uppercase">
              CREDITX • SOVEREIGN
            </div>
            <div className="absolute bottom-2 sm:bottom-3 text-[8px] sm:text-[9px] font-mono-ui font-semibold tracking-[0.2em] text-amber-400/80 uppercase">
              1.98X MULTIPLIER
            </div>

            {/* Center Monogram Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(180, 83, 9, 0.4) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <Award className="w-6 h-6 sm:w-9 sm:h-9 text-amber-300" style={{ filter: 'drop-shadow(0 0 8px #F59E0B)' }} />
              </div>
              <span className="mt-1 sm:mt-1.5 font-display text-sm sm:text-base md:text-lg font-bold tracking-wider text-white">
                TAILS
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono-ui text-amber-400/80 tracking-wider uppercase">
                50.0% PROBABILITY
              </span>
            </div>

            {/* Mint Dentils Around Rim */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-300/70"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translate(0, -${typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 96}px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
