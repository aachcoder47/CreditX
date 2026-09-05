import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Flame, Coins, Sparkles, Clock,
  AlertCircle, ShieldCheck, ExternalLink,
  Loader2, CheckCircle2, ArrowRight, Plus, Minus,
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
  const leftCardRef = useRef<HTMLDivElement>(null);
  const wagerCardRef = useRef<HTMLDivElement>(null);

  const currency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));
  const presets = isEthBased ? [0.005, 0.01, 0.05, 0.1] : [0.1, 0.5, 1.0, 5.0];

  useEffect(() => { setInputVal(betAmount.toString()); }, [betAmount]);

  const handleCardMouse = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    ref.current.style.setProperty('--mx', `${mx}%`);
    ref.current.style.setProperty('--my', `${my}%`);
  };

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
  const handleStep = (dir: 1 | -1) => {
    soundFx.playClick();
    const step = isEthBased ? 0.005 : 0.1;
    const min = isEthBased ? 0.001 : 0.01;
    const p = isEthBased ? 4 : 3;
    onChangeBet(Math.max(min, Number((betAmount + dir * step).toFixed(p))));
    setCustomError(null);
  };

  const isFlipping   = gameState === 'FLIPPING';
  const isAwaitingTx = gameState === 'AWAITING_TX';
  const isBusy       = isFlipping || isAwaitingTx;
  const isCyan       = selectedSide === 'HEADS';

  const payout  = (betAmount * 1.98).toFixed(isEthBased ? 4 : 3);
  const profit  = (betAmount * 0.98).toFixed(isEthBased ? 4 : 3);
  const commission  = calculateCommission(betAmount);
  const treasuryUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  const accent   = isCyan ? '#22D3EE' : '#A78BFA';
  const accentDim = isCyan ? 'rgba(34,211,238,0.12)' : 'rgba(167,139,250,0.12)';
  const accentBorder = isCyan ? 'rgba(34,211,238,0.30)' : 'rgba(167,139,250,0.30)';
  const accentSoft = isCyan ? 'rgba(34,211,238,0.06)' : 'rgba(167,139,250,0.06)';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 pb-10">
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/25">01 — Arena</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />
        <button
          onClick={onOpenProvablyFair}
          className="flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/30 hover:text-cyan-400/80 transition-colors group"
        >
          <ShieldCheck className="w-3 h-3 transition-all group-hover:scale-110" style={{ color: '#22D3EE' }} />
          Provably Fair · 2% Commission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-5">

        <div
          ref={leftCardRef}
          onMouseMove={(e) => handleCardMouse(e, leftCardRef)}
          className={`relative p-5 sm:p-7 transition-all duration-500 glow-card ${isCyan ? '' : 'glow-card-violet'} corner-brackets overflow-hidden`}
          style={{
            background: `linear-gradient(180deg, ${isCyan ? 'rgba(6,18,24,0.90)' : 'rgba(16,6,30,0.90)'} 0%, rgba(6,6,12,0.96) 100%)`,
            border: `1px solid ${accentBorder}`,
            borderRadius: '18px',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow:
              `0 0 80px ${accentSoft} inset, 0 20px 60px rgba(0,0,0,0.55), 0 0 30px ${isCyan ? 'rgba(0,240,255,0.05)' : 'rgba(139,92,246,0.05)'}`,
          }}
        >
          <span className="cb-tl" />
          <span className="cb-br" />
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              background: `radial-gradient(700px circle at var(--mx,50%) var(--my,50%), ${accent}15, transparent 45%)`,
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }} />

          <div className="absolute top-4 right-4 z-10">
            <span
              className="font-mono-ui text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentDim}, ${accentSoft})`,
                border: `1px solid ${accentBorder}`,
                color: accent,
                borderRadius: '8px',
                boxShadow: `0 0 15px ${accentDim} inset`,
              }}
            >
              <span className="relative z-10">{isCyan ? 'HEADS' : 'TAILS'} SELECTED</span>
              <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
            </span>
          </div>

          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span
              className="font-mono-ui text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
              style={{
                background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04))',
                border: '1px solid rgba(52,211,153,0.30)',
                color: '#34D399',
                borderRadius: '8px',
                boxShadow: '0 0 12px rgba(52,211,153,0.08) inset',
              }}
            >
              1.98X PAYOUT
            </span>
            <span className="font-mono-ui text-[9px] text-white/25 uppercase tracking-widest">5-Second Round</span>
          </div>

          <div className="relative">
            <Coin3D isFlipping={isFlipping} selectedSide={selectedSide} winningSide={winningSide} flipDuration={5} />

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
                    className="flex items-center gap-3 px-4 py-3 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(28,18,0,0.95), rgba(14,10,0,0.98))',
                      border: '1px solid rgba(245,158,11,0.50)',
                      borderRadius: '14px',
                      boxShadow: '0 0 35px rgba(245,158,11,0.20), 0 0 20px rgba(245,158,11,0.12) inset',
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(245,158,11,0.04) 8px, rgba(245,158,11,0.04) 16px)' }}
                    />
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0 relative z-10" />
                    <div className="relative z-10">
                      <p className="font-mono-ui text-[9px] uppercase tracking-widest text-amber-400 font-bold">Awaiting Wallet Signature</p>
                      <p className="font-mono-ui text-[10px] text-white/50 mt-0.5">Send {commission} {currency} commission to treasury</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isFlipping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none z-20"
                >
                  <div
                    className="flex items-center gap-3 px-6 py-3 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(8,8,16,0.98))',
                      border: `1px solid ${accent}80`,
                      borderRadius: '14px',
                      boxShadow: `0 0 35px ${accent}35, 0 0 20px ${accent}15 inset`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-40 progress-stripes"
                    />
                    <Clock className="w-4 h-4 animate-spin relative z-10" style={{ color: accent }} />
                    <div className="text-center relative z-10">
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

          <div className="mt-6 relative z-10">
            <p className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/25 mb-3 text-center">Choose Your Side</p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                disabled={isBusy}
                whileHover={{ scale: isBusy ? 1 : 1.025, y: isBusy ? 0 : -2 }}
                whileTap={{ scale: isBusy ? 1 : 0.98 }}
                onClick={() => { soundFx.playSideSwitch(true); onSelectSide('HEADS'); }}
                className="relative flex flex-col items-center gap-3 py-5 px-4 transition-all duration-400 cursor-pointer group overflow-hidden btn-premium"
                style={selectedSide === 'HEADS' ? {
                  background: 'linear-gradient(180deg, rgba(0,40,50,0.75) 0%, rgba(0,24,30,0.95) 100%)',
                  border: '1px solid rgba(0,240,255,0.50)',
                  borderRadius: '14px',
                  boxShadow:
                    '0 0 40px rgba(0,240,255,0.15), 0 10px 30px rgba(0,0,0,0.45), 0 0 20px rgba(0,240,255,0.12) inset',
                } : {
                  background: 'linear-gradient(180deg, rgba(12,12,18,0.85), rgba(6,6,10,0.95))',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                }}
              >
                {selectedSide === 'HEADS' && (
                  <motion.div
                    layoutId="sideActiveLine"
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #22D3EE, #22D3EE, transparent)',
                      boxShadow: '0 0 8px #22D3EE',
                    }}
                  />
                )}
                {selectedSide === 'HEADS' && (
                  <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
                )}
                <div
                  className="w-12 h-12 flex items-center justify-center transition-all duration-400 group-hover:scale-110 relative"
                  style={selectedSide === 'HEADS' ? {
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.18), rgba(0,240,255,0.06))',
                    border: '1px solid rgba(0,240,255,0.50)',
                    borderRadius: '14px',
                    boxShadow: '0 0 20px rgba(0,240,255,0.25), 0 0 12px rgba(0,240,255,0.2) inset',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '14px',
                  }}
                >
                  <Zap
                    className="w-6 h-6 transition-all duration-400"
                    style={{
                      color: selectedSide === 'HEADS' ? '#22D3EE' : 'rgba(255,255,255,0.35)',
                      filter: selectedSide === 'HEADS' ? 'drop-shadow(0 0 8px #22D3EE)' : 'none',
                    }}
                  />
                </div>
                <div className="text-center">
                  <div
                    className="font-display font-bold text-lg tracking-tight transition-colors"
                    style={{
                      color: selectedSide === 'HEADS' ? '#22D3EE' : 'rgba(255,255,255,0.50)',
                      textShadow: selectedSide === 'HEADS' ? '0 0 12px rgba(0,240,255,0.5)' : 'none',
                    }}
                  >
                    HEADS
                  </div>
                  <div className="font-mono-ui text-[9px] text-white/25 mt-0.5 uppercase tracking-widest">Cyan · 1.98X</div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                disabled={isBusy}
                whileHover={{ scale: isBusy ? 1 : 1.025, y: isBusy ? 0 : -2 }}
                whileTap={{ scale: isBusy ? 1 : 0.98 }}
                onClick={() => { soundFx.playSideSwitch(false); onSelectSide('TAILS'); }}
                className="relative flex flex-col items-center gap-3 py-5 px-4 transition-all duration-400 cursor-pointer group overflow-hidden btn-premium"
                style={selectedSide === 'TAILS' ? {
                  background: 'linear-gradient(180deg, rgba(35,10,60,0.75) 0%, rgba(20,6,35,0.95) 100%)',
                  border: '1px solid rgba(139,92,246,0.50)',
                  borderRadius: '14px',
                  boxShadow:
                    '0 0 40px rgba(139,92,246,0.18), 0 10px 30px rgba(0,0,0,0.45), 0 0 20px rgba(139,92,246,0.14) inset',
                } : {
                  background: 'linear-gradient(180deg, rgba(12,12,18,0.85), rgba(6,6,10,0.95))',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                }}
              >
                {selectedSide === 'TAILS' && (
                  <motion.div
                    layoutId="sideActiveLine"
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #A78BFA, #A78BFA, transparent)',
                      boxShadow: '0 0 8px #A78BFA',
                    }}
                  />
                )}
                {selectedSide === 'TAILS' && (
                  <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
                )}
                <div
                  className="w-12 h-12 flex items-center justify-center transition-all duration-400 group-hover:scale-110 relative"
                  style={selectedSide === 'TAILS' ? {
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.20), rgba(139,92,246,0.06))',
                    border: '1px solid rgba(139,92,246,0.50)',
                    borderRadius: '14px',
                    boxShadow: '0 0 20px rgba(139,92,246,0.25), 0 0 12px rgba(139,92,246,0.2) inset',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '14px',
                  }}
                >
                  <Flame
                    className="w-6 h-6 transition-all duration-400"
                    style={{
                      color: selectedSide === 'TAILS' ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                      filter: selectedSide === 'TAILS' ? 'drop-shadow(0 0 8px #A855F7)' : 'none',
                    }}
                  />
                </div>
                <div className="text-center">
                  <div
                    className="font-display font-bold text-lg tracking-tight transition-colors"
                    style={{
                      color: selectedSide === 'TAILS' ? '#C4B5FD' : 'rgba(255,255,255,0.50)',
                      textShadow: selectedSide === 'TAILS' ? '0 0 12px rgba(168,85,247,0.5)' : 'none',
                    }}
                  >
                    TAILS
                  </div>
                  <div className="font-mono-ui text-[9px] text-white/25 mt-0.5 uppercase tracking-widest">Violet · 1.98X</div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">

          <div
            ref={wagerCardRef}
            onMouseMove={(e) => handleCardMouse(e, wagerCardRef)}
            className="p-5 sm:p-6 relative overflow-hidden glow-card"
            style={{
              background: 'linear-gradient(180deg, rgba(12,12,18,0.92) 0%, rgba(6,6,10,0.96) 100%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '18px',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(500px circle at var(--mx,50%) var(--my,50%), ${accent}0D, transparent 45%)`,
              }}
            />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/35">Wager Amount</span>
              <span className="font-mono-ui text-[10px] text-white/40">
                Balance: <strong style={{ color: accent, textShadow: `0 0 8px ${accent}44` }}>{wallet.isConnected ? `${wallet.solBalance.toFixed(isEthBased ? 4 : 2)} ${currency}` : `— ${currency}`}</strong>
              </span>
            </div>

            <div className="relative mb-3 z-10">
              <div className="relative group">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  disabled={isBusy}
                  onClick={() => handleStep(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-white/10 hover:border-white/25 text-white/35 hover:text-white/80 transition-all z-10 disabled:opacity-40"
                  style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <input
                  type="number"
                  step={isEthBased ? '0.001' : '0.1'}
                  min={isEthBased ? '0.001' : '0.01'}
                  disabled={isBusy}
                  value={inputVal}
                  onChange={handleInputChange}
                  className="w-full h-12 sm:h-14 pl-14 pr-28 font-display font-bold text-xl text-white outline-none transition-all text-center"
                  placeholder={isEthBased ? '0.01' : '0.5'}
                  style={{
                    background: 'linear-gradient(180deg, rgba(4,4,8,0.98), rgba(2,2,6,0.98))',
                    border: `1px solid rgba(255,255,255,0.12)`,
                    color: '#fff',
                    borderRadius: '14px',
                    boxShadow: '0 0 20px rgba(0,0,0,0.4) inset',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = accent;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}1A, 0 0 25px ${accent}1A inset`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.4) inset';
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  disabled={isBusy}
                  onClick={() => handleStep(1)}
                  className="absolute right-24 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-white/10 hover:border-white/25 text-white/35 hover:text-white/80 transition-all z-10 disabled:opacity-40"
                  style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
                <div
                  className="absolute right-0 top-0 bottom-0 flex items-center gap-1.5 px-3 font-mono-ui text-xs font-bold my-1.5 mr-1.5"
                  style={{
                    background: `linear-gradient(135deg, ${accentDim}, ${accentSoft})`,
                    borderLeft: `1px solid ${accentBorder}`,
                    color: accent,
                    borderRadius: '0 12px 12px 0',
                    boxShadow: `0 0 12px ${accentDim} inset`,
                  }}
                >
                  <Coins className="w-3.5 h-3.5" />
                  {currency}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(customError || txError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex items-start gap-2 px-3 py-2.5 mb-3 font-mono-ui text-xs text-rose-300 relative overflow-hidden z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04))',
                    border: '1px solid rgba(239,68,68,0.28)',
                    borderRadius: '12px',
                  }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                  {customError || txError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-7 gap-1.5 relative z-10">
              {presets.map(amt => (
                <motion.button
                  key={amt}
                  type="button"
                  disabled={isBusy}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePreset(amt)}
                  className="col-span-1 py-2.5 font-mono-ui text-[10px] font-bold uppercase tracking-wide transition-all group relative overflow-hidden"
                  style={betAmount === amt ? {
                    background: `linear-gradient(135deg, ${accentDim}, ${accentSoft})`,
                    border: `1px solid ${accentBorder}`,
                    color: accent,
                    borderRadius: '10px',
                    boxShadow: `0 0 12px ${accentDim} inset`,
                  } : {
                    background: 'linear-gradient(180deg, rgba(8,8,12,0.9), rgba(4,4,6,0.95))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)',
                    borderRadius: '10px',
                  }}
                >
                  {betAmount === amt && (
                    <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
                  )}
                  <span className="relative z-10">{amt}</span>
                </motion.button>
              ))}
              <button type="button" disabled={isBusy} onClick={() => handleMult(0.5)}
                className="py-2.5 font-mono-ui text-[10px] font-bold uppercase transition-all hover:text-white/80 hover:border-white/25"
                style={{
                  background: 'linear-gradient(180deg, rgba(8,8,12,0.9), rgba(4,4,6,0.95))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.45)',
                  borderRadius: '10px',
                }}
              >½X</button>
              <button type="button" disabled={isBusy} onClick={() => handleMult(2)}
                className="py-2.5 font-mono-ui text-[10px] font-bold uppercase transition-all hover:text-white/80 hover:border-white/25"
                style={{
                  background: 'linear-gradient(180deg, rgba(8,8,12,0.9), rgba(4,4,6,0.95))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.45)',
                  borderRadius: '10px',
                }}
              >2X</button>
              <button type="button" disabled={isBusy} onClick={handleMax}
                className="py-2.5 font-mono-ui text-[10px] font-bold uppercase transition-all hover:bg-purple-500/12 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(139,92,246,0.05))',
                  border: '1px solid rgba(139,92,246,0.35)',
                  color: '#C084FC',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px rgba(139,92,246,0.10) inset',
                }}
              >
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
                <span className="relative z-10">MAX</span>
              </button>
            </div>
          </div>

          <div className="p-5 relative overflow-hidden glow-card" style={{
            background: 'linear-gradient(180deg, rgba(8,10,16,0.92), rgba(4,5,8,0.96))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          }}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/25 mb-1.5">Potential Payout</p>
                <p className="font-display font-bold text-xl text-emerald-400" style={{ textShadow: '0 0 12px rgba(16,185,129,0.4)' }}>
                  {payout}<span className="text-xs text-white/30 font-mono-ui ml-1">{currency}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/25 mb-1.5">Net Profit</p>
                <p className="font-display font-bold text-xl" style={{ color: accent, textShadow: `0 0 12px ${accent}44` }}>
                  +{profit}<span className="text-xs text-white/30 font-mono-ui ml-1">{currency}</span>
                </p>
              </div>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div className="flex items-center gap-1.5 font-mono-ui text-[10px] text-white/35">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                2% commission: <strong className="text-white/55">{commission} {currency}</strong>
              </div>
              <a href={treasuryUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono-ui text-[9px] text-cyan-400/65 hover:text-cyan-400 transition-colors uppercase tracking-wider group"
              >
                <span>Treasury</span>
                <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {!wallet.isConnected ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
              className="relative w-full h-14 sm:h-16 flex items-center overflow-hidden font-mono-ui font-bold uppercase tracking-widest text-black btn-premium group"
              style={{
                background: 'linear-gradient(135deg, #22D3EE 0%, #00F0FF 40%, #0EA5E9 100%)',
                borderRadius: '16px',
                boxShadow: '0 0 30px rgba(0,240,255,0.35), 0 10px 30px rgba(0,240,255,0.2)',
              }}
            >
              <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
              <span className="flex items-center justify-center w-14 h-full shrink-0" style={{
                background: 'rgba(0,0,0,0.18)',
                borderRight: '1px solid rgba(0,0,0,0.2)',
              }}>
                <Coins className="w-5 h-5" />
              </span>
              <span className="flex-1 text-center text-sm font-bold">Connect Wallet to Flip</span>
              <ArrowRight className="w-5 h-5 mr-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              disabled={isBusy || (wallet.solBalance < betAmount && betAmount > 0)}
              whileHover={{ scale: isBusy ? 1 : 1.012 }}
              whileTap={{ scale: isBusy ? 1 : 0.99 }}
              onClick={() => { soundFx.playWhoosh(); onStartFlip(); }}
              className="relative w-full h-14 sm:h-16 flex items-center overflow-hidden font-mono-ui font-bold uppercase tracking-widest transition-all btn-premium group"
              style={isAwaitingTx ? {
                background: 'linear-gradient(135deg, rgba(28,18,0,0.98), rgba(16,10,0,0.99))',
                border: '1px solid rgba(245,158,11,0.55)',
                color: '#FCD34D',
                cursor: 'wait',
                borderRadius: '16px',
                boxShadow: '0 0 30px rgba(245,158,11,0.25), 0 0 15px rgba(245,158,11,0.15) inset',
              } : isFlipping ? {
                background: 'linear-gradient(135deg, rgba(8,8,14,0.98), rgba(4,4,8,0.99))',
                border: `1px solid ${accent}60`,
                color: accent,
                cursor: 'not-allowed',
                borderRadius: '16px',
                boxShadow: `0 0 30px ${accent}25, 0 0 15px ${accent}15 inset`,
              } : {
                background: `linear-gradient(135deg, ${accent} 0%, ${isCyan ? '#22D3EE' : '#A78BFA'} 50%, ${isCyan ? '#0EA5E9' : '#7C3AED'} 100%)`,
                color: '#000',
                borderRadius: '16px',
                boxShadow: `0 0 30px ${accent}55, 0 10px 35px ${accent}35`,
              }}
            >
              {!isBusy && (
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/28 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
              )}
              {isAwaitingTx && (
                <div className="absolute inset-0 opacity-40 progress-stripes pointer-events-none" />
              )}

              <span
                className="flex items-center justify-center w-14 h-full shrink-0 relative z-10"
                style={{
                  background: isBusy ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.18)',
                  borderRight: isBusy ? 'none' : '1px solid rgba(0,0,0,0.2)',
                }}
              >
                {isAwaitingTx
                  ? <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                  : isFlipping
                  ? <Clock className="w-5 h-5 animate-spin" />
                  : <Sparkles className="w-5 h-5 animate-pulse-glow-strong" />
                }
              </span>

              <span className="flex-1 text-center text-sm relative z-10 font-bold tracking-[0.12em]">
                {isAwaitingTx ? `Signing… (${commission} ${currency})`
                  : isFlipping  ? `Flipping… (${flipCountdown.toFixed(1)}s)`
                  : `Flip Now · 1.98X — ${betAmount} ${currency}`
                }
              </span>

              {!isBusy && <ArrowRight className="w-5 h-5 mr-4 shrink-0 relative z-10 transition-transform group-hover:translate-x-1" />}
            </motion.button>
          )}

          <button
            onClick={onOpenProvablyFair}
            className="flex items-center justify-center gap-2 py-2.5 font-mono-ui text-[9px] uppercase tracking-[0.16em] text-white/22 hover:text-cyan-400/70 transition-colors border hover:border-cyan-500/30 group relative overflow-hidden"
            style={{
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.015)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <ShieldCheck className="w-3 h-3 transition-transform group-hover:scale-110" style={{ color: '#22D3EE' }} />
            Provably Fair — Cryptographic Seed Verification
          </button>
        </div>
      </div>
    </div>
  );
};
