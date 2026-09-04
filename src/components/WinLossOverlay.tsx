import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';
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
  useEffect(() => {
    if (!lastResult) return;

    if (lastResult.isWin) {
      soundFx.playVictory();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#10B981', '#7000FF', '#F59E0B', '#FFFFFF'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#00F0FF', '#7000FF'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#00F0FF', '#10B981'],
        });
      }, 200);

      return () => clearTimeout(timer);
    } else {
      soundFx.playDefeat();
    }
  }, [lastResult]);

  if (!lastResult) return null;

  const currency = lastResult.currency || 'ETH';
  const txUrl = lastResult.txHash ? getExplorerTxLink(lastResult.chainId || null, lastResult.txHash) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 350 }}
        className="fixed inset-x-3 sm:inset-x-4 bottom-4 sm:bottom-8 z-40 max-w-lg mx-auto select-none"
      >
        <div
          className={`rounded-3xl p-4 sm:p-6 backdrop-blur-2xl border shadow-2xl relative overflow-hidden ${
            lastResult.isWin
              ? 'bg-emerald-950/95 border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.35)]'
              : 'bg-rose-950/95 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
          }`}
        >
          {/* Top Decorative Flare */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 rounded-full ${
              lastResult.isWin ? 'bg-emerald-400 shadow-[0_0_15px_#10B981]' : 'bg-rose-400 shadow-[0_0_15px_#F43F5E]'
            }`}
          />

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 ${
                  lastResult.isWin
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                }`}
              >
                {lastResult.isWin ? (
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-bounce" />
                ) : (
                  <Frown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={`font-['Orbitron'] text-sm sm:text-base font-black tracking-wider ${
                      lastResult.isWin ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {lastResult.isWin ? 'VICTORY ACHIEVED!' : 'ROUND FINISHED'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                    Landed {lastResult.winningSide}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-300 mt-1">
                  {lastResult.isWin ? (
                    <>
                      Won <strong className="text-emerald-400 font-bold text-sm">+{lastResult.payout.toFixed(3)} {currency}</strong> (1.98x Multiplier)
                    </>
                  ) : (
                    <>
                      Result: <strong className="text-rose-400 font-bold text-sm">-{lastResult.betAmount.toFixed(3)} {currency}</strong>
                    </>
                  )}
                </p>

                {/* On-chain verification info */}
                <div className="mt-1 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    2% Commission to 0x155A...5Af9
                  </span>
                  {txUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                      >
                        <span>Tx Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-mono shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Action Button Bar with Spring Physics */}
          <div className="mt-3.5 sm:mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                soundFx.playClick();
                onPlayAgain();
              }}
              className="py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-mono text-[11px] sm:text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="truncate">Same Bet ({lastResult.betAmount} {currency})</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                soundFx.playClick();
                onDoubleDown();
              }}
              className="py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-mono text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/40 shadow-[0_0_15px_rgba(112,0,255,0.4)] flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="truncate">2X ({(lastResult.betAmount * 2).toFixed(3)} {currency})</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
