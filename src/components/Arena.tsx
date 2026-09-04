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
  CheckCircle2
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
  flipCountdown: number; // 5.0 to 0.0
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
  const isEthBased = currency.toUpperCase().includes('ETH') || currency.toUpperCase().includes('POL') || currency.toUpperCase().includes('BNB');
  const presets = isEthBased ? [0.005, 0.01, 0.05, 0.1] : [0.1, 0.5, 1.0, 5.0];

  // Sync prop changes to input string
  useEffect(() => {
    setInputVal(betAmount.toString());
  }, [betAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setCustomError(`Enter a valid ${currency} bet amount`);
      return;
    }
    if (wallet.isConnected && num > wallet.solBalance) {
      setCustomError(`Insufficient ${currency} balance`);
    } else {
      setCustomError(null);
      onChangeBet(num);
    }
  };

  const handlePresetClick = (amount: number) => {
    soundFx.playClick();
    setCustomError(null);
    onChangeBet(amount);
  };

  const handleMultiplierClick = (mult: number) => {
    soundFx.playClick();
    const minVal = isEthBased ? 0.001 : 0.01;
    const precision = isEthBased ? 4 : 3;
    const newBet = Math.max(minVal, Number((betAmount * mult).toFixed(precision)));
    setCustomError(null);
    onChangeBet(newBet);
  };

  const handleMaxClick = () => {
    soundFx.playClick();
    if (wallet.isConnected && wallet.solBalance > 0) {
      const precision = isEthBased ? 1000 : 100;
      const maxBet = Math.floor(wallet.solBalance * precision) / precision;
      setCustomError(null);
      onChangeBet(Math.max(0.001, maxBet));
    } else {
      onChangeBet(isEthBased ? 0.1 : 5.0);
    }
  };

  const isFlipping = gameState === 'FLIPPING';
  const isAwaitingTx = gameState === 'AWAITING_TX';
  const isBusy = isFlipping || isAwaitingTx;

  const potentialPayout = (betAmount * 1.98).toFixed(isEthBased ? 4 : 3);
  const potentialProfit = (betAmount * 0.98).toFixed(isEthBased ? 4 : 3);
  const commission = calculateCommission(betAmount);

  const treasuryExplorerUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Main Glassmorphic Arena Card */}
      <div 
        className={`relative rounded-3xl p-5 sm:p-8 transition-all duration-500 overflow-hidden ${
          selectedSide === 'HEADS' ? 'glass-panel-cyan' : 'glass-panel-violet'
        }`}
      >
        {/* Background glow lines */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-white/10 to-transparent blur-2xl pointer-events-none" />

        {/* Top Arena Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-300 font-bold tracking-wider uppercase">
              INSTANT 5-SECOND ROUND
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span>PAYOUT: 1.98X</span>
            </div>
            <button
              onClick={onOpenProvablyFair}
              className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              title="Cryptographic verification"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2% Commission</span>
            </button>
          </div>
        </div>

        {/* Center: 3D Coin Flip Engine */}
        <div className="my-4 relative">
          <Coin3D
            isFlipping={isFlipping}
            selectedSide={selectedSide}
            winningSide={winningSide}
            flipDuration={5}
          />

          {/* Awaiting Wallet Confirmation Indicator */}
          <AnimatePresence>
            {isAwaitingTx && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center pointer-events-none z-10"
              >
                <div className="px-5 py-3 rounded-2xl bg-black/90 border border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.5)] backdrop-blur-md flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                      AWAITING WALLET CONFIRMATION
                    </span>
                    <span className="text-xs font-mono text-slate-200">
                      Confirm 2% commission ({commission} {currency}) to treasury
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5-Second Countdown HUD Overlay */}
          <AnimatePresence>
            {isFlipping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center pointer-events-none z-10"
              >
                <div className="px-5 py-2 rounded-2xl bg-black/85 border border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.6)] backdrop-blur-md flex items-center gap-3">
                  <Clock className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div className="text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 block">
                      VERIFYING BLOCKCHAIN SEED
                    </span>
                    <span className="font-['Orbitron'] text-xl font-black text-white tracking-widest text-glow-cyan">
                      {flipCountdown.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Selector (HEADS vs TAILS) */}
        <div className="mt-6">
          <div className="text-center text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            Select Your Side
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* HEADS Button */}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                soundFx.playSideSwitch(true);
                onSelectSide('HEADS');
              }}
              className={`relative group p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                selectedSide === 'HEADS'
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.5)] scale-[1.02]'
                  : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.06] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] mb-2">
                <Zap className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_#00F0FF]" />
              </div>
              <span className="font-['Orbitron'] text-base sm:text-lg font-black tracking-widest text-cyan-300">
                HEADS
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80 mt-1">
                CYAN • 1.98X
              </span>
              {selectedSide === 'HEADS' && (
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-cyan-400 text-[#090A0F] font-mono text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_#00F0FF]">
                  SELECTED
                </span>
              )}
            </button>

            {/* TAILS Button */}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                soundFx.playSideSwitch(false);
                onSelectSide('TAILS');
              }}
              className={`relative group p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                selectedSide === 'TAILS'
                  ? 'bg-purple-600/20 border-purple-400 shadow-[0_0_30px_rgba(112,0,255,0.5)] scale-[1.02]'
                  : 'bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:bg-white/[0.06] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(112,0,255,0.3)] mb-2">
                <Flame className="w-5 h-5 text-purple-400 drop-shadow-[0_0_6px_#A855F7]" />
              </div>
              <span className="font-['Orbitron'] text-base sm:text-lg font-black tracking-widest text-purple-300">
                TAILS
              </span>
              <span className="text-[11px] font-mono text-purple-400/80 mt-1">
                VIOLET • 1.98X
              </span>
              {selectedSide === 'TAILS' && (
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-purple-400 text-[#090A0F] font-mono text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_#A855F7]">
                  SELECTED
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bet Amount Input & Quick-Select Presets */}
        <div className="mt-8 max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>BET AMOUNT</span>
            <div className="flex items-center gap-1.5">
              <span>BALANCE:</span>
              <span className="text-cyan-300 font-bold">
                {wallet.isConnected ? `${wallet.solBalance.toFixed(isEthBased ? 4 : 2)} ${currency}` : `0.00 ${currency}`}
              </span>
            </div>
          </div>

          {/* Numerical Input with Currency Badge */}
          <div className="relative">
            <input
              type="number"
              step={isEthBased ? '0.001' : '0.1'}
              min={isEthBased ? '0.001' : '0.01'}
              max={wallet.solBalance || 100}
              disabled={isBusy}
              value={inputVal}
              onChange={handleInputChange}
              className="w-full h-14 pl-4 pr-24 rounded-2xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white font-['Orbitron'] text-xl font-bold transition-all outline-none"
              placeholder={isEthBased ? '0.01' : '0.5'}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-cyan-300 font-mono text-xs font-bold pointer-events-none">
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currency}</span>
            </div>
          </div>

          {customError && (
            <div className="flex items-center gap-1 text-rose-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{customError}</span>
            </div>
          )}

          {txError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{txError}</span>
            </div>
          )}

          {/* Presets and Multipliers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {presets.map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={isBusy}
                onClick={() => handlePresetClick(amt)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                  betAmount === amt
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                {amt}
              </button>
            ))}

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleMultiplierClick(0.5)}
              className="py-2 rounded-xl text-xs font-mono font-bold bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              ½X
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleMultiplierClick(2)}
              className="py-2 rounded-xl text-xs font-mono font-bold bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              2X
            </button>

            <button
              type="button"
              disabled={isBusy}
              onClick={handleMaxClick}
              className="py-2 rounded-xl text-xs font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all"
            >
              MAX
            </button>
          </div>

          {/* Payout & On-Chain Commission Breakdown Card */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">POTENTIAL WIN PAYOUT</span>
                <span className="text-emerald-400 font-['Orbitron'] font-bold text-sm sm:text-base">
                  {potentialPayout} {currency}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">NET PROFIT (+98%)</span>
                <span className="text-cyan-300 font-['Orbitron'] font-bold text-sm sm:text-base">
                  +{potentialProfit} {currency}
                </span>
              </div>
            </div>

            {/* On-Chain Commission Info */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>2% House Commission:</span>
                <span className="text-slate-200 font-bold">{commission} {currency}</span>
              </div>
              <a
                href={treasuryExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-mono"
                title="View commission treasury on blockchain explorer"
              >
                <span>Treasury: 0x155A...5Af9</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Large Action CTA Button */}
        <div className="mt-8 max-w-lg mx-auto">
          {!wallet.isConnected ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenWalletModal();
              }}
              className="w-full h-16 rounded-2xl font-['Orbitron'] text-sm sm:text-base font-black tracking-widest uppercase text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Coins className="w-5 h-5" />
              <span>CONNECT WALLET TO FLIP</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isBusy || (wallet.solBalance < betAmount && betAmount > 0)}
              onClick={() => {
                soundFx.playWhoosh();
                onStartFlip();
              }}
              className={`w-full h-16 rounded-2xl font-['Orbitron'] text-base sm:text-lg font-black tracking-widest uppercase text-white relative overflow-hidden transition-all duration-300 flex items-center justify-center gap-3 ${
                isAwaitingTx
                  ? 'bg-amber-900/60 border border-amber-400/80 cursor-wait shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                  : isFlipping
                  ? 'bg-slate-800 border border-cyan-400/50 cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : selectedSide === 'HEADS'
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-teal-400 shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:shadow-[0_0_50px_rgba(0,240,255,0.9)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  : 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500 shadow-[0_0_35px_rgba(112,0,255,0.6)] hover:shadow-[0_0_50px_rgba(112,0,255,0.9)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              }`}
            >
              {/* Shimmer Light Ray */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

              {isAwaitingTx ? (
                <>
                  <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
                  <span className="text-amber-200">
                    SIGN IN WALLET... ({commission} {currency} COMMISSION)
                  </span>
                </>
              ) : isFlipping ? (
                <>
                  <Clock className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-cyan-300">
                    FLIPPING IN ARENA... ({flipCountdown.toFixed(1)}s)
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <span>FLIP NOW • 1.98X ({betAmount} {currency})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
