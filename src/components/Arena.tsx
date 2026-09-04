import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Flame, Coins, Sparkles, Clock,
  AlertCircle, ShieldCheck, ExternalLink,
  Loader2, CheckCircle2, ArrowRight,
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
  const presets = isEthBased ? [0.005, 0.01, 0.05, 0.1] : [0.1, 0.5, 1.0, 5.0];

  useEffect(() => { setInputVal(betAmount.toString()); }, [betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) { setCustomError(`Enter a valid ${currency} amount`); return; }
    if (wallet.isConnected && num > wallet.solBalance) {
      setCustomError(`Insufficient ${currency} balance`);
    } else { setCustomError(null); onChangeBet(num); }
  };

  const handlePreset = (amt: number) => { soundFx.playClick(); setCustomError(null); onChangeBet(amt); };
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
    } else { onChangeBet(isEthBased ? 0.1 : 5.0); }
  };

  const isFlipping   = gameState === 'FLIPPING';
  const isAwaitingTx = gameState === 'AWAITING_TX';
  const isBusy       = isFlipping || isAwaitingTx;
  const isCyan       = selectedSide === 'HEADS';

  const payout  = (betAmount * 1.98).toFixed(isEthBased ? 4 : 3);
  const profit  = (betAmount * 0.98).toFixed(isEthBased ? 4 : 3);
  const commission  = calculateCommission(betAmount);
  const treasuryUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  // Accent color per selected side
  const accent   = isCyan ? '#22D3EE' : '#A78BFA';
  const accentDim = isCyan ? 'rgba(34,211,238,0.12)' : 'rgba(167,139,250,0.12)';
  const accentBorder = isCyan ? 'rgba(34,211,238,0.25)' : 'rgba(167,139,250,0.25)';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pb-10">
      {/* Section label — Knox style */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/25">01 — Arena</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <button
          onClick={onOpenProvablyFair}
          className="flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/30 hover:text-white/60 transition-colors"
        >
          <ShieldCheck className="w-3 h-3" style={{ color: '#22D3EE' }} />
          Provably Fair · 2% Commission
        </button>
      </div>

      {/* Two-column layout on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-5">

        {/* ── Left: Coin + Side selector ── */}
        <div
          className="relative p-5 sm:p-7 transition-all duration-500"
          style={{
            background: '#060606',
            border: `1px solid ${accentBorder}`,
            boxShadow: `0 0 60px ${accentDim} inset`,
          }}
        >
          {/* Corner tag */}
          <div className="absolute top-4 right-4">
            <span
              className="font-mono-ui text-[9px] font-bold uppercase tracking-widest px-2 py-1"
              style={{ background: accentDim, border: `1px solid ${accentBorder}`, color: accent }}
            >
              {isCyan ? 'HEADS' : 'TAILS'} SELECTED
            </span>
          </div>

          {/* Payout badge */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className="font-mono-ui text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }}
            >
              1.98X PAYOUT
            </span>
            <span className="font-mono-ui text-[9px] text-white/25 uppercase tracking-widest">5-Second Round</span>
          </div>

          {/* 3D Coin */}
          <div className="relative">
            <Coin3D isFlipping={isFlipping} selectedSide={selectedSide} winningSide={winningSide} flipDuration={5} />

            {/* Awaiting TX overlay */}
            <AnimatePresence>
              {isAwaitingTx && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-4 bottom-4 z-20 pointer-events-none"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ background: '#0a0600', border: '1px solid rgba(245,158,11,0.4)', boxShadow: '0 0 30px rgba(245,158,11,0.15)' }}
                  >
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    <div>
                      <p className="font-mono-ui text-[9px] uppercase tracking-widest text-amber-400 font-bold">Awaiting Wallet Signature</p>
                      <p className="font-mono-ui text-[10px] text-white/50 mt-0.5">Send {commission} {currency} commission to treasury</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Countdown HUD */}
            <AnimatePresence>
              {isFlipping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none z-20"
                >
                  <div
                    className="flex items-center gap-3 px-6 py-3"
                    style={{ background: '#000', border: `1px solid ${accent}80`, boxShadow: `0 0 30px ${accent}30` }}
                  >
                    <Clock className="w-4 h-4 animate-spin" style={{ color: accent }} />
                    <div className="text-center">
                      <p className="font-mono-ui text-[9px] uppercase tracking-widest text-white/40">Verifying Seed</p>
                      <p
                        className="font-display font-bold text-3xl leading-none mt-0.5"
                        style={{ color: accent, textShadow: `0 0 20px ${accent}80` }}
                      >
                        {flipCountdown.toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side selector */}
          <div className="mt-6">
            <p className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/25 mb-3 text-center">Choose Your Side</p>
            <div className="grid grid-cols-2 gap-3">
              {/* HEADS */}
              <motion.button
                type="button"
                disabled={isBusy}
                whileHover={{ scale: isBusy ? 1 : 1.02 }}
                whileTap={{ scale: isBusy ? 1 : 0.98 }}
                onClick={() => { soundFx.playSideSwitch(true); onSelectSide('HEADS'); }}
                className="relative flex flex-col items-center gap-3 py-5 px-4 transition-all duration-300 cursor-pointer group"
                style={selectedSide === 'HEADS' ? {
                  background: 'rgba(0,240,255,0.06)',
                  border: '1px solid rgba(0,240,255,0.40)',
                } : {
                  background: '#080808',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {selectedSide === 'HEADS' && (
                  <motion.div
                    layoutId="sideActiveLine"
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: '#22D3EE' }}
                  />
                )}
                <div
                  className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                  style={{
                    background: selectedSide === 'HEADS' ? 'rgba(0,240,255,0.10)' : 'rgba(255,255,255,0.04)',
                    border: selectedSide === 'HEADS' ? '1px solid rgba(0,240,255,0.40)' : '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <Zap className="w-5 h-5" style={{ color: selectedSide === 'HEADS' ? '#22D3EE' : 'rgba(255,255,255,0.35)' }} />
                </div>
                <div className="text-center">
                  <div
                    className="font-display font-bold text-base tracking-tight transition-colors"
                    style={{ color: selectedSide === 'HEADS' ? '#22D3EE' : 'rgba(255,255,255,0.50)' }}
                  >
                    HEADS
                  </div>
                  <div className="font-mono-ui text-[9px] text-white/25 mt-0.5 uppercase tracking-widest">Cyan · 1.98X</div>
                </div>
              </motion.button>

              {/* TAILS */}
              <motion.button
                type="button"
                disabled={isBusy}
                whileHover={{ scale: isBusy ? 1 : 1.02 }}
                whileTap={{ scale: isBusy ? 1 : 0.98 }}
                onClick={() => { soundFx.playSideSwitch(false); onSelectSide('TAILS'); }}
                className="relative flex flex-col items-center gap-3 py-5 px-4 transition-all duration-300 cursor-pointer group"
                style={selectedSide === 'TAILS' ? {
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.40)',
                } : {
                  background: '#080808',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {selectedSide === 'TAILS' && (
                  <motion.div
                    layoutId="sideActiveLine"
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: '#A78BFA' }}
                  />
                )}
                <div
                  className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                  style={{
                    background: selectedSide === 'TAILS' ? 'rgba(139,92,246,0.10)' : 'rgba(255,255,255,0.04)',
                    border: selectedSide === 'TAILS' ? '1px solid rgba(139,92,246,0.40)' : '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <Flame className="w-5 h-5" style={{ color: selectedSide === 'TAILS' ? '#A78BFA' : 'rgba(255,255,255,0.35)' }} />
                </div>
                <div className="text-center">
                  <div
                    className="font-display font-bold text-base tracking-tight transition-colors"
                    style={{ color: selectedSide === 'TAILS' ? '#A78BFA' : 'rgba(255,255,255,0.50)' }}
                  >
                    TAILS
                  </div>
                  <div className="font-mono-ui text-[9px] text-white/25 mt-0.5 uppercase tracking-widest">Violet · 1.98X</div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Right: Bet controls ── */}
        <div className="flex flex-col gap-3 sm:gap-4">

          {/* Wager card */}
          <div className="p-5 sm:p-6" style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/35">Wager Amount</span>
              <span className="font-mono-ui text-[10px] text-white/40">
                Balance: <strong style={{ color: accent }}>{wallet.isConnected ? `${wallet.solBalance.toFixed(isEthBased ? 4 : 2)} ${currency}` : `— ${currency}`}</strong>
              </span>
            </div>

            {/* Input */}
            <div className="relative mb-3">
              <input
                type="number"
                step={isEthBased ? '0.001' : '0.1'}
                min={isEthBased ? '0.001' : '0.01'}
                disabled={isBusy}
                value={inputVal}
                onChange={handleInputChange}
                className="w-full h-12 sm:h-14 pl-4 pr-24 font-display font-bold text-xl text-white outline-none transition-all"
                placeholder={isEthBased ? '0.01' : '0.5'}
                style={{
                  background: '#040404',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#fff',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = accent)}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
              />
              <div
                className="absolute right-0 top-0 bottom-0 flex items-center gap-1.5 px-3 font-mono-ui text-xs font-bold"
                style={{ background: accentDim, borderLeft: `1px solid ${accentBorder}`, color: accent }}
              >
                <Coins className="w-3.5 h-3.5" />
                {currency}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {(customError || txError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 px-3 py-2.5 mb-3 font-mono-ui text-xs text-red-400"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)' }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {customError || txError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Presets */}
            <div className="grid grid-cols-7 gap-1.5">
              {presets.map(amt => (
                <motion.button
                  key={amt}
                  type="button"
                  disabled={isBusy}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePreset(amt)}
                  className="col-span-1 py-2 font-mono-ui text-[10px] font-bold uppercase tracking-wide transition-all"
                  style={betAmount === amt ? {
                    background: accentDim,
                    border: `1px solid ${accentBorder}`,
                    color: accent,
                  } : {
                    background: '#050505',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  {amt}
                </motion.button>
              ))}
              <button type="button" disabled={isBusy} onClick={() => handleMult(0.5)}
                className="py-2 font-mono-ui text-[10px] font-bold uppercase transition-all"
                style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
              >½X</button>
              <button type="button" disabled={isBusy} onClick={() => handleMult(2)}
                className="py-2 font-mono-ui text-[10px] font-bold uppercase transition-all"
                style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
              >2X</button>
              <button type="button" disabled={isBusy} onClick={handleMax}
                className="py-2 font-mono-ui text-[10px] font-bold uppercase transition-all"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', color: '#A78BFA' }}
              >MAX</button>
            </div>
          </div>

          {/* Payout breakdown card */}
          <div className="p-5" style={{ background: '#060606', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/25 mb-1.5">Potential Payout</p>
                <p className="font-display font-bold text-xl text-emerald-400">{payout}<span className="text-xs text-white/30 font-mono-ui ml-1">{currency}</span></p>
              </div>
              <div className="text-right">
                <p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/25 mb-1.5">Net Profit</p>
                <p className="font-display font-bold text-xl" style={{ color: accent }}>+{profit}<span className="text-xs text-white/30 font-mono-ui ml-1">{currency}</span></p>
              </div>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-1.5 font-mono-ui text-[10px] text-white/30">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                2% commission: <strong className="text-white/50">{commission} {currency}</strong>
              </div>
              <a href={treasuryUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono-ui text-[9px] text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase tracking-wider"
              >
                <span>Treasury</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* CTA Button — Knox style with colored left block */}
          {!wallet.isConnected ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
              className="relative w-full h-14 sm:h-16 flex items-center overflow-hidden font-mono-ui font-bold uppercase tracking-widest text-black transition-all"
              style={{ background: '#22D3EE' }}
            >
              <span className="flex items-center justify-center w-14 h-full shrink-0" style={{ background: 'rgba(0,0,0,0.18)' }}>
                <Coins className="w-5 h-5" />
              </span>
              <span className="flex-1 text-center text-sm">Connect Wallet to Flip</span>
              <ArrowRight className="w-5 h-5 mr-4 shrink-0" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              disabled={isBusy || (wallet.solBalance < betAmount && betAmount > 0)}
              whileHover={{ scale: isBusy ? 1 : 1.01 }}
              whileTap={{ scale: isBusy ? 1 : 0.99 }}
              onClick={() => { soundFx.playWhoosh(); onStartFlip(); }}
              className="relative w-full h-14 sm:h-16 flex items-center overflow-hidden font-mono-ui font-bold uppercase tracking-widest transition-all"
              style={isAwaitingTx ? {
                background: '#100800',
                border: '1px solid rgba(245,158,11,0.45)',
                color: '#FCD34D',
                cursor: 'wait',
              } : isFlipping ? {
                background: '#040404',
                border: `1px solid ${accent}50`,
                color: accent,
                cursor: 'not-allowed',
              } : {
                background: accent,
                color: '#000',
              }}
            >
              {/* Shimmer (idle only) */}
              {!isBusy && (
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
              )}

              {/* Colored left block */}
              <span
                className="flex items-center justify-center w-14 h-full shrink-0"
                style={{ background: isBusy ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.18)' }}
              >
                {isAwaitingTx
                  ? <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                  : isFlipping
                  ? <Clock className="w-5 h-5 animate-spin" />
                  : <Sparkles className="w-5 h-5 animate-pulse" />
                }
              </span>

              <span className="flex-1 text-center text-sm">
                {isAwaitingTx ? `Signing… (${commission} ${currency})`
                  : isFlipping  ? `Flipping… (${flipCountdown.toFixed(1)}s)`
                  : `Flip Now · 1.98X — ${betAmount} ${currency}`
                }
              </span>

              {!isBusy && <ArrowRight className="w-5 h-5 mr-4 shrink-0" />}
            </motion.button>
          )}

          {/* Provably fair footnote */}
          <button
            onClick={onOpenProvablyFair}
            className="flex items-center justify-center gap-2 py-2.5 font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/20 hover:text-white/45 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <ShieldCheck className="w-3 h-3" style={{ color: '#22D3EE' }} />
            Provably Fair — Cryptographic Seed Verification
          </button>
        </div>
      </div>
    </div>
  );
};
