import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Zap, ExternalLink, X } from 'lucide-react';
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#10B981', '#F59E0B', '#FFFFFF'],
        scalar: 1.1,
      });
    } else {
      soundFx.playDefeat();
    }
  }, [lastResult]);

  if (!lastResult) return null;

  const currency = lastResult.currency || 'ETH';
  const txUrl = lastResult.txHash ? getExplorerTxLink(lastResult.chainId || null, lastResult.txHash) : null;
  const win = lastResult.isWin;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 400 }}
        className="fixed inset-x-3 sm:inset-x-4 bottom-4 sm:bottom-6 z-40 max-w-lg mx-auto select-none"
      >
        <div
          className={`relative rounded-2xl p-4 sm:p-5 backdrop-blur-2xl border shadow-2xl overflow-hidden ${
            win
              ? 'bg-[#061511]/95 border-emerald-500/40 shadow-[0_20px_60px_rgba(16,185,129,0.25)]'
              : 'bg-[#180A0F]/95 border-rose-500/30 shadow-[0_20px_60px_rgba(244,63,94,0.2)]'
          }`}
        >
          {/* Top highlight glow */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: win
                ? 'linear-gradient(90deg, transparent, #10B981, #00F0FF, transparent)'
                : 'linear-gradient(90deg, transparent, #F43F5E, transparent)',
            }}
          />

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  win
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                }`}
              >
                {win ? <Trophy className="w-6 h-6" /> : <Frown className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-extrabold text-base sm:text-lg text-white">
                    {win ? 'VICTORY' : 'ROUND DEFEAT'}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono-ui font-bold ${
                      win ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {lastResult.winningSide} LANDED
                  </span>
                </div>

                <div className="font-mono-ui text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                  {win ? (
                    <span className="text-emerald-400 font-bold">
                      +{lastResult.payout} {currency} Won
                    </span>
                  ) : (
                    <span className="text-rose-400">
                      -{lastResult.betAmount} {currency}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action CTAs */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center gap-2">
            {win && (
              <button
                onClick={onDoubleDown}
                className="flex-1 btn-defi py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Double Down</span>
              </button>
            )}

            <button
              onClick={onPlayAgain}
              className="flex-1 btn-defi btn-cta-cyan py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Flip Again</span>
            </button>

            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all bg-white/[0.02]"
                title="View on Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
