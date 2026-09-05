import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Zap, ExternalLink, CheckCircle2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { FlipResult } from '../types/game';
import { soundFx } from '../utils/audio';
import { getExplorerTxLink } from '../utils/blockchain';

interface WinLossOverlayProps {
  lastResult: FlipResult | null;
  onPlayAgain: () => void;
  onDoubleDown: () => void;
  onDismiss: () => void;
}

export const WinLossOverlay: React.FC<WinLossOverlayProps> = ({
  lastResult,
  onPlayAgain,
  onDoubleDown,
  onDismiss,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastResult) return;

    if (lastResult.isWin) {
      soundFx.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#00F0FF', '#10B981', '#7000FF', '#F59E0B', '#FFFFFF', '#22D3EE'],
        shapes: ['square', 'circle'],
        scalar: 1.1,
        gravity: 0.85,
      });

      const t1 = setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 55,
          spread: 60,
          origin: { x: 0.08, y: 0.75 },
          colors: ['#00F0FF', '#22D3EE', '#FFFFFF'],
          scalar: 1.2,
        });
        confetti({
          particleCount: 70,
          angle: 125,
          spread: 60,
          origin: { x: 0.92, y: 0.75 },
          colors: ['#10B981', '#34D399', '#FDE68A'],
          scalar: 1.2,
        });
      }, 180);

      const t2 = setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 90,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#F59E0B', '#7000FF', '#00F0FF'],
          shapes: ['star'],
          scalar: 1.5,
          gravity: 0.7,
        });
      }, 500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      soundFx.playDefeat();
    }
  }, [lastResult]);

  if (!lastResult) return null;

  const currency = lastResult.currency || 'ETH';
  const txUrl = lastResult.txHash ? getExplorerTxLink(lastResult.chainId || null, lastResult.txHash) : null;
  const win = lastResult.isWin;
  const accent = win ? '#10B981' : '#F43F5E';
  const accentSoft = win ? 'rgba(16,185,129,' : 'rgba(244,63,94,';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: -25 }}
        transition={{ type: 'spring', damping: 20, stiffness: 380 }}
        className="fixed inset-x-3 sm:inset-x-4 bottom-4 sm:bottom-8 z-40 max-w-lg mx-auto select-none"
      >
        <div
          ref={panelRef}
          className={`relative rounded-3xl p-4 sm:p-6 backdrop-blur-2xl border shadow-2xl overflow-hidden corner-brackets ${
            win
              ? 'bg-emerald-950/95 border-emerald-400/60'
              : 'bg-rose-950/95 border-rose-500/50'
          }`}
          style={{
            boxShadow: win
              ? '0 0 55px rgba(16,185,129,0.4), 0 0 30px rgba(16,185,129,0.22), inset 0 0 30px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 0 55px rgba(244,63,94,0.35), 0 0 30px rgba(244,63,94,0.2), inset 0 0 30px rgba(244,63,94,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <span className="cb-tl" />
          <span className="cb-br" />

          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-700 ${win ? 'w-64 sm:w-80 h-1.5 rounded-full' : 'w-48 sm:w-60 h-1 rounded-full'}`}
            style={{
              background: win
                ? 'linear-gradient(90deg, transparent, #10B981, #34D399, #FDE68A, #10B981, transparent)'
                : 'linear-gradient(90deg, transparent, #F43F5E, #FB7185, #F43F5E, transparent)',
              boxShadow: `0 0 18px ${accent}CC, 0 0 6px ${accent}`,
            }}
          />

          <div className={`absolute -top-20 -right-16 w-48 h-48 rounded-full pointer-events-none ${win ? 'bg-emerald-400/18' : 'bg-rose-400/14'}`} style={{ filter: 'blur(50px)' }} />
          <div className={`absolute -bottom-24 -left-16 w-52 h-52 rounded-full pointer-events-none ${win ? 'bg-cyan-400/10' : 'bg-orange-400/10'}`} style={{ filter: 'blur(55px)' }} />

          {win && (
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-4 left-1/2 -translate-x-1/2 w-[120%] h-[120%] pointer-events-none opacity-30"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${accentSoft}0.15) 60deg, transparent 120deg, ${accentSoft}0.1) 200deg, transparent 300deg)`,
                filter: 'blur(20px)',
              }}
            />
          )}

          <div className="flex items-start justify-between gap-2 relative">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 ${
                  win
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-400 text-rose-300'
                }`}
                style={{
                  boxShadow: win
                    ? '0 0 25px rgba(16,185,129,0.5), inset 0 0 14px rgba(16,185,129,0.2)'
                    : '0 0 25px rgba(244,63,94,0.5), inset 0 0 14px rgba(244,63,94,0.2)',
                }}
              >
                {win ? (
                  <motion.div
                    animate={{ y: [0, -4, 0], rotate: [-6, 6, -6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
                  </motion.div>
                ) : (
                  <Frown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" style={{ filter: 'drop-shadow(0 0 6px #F43F5E)' }} />
                )}
                <div
                  className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                    win
                      ? 'bg-amber-400 border-amber-200 text-amber-900'
                      : 'bg-slate-700 border-slate-500 text-slate-300'
                  }`}
                  style={{ boxShadow: win ? '0 0 10px #FBBF24' : undefined }}
                >
                  {win ? <Sparkles className="w-3 h-3" /> : <TrendingDown className="w-2.5 h-2.5" />}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span
                    className={`font-['Orbitron'] text-sm sm:text-base font-black tracking-wider ${
                      win ? 'text-emerald-300 text-glow-emerald' : 'text-rose-300'
                    }`}
                  >
                    {win ? (
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        VICTORY ACHIEVED!
                      </span>
                    ) : (
                      'ROUND FINISHED'
                    )}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-lg border backdrop-blur-sm ${
                      lastResult.winningSide === 'HEADS'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                        : 'bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-[0_0_8px_rgba(112,0,255,0.2)]'
                    }`}
                  >
                    Landed {lastResult.winningSide}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-300 mt-1">
                  {win ? (
                    <>
                      Won <strong className={`font-bold text-sm sm:text-base ${win ? 'text-emerald-400 text-glow-emerald' : 'text-rose-400'}`}>+{lastResult.payout.toFixed(3)} {currency}</strong> <span className="text-slate-400">(1.98x Multiplier)</span>
                    </>
                  ) : (
                    <>
                      Result: <strong className="font-bold text-sm sm:text-base text-rose-400">-{lastResult.betAmount.toFixed(3)} {currency}</strong>
                    </>
                  )}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    2% → 0x155A…5Af9
                  </span>
                  {txUrl && (
                    <>
                      <span className="text-slate-600">•</span>
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 transition-colors group/ex"
                      >
                        <span className="group/ex:underline font-bold">TX</span>
                        <ExternalLink className="w-2.5 h-2.5 transition-transform group/ex:translate-x-0.5 group/ex:-translate-y-0.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
              onClick={onDismiss}
              className={`p-1.5 rounded-xl text-xs font-mono shrink-0 transition-colors border ${
                win
                  ? 'text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-500/15 border-emerald-400/20 hover:border-emerald-400/40'
                  : 'text-rose-200/70 hover:text-rose-100 hover:bg-rose-500/15 border-rose-400/20 hover:border-rose-400/40'
              }`}
            >
              ✕
            </motion.button>
          </div>

          <div
            className="mt-3.5 sm:mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 sm:gap-3 relative"
            style={{ borderImage: `linear-gradient(90deg, transparent, ${accent}30, transparent) 1` }}
          >
            <motion.button
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => {
                soundFx.playClick();
                onPlayAgain();
              }}
              className="relative group py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-mono text-[11px] sm:text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/25 flex items-center justify-center gap-1.5 transition-all overflow-hidden backdrop-blur-sm"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.25)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }}
              />
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-500 group-hover:rotate-[-360deg]" />
              <span className="truncate relative">Same Bet ({lastResult.betAmount} {currency})</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => {
                soundFx.playClick();
                onDoubleDown();
              }}
              className="relative group py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-mono text-[11px] sm:text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all overflow-hidden border"
              style={{
                background: 'linear-gradient(135deg, #7000FF 0%, #581C87 50%, #4338CA 100%)',
                border: '1px solid rgba(192,132,252,0.5)',
                boxShadow: '0 0 22px rgba(112,0,255,0.5), 0 0 10px rgba(112,0,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 18px rgba(192,132,252,0.2)',
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.25) 0%, transparent 50%)' }}
              />
              <div className="relative overflow-hidden inset-0 absolute">
                <div className="animate-premium-shimmer absolute inset-0" />
              </div>
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 transition-transform duration-300 group-hover:scale-110" style={{ filter: 'drop-shadow(0 0 5px #FBBF24)' }} />
              <span className="truncate relative font-['Orbitron'] tracking-wider">2X ({(lastResult.betAmount * 2).toFixed(3)} {currency})</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
