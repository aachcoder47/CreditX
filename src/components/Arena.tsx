import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Flame,
  Coins,
  Sparkles,
  Clock,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Loader2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import type { CoinSide, GameState, WalletState } from '../types/game';
import { Coin3D } from './Coin3D';
import { soundFx } from '../utils/audio';
import {
  COMMISSION_TREASURY_ADDRESS,
  calculateCommission,
  getExplorerAddressLink
} from '../utils/blockchain';

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
  wallet,
  gameState,
  selectedSide,
  winningSide,
  betAmount,
  flipCountdown,
  txError,
  onSelectSide,
  onChangeBet,
  onStartFlip,
  onOpenWalletModal,
  onOpenProvablyFair,
}) => {
  const [inputVal, setInputVal] = useState(betAmount.toString());
  const [customError, setCustomError] = useState<string | null>(null);

  const currency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');
  const isEthBased = ['ETH', 'POL', 'BNB'].some(s => currency.toUpperCase().includes(s));
  const presets = isEthBased ? [0.005, 0.01, 0.05, 0.1] : [0.1, 0.5, 1.0, 5.0];

  useEffect(() => { setInputVal(betAmount.toString()); }, [betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) { setCustomError(`Enter a valid ${currency} amount`); return; }
    if (wallet.isConnected && num > wallet.solBalance) {
      setCustomError(`Insufficient ${currency} balance`);
    } else {
      setCustomError(null);
      onChangeBet(num);
    }
  };

  const handlePreset = (amt: number) => { soundFx.playClick(); setCustomError(null); onChangeBet(amt); };

  const handleMultiplier = (mult: number) => {
    soundFx.playClick();
    const minVal = isEthBased ? 0.001 : 0.01;
    const precision = isEthBased ? 4 : 3;
    const newBet = Math.max(minVal, Number((betAmount * mult).toFixed(precision)));
    setCustomError(null);
    onChangeBet(newBet);
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

  const potentialPayout = (betAmount * 1.98).toFixed(isEthBased ? 4 : 3);
  const potentialProfit = (betAmount * 0.98).toFixed(isEthBased ? 4 : 3);
  const commission      = calculateCommission(betAmount);
  const treasuryUrl     = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  const isCyan = selectedSide === 'HEADS';

  // ── Arena card style ─────────────────────────────────────────────────
  const cardStyle = isCyan
    ? {
        background: 'radial-gradient(110% 70% at 50% -5%, rgba(0,240,255,0.11) 0%, rgba(5,7,16,0.92) 100%)',
        border: '1px solid rgba(0,240,255,0.22)',
        boxShadow: '0 0 80px -20px rgba(0,240,255,0.22), 0 0 0 1px rgba(0,240,255,0.07) inset, 0 1px 0 rgba(0,240,255,0.18) inset, 0 40px 100px -20px rgba(0,0,0,0.95)',
      }
    : {
        background: 'radial-gradient(110% 70% at 50% -5%, rgba(139,92,246,0.13) 0%, rgba(5,7,16,0.92) 100%)',
        border: '1px solid rgba(139,92,246,0.28)',
        boxShadow: '0 0 80px -20px rgba(112,0,255,0.28), 0 0 0 1px rgba(139,92,246,0.07) inset, 0 1px 0 rgba(139,92,246,0.18) inset, 0 40px 100px -20px rgba(0,0,0,0.95)',
      };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
      <motion.div
        layout
        transition={{ type: 'spring', damping: 28, stiffness: 180 }}
        className="relative rounded-3xl p-4 sm:p-7 overflow-hidden transition-all duration-700"
        style={cardStyle}
      >
        {/* ── Top ambient glow ── */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{ background: isCyan ? 'rgba(0,240,255,0.18)' : 'rgba(112,0,255,0.18)', opacity: 0.6 }}
        />

        {/* ── Header strip ── */}
        <div className="relative flex items-center justify-between pb-4 mb-1 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-slate-300 uppercase">
              Instant 5-Second Round
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', color: '#34D399' }}
            >
              <TrendingUp className="w-3 h-3" />
              <span>1.98X PAYOUT</span>
            </div>
            <button
              onClick={onOpenProvablyFair}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors text-[10px] sm:text-xs font-mono"
              title="Provably Fair"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">2% Commission</span>
            </button>
          </div>
        </div>

        {/* ── 3D Coin ── */}
        <div className="relative my-1 sm:my-3">
          <Coin3D
            isFlipping={isFlipping}
            selectedSide={selectedSide}
            winningSide={winningSide}
            flipDuration={5}
          />

          {/* Awaiting TX overlay */}
          <AnimatePresence>
            {isAwaitingTx && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{ opacity: 0,    y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute inset-x-4 sm:inset-x-8 bottom-2 flex items-center justify-center pointer-events-none z-20"
              >
                <div
                  className="w-full max-w-sm px-4 py-3 rounded-2xl flex items-center gap-3"
                  style={{
                    background: 'rgba(8,8,6,0.95)',
                    border: '1px solid rgba(245,158,11,0.55)',
                    boxShadow: '0 0 40px rgba(245,158,11,0.35)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold block">Awaiting Signature</span>
                    <span className="text-[11px] font-mono text-slate-300 truncate block">
                      Send {commission} {currency} commission to treasury
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown HUD */}
          <AnimatePresence>
            {isFlipping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{ opacity: 0,    scale: 0.85, y: -10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div
                  className="px-6 py-2.5 rounded-2xl flex items-center gap-3"
                  style={{
                    background: 'rgba(3,5,12,0.95)',
                    border: '1px solid rgba(0,240,255,0.60)',
                    boxShadow: '0 0 40px rgba(0,240,255,0.55)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <Clock className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div className="text-center">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-cyan-300 block">Verifying Seed</span>
                    <span className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white text-glow-cyan tracking-widest">
                      {flipCountdown.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Side Selector ── */}
        <div className="mt-4 sm:mt-6">
          <div className="text-center text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-3">
            Choose Your Side
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto">
            {/* HEADS */}
            <motion.button
              type="button"
              disabled={isBusy}
              whileHover={{ scale: isBusy ? 1 : 1.03 }}
              whileTap={{ scale: isBusy ? 1 : 0.97 }}
              onClick={() => { soundFx.playSideSwitch(true); onSelectSide('HEADS'); }}
              className="relative group rounded-2xl py-4 sm:py-5 px-3 flex flex-col items-center gap-2 transition-all duration-300 overflow-hidden cursor-pointer"
              style={selectedSide === 'HEADS' ? {
                background: 'radial-gradient(120% 100% at 50% 0%, rgba(0,240,255,0.18) 0%, rgba(0,240,255,0.04) 100%)',
                border: '1px solid rgba(0,240,255,0.55)',
                boxShadow: '0 0 40px rgba(0,240,255,0.30), 0 0 0 1px rgba(0,240,255,0.12) inset',
              } : {
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {selectedSide === 'HEADS' && (
                <motion.div
                  layoutId="sideActiveGlow"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,240,255,0.15) 0%, transparent 70%)' }}
                />
              )}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(0,240,255,0.10)',
                  border: selectedSide === 'HEADS' ? '1px solid rgba(0,240,255,0.55)' : '1px solid rgba(0,240,255,0.20)',
                  boxShadow: selectedSide === 'HEADS' ? '0 0 20px rgba(0,240,255,0.35)' : 'none',
                }}
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 drop-shadow-[0_0_8px_#00F0FF]" />
              </div>
              <div className="text-center">
                <div className={`font-['Orbitron'] text-sm sm:text-base font-black tracking-widest ${selectedSide === 'HEADS' ? 'text-cyan-300 text-glow-cyan' : 'text-slate-300'}`}>
                  HEADS
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-cyan-400/60 mt-0.5">CYAN · 1.98X</div>
              </div>

              {selectedSide === 'HEADS' && (
                <motion.span
                  layoutId="activeBadge"
                  className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg text-[8px] font-mono font-black uppercase tracking-wider"
                  style={{ background: '#22D3EE', color: '#030508' }}
                >
                  ACTIVE
                </motion.span>
              )}
            </motion.button>

            {/* TAILS */}
            <motion.button
              type="button"
              disabled={isBusy}
              whileHover={{ scale: isBusy ? 1 : 1.03 }}
              whileTap={{ scale: isBusy ? 1 : 0.97 }}
              onClick={() => { soundFx.playSideSwitch(false); onSelectSide('TAILS'); }}
              className="relative group rounded-2xl py-4 sm:py-5 px-3 flex flex-col items-center gap-2 transition-all duration-300 overflow-hidden cursor-pointer"
              style={selectedSide === 'TAILS' ? {
                background: 'radial-gradient(120% 100% at 50% 0%, rgba(139,92,246,0.20) 0%, rgba(139,92,246,0.04) 100%)',
                border: '1px solid rgba(139,92,246,0.55)',
                boxShadow: '0 0 40px rgba(112,0,255,0.30), 0 0 0 1px rgba(139,92,246,0.12) inset',
              } : {
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {selectedSide === 'TAILS' && (
                <motion.div
                  layoutId="sideActiveGlow"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)' }}
                />
              )}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'rgba(139,92,246,0.10)',
                  border: selectedSide === 'TAILS' ? '1px solid rgba(139,92,246,0.55)' : '1px solid rgba(139,92,246,0.20)',
                  boxShadow: selectedSide === 'TAILS' ? '0 0 20px rgba(112,0,255,0.35)' : 'none',
                }}
              >
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 drop-shadow-[0_0_8px_#A855F7]" />
              </div>
              <div className="text-center">
                <div className={`font-['Orbitron'] text-sm sm:text-base font-black tracking-widest ${selectedSide === 'TAILS' ? 'text-violet-300 text-glow-violet' : 'text-slate-300'}`}>
                  TAILS
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-violet-400/60 mt-0.5">VIOLET · 1.98X</div>
              </div>

              {selectedSide === 'TAILS' && (
                <motion.span
                  layoutId="activeBadge"
                  className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg text-[8px] font-mono font-black uppercase tracking-wider"
                  style={{ background: '#A78BFA', color: '#030508' }}
                >
                  ACTIVE
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* ── Bet Controls ── */}
        <div className="mt-5 sm:mt-7 space-y-3">
          {/* Label row */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">Wager Amount</span>
            <div className="flex items-center gap-1.5">
              <span>Balance:</span>
              <span className="text-cyan-300 font-bold">
                {wallet.isConnected
                  ? `${wallet.solBalance.toFixed(isEthBased ? 4 : 2)} ${currency}`
                  : `— ${currency}`}
              </span>
            </div>
          </div>

          {/* Input */}
          <div className="relative">
            <input
              type="number"
              step={isEthBased ? '0.001' : '0.1'}
              min={isEthBased ? '0.001' : '0.01'}
              max={wallet.solBalance || 100}
              disabled={isBusy}
              value={inputVal}
              onChange={handleInputChange}
              className="w-full h-12 sm:h-14 pl-4 pr-28 rounded-2xl text-white font-['Orbitron'] text-lg sm:text-xl font-bold outline-none transition-all"
              placeholder={isEthBased ? '0.01' : '0.5'}
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.55)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
            />
            <div
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl pointer-events-none"
              style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.20)', color: '#67E8F9' }}
            >
              <Coins className="w-3.5 h-3.5" />
              <span className="font-mono text-xs font-bold">{currency}</span>
            </div>
          </div>

          {/* Errors */}
          <AnimatePresence>
            {(customError || txError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl flex items-start gap-2 text-rose-300 text-xs font-mono"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{customError || txError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preset + multiplier grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {presets.map(amt => (
              <motion.button
                key={amt}
                type="button"
                disabled={isBusy}
                whileHover={{ scale: isBusy ? 1 : 1.06 }}
                whileTap={{ scale: isBusy ? 1 : 0.94 }}
                onClick={() => handlePreset(amt)}
                className="col-span-1 py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
                style={betAmount === amt ? {
                  background: 'rgba(0,240,255,0.18)',
                  border: '1px solid rgba(0,240,255,0.50)',
                  color: '#A5F3FC',
                  boxShadow: '0 0 14px rgba(0,240,255,0.25)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94A3B8',
                }}
              >
                {amt}
              </motion.button>
            ))}

            <motion.button type="button" disabled={isBusy} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => handleMultiplier(0.5)}
              className="py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >½X</motion.button>

            <motion.button type="button" disabled={isBusy} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => handleMultiplier(2)}
              className="py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >2X</motion.button>

            <motion.button type="button" disabled={isBusy} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={handleMax}
              className="py-2 sm:py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: '#C4B5FD' }}
            >MAX</motion.button>
          </div>

          {/* Payout info card */}
          <div
            className="p-3.5 sm:p-4 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Potential Payout</div>
                <div className="font-['Orbitron'] text-base sm:text-lg font-black text-emerald-400" style={{ textShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
                  {potentialPayout}
                  <span className="text-xs font-mono font-normal ml-1 text-emerald-500/70">{currency}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Net Profit (+98%)</div>
                <div className="font-['Orbitron'] text-base sm:text-lg font-black text-cyan-300" style={{ textShadow: '0 0 12px rgba(0,240,255,0.5)' }}>
                  +{potentialProfit}
                  <span className="text-xs font-mono font-normal ml-1 text-cyan-400/70">{currency}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>2% commission: <strong className="text-slate-200">{commission} {currency}</strong></span>
              </div>
              <a
                href={treasuryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400/80 hover:text-cyan-300 transition-colors"
              >
                <span>Treasury: 0x155A...5Af9</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── CTA Button ── */}
        <div className="mt-5 sm:mt-7">
          {!wallet.isConnected ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
              className="w-full h-14 sm:h-16 rounded-2xl font-['Orbitron'] text-xs sm:text-sm font-black tracking-widest uppercase text-white flex items-center justify-center gap-3 relative overflow-hidden cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #7C3AED 100%)',
                boxShadow: '0 0 40px rgba(0,240,255,0.40), 0 0 0 1px rgba(0,240,255,0.20) inset, 0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
              <Coins className="w-5 h-5" />
              <span>Connect Wallet to Flip</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              disabled={isBusy || (wallet.solBalance < betAmount && betAmount > 0)}
              whileHover={{ scale: isBusy ? 1 : 1.02, y: isBusy ? 0 : -2 }}
              whileTap={{ scale: isBusy ? 1 : 0.98 }}
              onClick={() => { soundFx.playWhoosh(); onStartFlip(); }}
              className="w-full h-14 sm:h-16 rounded-2xl font-['Orbitron'] text-xs sm:text-sm font-black tracking-widest uppercase text-white flex items-center justify-center gap-3 relative overflow-hidden transition-all"
              style={
                isAwaitingTx ? {
                  background: 'rgba(40,25,5,0.90)',
                  border: '1px solid rgba(245,158,11,0.70)',
                  boxShadow: '0 0 30px rgba(245,158,11,0.30)',
                  cursor: 'wait',
                } : isFlipping ? {
                  background: 'rgba(10,14,28,0.90)',
                  border: '1px solid rgba(0,240,255,0.40)',
                  boxShadow: '0 0 25px rgba(0,240,255,0.20)',
                  cursor: 'not-allowed',
                } : isCyan ? {
                  background: 'linear-gradient(135deg, #0891B2 0%, #0EA5E9 40%, #22D3EE 100%)',
                  boxShadow: '0 0 45px rgba(0,240,255,0.50), 0 0 0 1px rgba(0,240,255,0.25) inset, 0 8px 32px rgba(0,0,0,0.5)',
                } : {
                  background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 40%, #8B5CF6 100%)',
                  boxShadow: '0 0 45px rgba(112,0,255,0.50), 0 0 0 1px rgba(139,92,246,0.25) inset, 0 8px 32px rgba(0,0,0,0.5)',
                }
              }
            >
              {/* Shimmer (idle only) */}
              {!isBusy && (
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/18 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
              )}

              {isAwaitingTx ? (
                <>
                  <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
                  <span className="text-amber-200">Signing… ({commission} {currency})</span>
                </>
              ) : isFlipping ? (
                <>
                  <Clock className="w-5 h-5 text-cyan-300 animate-spin" />
                  <span className="text-cyan-200">Flipping… ({flipCountdown.toFixed(1)}s)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Flip Now · 1.98X — {betAmount} {currency}</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
