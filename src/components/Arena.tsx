import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ExternalLink,
  Loader2, ArrowRight, Wallet, Sparkles
} from 'lucide-react';
import type { CoinSide, GameState, WalletState } from '../types/game';
import { Coin3D } from './Coin3D';
import { soundFx } from '../utils/audio';
import { COMMISSION_TREASURY_ADDRESS, calculateCommission, getExplorerAddressLink } from '../utils/blockchain';

interface ArenaProps {
  wallet: WalletState;
  gameState: GameState;
  selectedSide: CoinSide;
  winningSide: CoinSide | null;
  betAmount: number;
  flipCountdown: number;
  txError: string | null;
  onSelectSide: (side: CoinSide) => void;
  onChangeBet: (amount: number) => void;
  onStartFlip: () => void;
  onOpenWalletModal: () => void;
  onOpenProvablyFair: () => void;
}

export const Arena: React.FC<ArenaProps> = ({
  wallet, gameState, selectedSide, winningSide,
  betAmount, flipCountdown, txError,
  onSelectSide, onChangeBet, onStartFlip,
  onOpenWalletModal, onOpenProvablyFair,
}) => {
  const [inputVal, setInputVal] = useState(betAmount.toString());
  const [customError, setCustomError] = useState<string | null>(null);

  const currency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));
  const presets = isEthBased ? [0.005, 0.01, 0.05, 0.1, 0.5] : [0.1, 0.5, 1.0, 2.5, 5.0];

  useEffect(() => { setInputVal(betAmount.toString()); }, [betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) { 
      setCustomError(`Enter a valid ${currency} amount`); 
      return; 
    }
    if (wallet.isConnected && num > wallet.solBalance) {
      setCustomError(`Insufficient ${currency} balance`);
    } else { 
      setCustomError(null); 
      onChangeBet(num); 
    }
  };

  const handlePreset = (amt: number) => { 
    soundFx.playClick(); 
    setCustomError(null); 
    onChangeBet(amt); 
  };

  const handleMult = (mult: number) => {
    soundFx.playClick();
    const min = isEthBased ? 0.001 : 0.01;
    const p = isEthBased ? 4 : 3;
    onChangeBet(Math.max(min, Number((betAmount * mult).toFixed(p))));
    setCustomError(null);
  };

  const handleMax = () => {
    soundFx.playClick();
    if (wallet.isConnected && wallet.solBalance > 0) {
      const p = isEthBased ? 1000 : 100;
      onChangeBet(Math.max(0.001, Math.floor(wallet.solBalance * p) / p));
    } else { 
      onChangeBet(isEthBased ? 0.1 : 5.0); 
    }
  };

  const isFlipping   = gameState === 'FLIPPING';
  const isAwaitingTx = gameState === 'AWAITING_TX';
  const isBusy       = isFlipping || isAwaitingTx;
  const isCyan       = selectedSide === 'HEADS';

  const payout  = (betAmount * 1.98).toFixed(isEthBased ? 4 : 3);
  const profit  = (betAmount * 0.98).toFixed(isEthBased ? 4 : 3);
  const commission = calculateCommission(betAmount);
  const treasuryUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Sub-header Ribbon (Charm.fi minimalist style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono-ui text-xs text-slate-400 uppercase tracking-wider">
            Double-or-Nothing Protocol · 1.98x
          </span>
        </div>
        <button
          onClick={onOpenProvablyFair}
          className="flex items-center gap-1.5 font-mono-ui text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-lg border border-white/5 hover:border-cyan-500/20 bg-white/[0.02]"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Provably Fair · 2% Fee</span>
        </button>
      </div>

      {/* Main Grid: Responsive 1 col on mobile, 2 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_430px] gap-4 sm:gap-6 items-stretch">

        {/* ─── LEFT PANEL: Coin Arena ─── */}
        <div className="defi-card p-4 sm:p-7 flex flex-col justify-between specular-border relative overflow-hidden">
          
          {/* Top Segmented Heads / Tails Switcher (Soul.io / iOS style) */}
          <div className="w-full max-w-md mx-auto mb-4 sm:mb-6">
            <div className="segmented-control p-1 rounded-2xl bg-black/50 border border-white/10">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => { soundFx.playClick(); onSelectSide('HEADS'); }}
                className={`relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-display font-semibold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 select-none ${
                  isCyan ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                } ${isBusy ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isCyan && (
                  <motion.div
                    layoutId="arenaSideToggle"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-600/30 via-cyan-500/20 to-cyan-400/25 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
                  HEADS
                </span>
                <span className="relative z-10 font-mono-ui text-[10px] sm:text-xs text-cyan-300/80 bg-cyan-500/15 py-0.5 px-2 rounded-md border border-cyan-400/20">
                  1.98x
                </span>
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => { soundFx.playClick(); onSelectSide('TAILS'); }}
                className={`relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-display font-semibold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 select-none ${
                  !isCyan ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                } ${isBusy ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {!isCyan && (
                  <motion.div
                    layoutId="arenaSideToggle"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-400/25 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                  TAILS
                </span>
                <span className="relative z-10 font-mono-ui text-[10px] sm:text-xs text-amber-300/80 bg-amber-500/15 py-0.5 px-2 rounded-md border border-amber-400/20">
                  1.98x
                </span>
              </button>
            </div>
          </div>

          {/* Center 3D Interactive Coin */}
          <div className="relative my-auto flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
            <Coin3D
              isFlipping={isFlipping}
              selectedSide={selectedSide}
              winningSide={winningSide}
              flipDuration={5}
            />

            {/* In-flight Countdown Indicator */}
            <AnimatePresence>
              {isFlipping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-3 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/30 backdrop-blur-md shadow-lg"
                >
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono-ui text-xs font-semibold text-cyan-300">
                    Resolving On-Chain Seed in {flipCountdown.toFixed(1)}s
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Card Footer with Provably Fair Live Proof */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-ui text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Target: <strong className="text-white">{selectedSide}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Fair Probability: <strong className="text-emerald-400">50.00%</strong></span>
              <span>Multiplier: <strong className="text-cyan-400">1.98x</strong></span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Wager Console (Charm / Hatom style) ─── */}
        <div className="defi-card p-4 sm:p-6 flex flex-col justify-between specular-border">
          <div>
            {/* Console Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Wager Setup
                </h3>
                <p className="font-mono-ui text-[11px] text-slate-400">
                  Select stake & verify returns
                </p>
              </div>

              {/* Wallet Balance Display */}
              <div className="text-right">
                <div className="font-mono-ui text-[11px] text-slate-400 uppercase">Available</div>
                <div className="font-mono-ui text-xs sm:text-sm font-semibold text-slate-200">
                  {wallet.isConnected ? `${wallet.solBalance.toFixed(isEthBased ? 4 : 2)} ${currency}` : 'Disconnected'}
                </div>
              </div>
            </div>

            {/* Numeric Wager Input */}
            <div className="mb-4">
              <label className="block font-mono-ui text-xs text-slate-300 mb-1.5 font-medium">
                Stake Amount ({currency})
              </label>
              <div className="relative flex items-center rounded-xl bg-black/40 border border-white/10 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all">
                <input
                  type="number"
                  step="any"
                  value={inputVal}
                  disabled={isBusy}
                  onChange={handleInputChange}
                  placeholder="0.01"
                  className="w-full bg-transparent px-3.5 py-3 font-mono-ui text-base sm:text-lg font-bold text-white placeholder-slate-600 focus:outline-none disabled:opacity-50"
                />
                <div className="pr-3 flex items-center gap-1.5 shrink-0">
                  <span className="font-mono-ui font-semibold text-xs py-1 px-2 rounded-md bg-white/[0.06] text-cyan-300 border border-white/5">
                    {currency}
                  </span>
                </div>
              </div>

              {customError && (
                <p className="mt-1.5 text-xs text-rose-400 font-mono-ui flex items-center gap-1">
                  {customError}
                </p>
              )}
            </div>

            {/* Quick Preset Chips (Touch-friendly for mobile) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono-ui text-[11px] text-slate-400">Quick Stakes</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {presets.map((amt) => {
                  const isCurrent = Math.abs(betAmount - amt) < 0.0001;
                  return (
                    <button
                      key={amt}
                      type="button"
                      disabled={isBusy}
                      onClick={() => handlePreset(amt)}
                      className={`btn-defi py-2 px-1 rounded-lg font-mono-ui text-xs font-semibold border transition-all text-center ${
                        isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                      } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Steppers & Multipliers (MIN, 1/2, 2X, MAX) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-5">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handlePreset(isEthBased ? 0.005 : 0.1)}
                className="btn-defi py-2 rounded-lg font-mono-ui text-xs font-medium bg-white/[0.02] border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
              >
                MIN
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleMult(0.5)}
                className="btn-defi py-2 rounded-lg font-mono-ui text-xs font-medium bg-white/[0.02] border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleMult(2)}
                className="btn-defi py-2 rounded-lg font-mono-ui text-xs font-medium bg-white/[0.02] border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
              >
                2×
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={handleMax}
                className="btn-defi py-2 rounded-lg font-mono-ui text-xs font-medium bg-white/[0.02] border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
              >
                MAX
              </button>
            </div>

            {/* Financial Summary Card (Charm.fi style) */}
            <div className="rounded-xl p-3.5 bg-black/40 border border-white/[0.08] space-y-2 mb-5 font-mono-ui text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Potential Return</span>
                <span className="font-bold text-white text-sm">
                  {payout} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Net Profit</span>
                <span className="font-semibold text-emerald-400">
                  +{profit} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Protocol Fee</span>
                <span>2.00% ({commission.toFixed(isEthBased ? 5 : 3)} {currency})</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                <span>Treasury Address</span>
                <a
                  href={treasuryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1"
                >
                  0x155A...5Af9
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Action CTA Button (100% Mobile Responsive, min 48px touch height) */}
          <div>
            {txError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-mono-ui">
                {txError}
              </div>
            )}

            {!wallet.isConnected ? (
              <button
                type="button"
                onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
                className="w-full btn-defi btn-cta-cyan py-3.5 px-5 rounded-xl font-display text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Flip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isBusy}
                onClick={onStartFlip}
                className={`w-full btn-defi py-3.5 sm:py-4 px-5 rounded-xl font-display text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  isCyan ? 'btn-cta-cyan' : 'btn-cta-amber'
                } ${isBusy ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isAwaitingTx ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming On-Chain Tx...</span>
                  </>
                ) : isFlipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Flipping Coin ({flipCountdown.toFixed(1)}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>DOUBLE OR NOTHING · FLIP {betAmount} {currency}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
