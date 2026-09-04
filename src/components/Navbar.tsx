import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Zap,
} from 'lucide-react';
import type { WalletState } from '../types/game';
import { soundFx } from '../utils/audio';
import { COMMISSION_TREASURY_ADDRESS, getExplorerAddressLink } from '../utils/blockchain';

interface NavbarProps {
  wallet: WalletState;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenWalletModal: () => void;
  onOpenProvablyFair: () => void;
  onDisconnectWallet: () => void;
  onAddFaucetFunds: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  isMuted,
  onToggleMute,
  onOpenWalletModal,
  onOpenProvablyFair,
  onDisconnectWallet,
  onAddFaucetFunds,
}) => {
  const [copied, setCopied] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const currency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));

  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      soundFx.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const treasuryUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glass bar */}
      <div
        className="w-full border-b"
        style={{
          background: 'rgba(5, 7, 14, 0.82)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 30px rgba(0,0,0,0.5)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-3">

          {/* ── Brand ───────────────────────────────────── */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer group">
            {/* Logo mark */}
            <div className="relative">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-[1.5px]"
                style={{
                  background: 'linear-gradient(135deg, #06B6D4, #3B82F6, #7C3AED)',
                  boxShadow: '0 0 22px rgba(0,240,255,0.45)',
                }}
              >
                <div className="w-full h-full bg-[#050811] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 drop-shadow-[0_0_6px_#00F0FF]" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#050811] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>

            {/* Word mark */}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-['Orbitron'] text-base sm:text-xl font-black tracking-wider text-white"
                  style={{ textShadow: '0 0 20px rgba(0,240,255,0.3)' }}
                >
                  CYBER<span className="text-cyan-400">FLIP</span>
                </span>
                <span className="hidden sm:inline text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 tracking-wider">
                  PVP
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-medium tracking-tight">
                  ON-CHAIN<span className="text-slate-500 hidden sm:inline"> • 2% COMMISSION</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── Actions ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Provably Fair */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { soundFx.playClick(); onOpenProvablyFair(); }}
              title="Provably Fair"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 sm:py-2 rounded-xl text-[10px] sm:text-xs font-mono font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94A3B8',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden lg:inline text-slate-300">PROVABLY FAIR</span>
            </motion.button>

            {/* Mute */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="p-2 sm:p-2.5 rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {isMuted
                ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
              }
            </motion.button>

            {/* ── Wallet State ─────────────────────────── */}
            {!wallet.isConnected ? (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
                title="Connect Wallet"
                className="relative flex items-center justify-center gap-2 rounded-xl font-['Orbitron'] font-bold tracking-wider uppercase text-white overflow-hidden transition-all duration-300
                  p-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs min-w-[36px] sm:min-w-0"
                style={{
                  background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #7C3AED 100%)',
                  boxShadow: '0 0 25px rgba(0,240,255,0.40), 0 0 0 1px rgba(0,240,255,0.15) inset',
                }}
              >
                {/* Shimmer */}
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
                {/* Pulsing ring on xs */}
                <span className="absolute inset-0 rounded-xl ring-2 ring-cyan-400/40 animate-pulse sm:hidden" />
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </motion.button>
            ) : (
              <div className="relative">
                {/* Connected cluster */}
                <div
                  className="flex items-center rounded-xl p-0.5 sm:p-1 gap-1 sm:gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Balance chip */}
                  <div
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(0,240,255,0.06)',
                      border: '1px solid rgba(0,240,255,0.18)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                      style={{
                        background: '#22D3EE',
                        boxShadow: '0 0 8px rgba(0,240,255,0.9)',
                      }}
                    />
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {wallet.solBalance.toFixed(isEthBased ? 3 : 2)} {currency}
                    </span>
                  </div>

                  {/* Refresh (icon-only on xs) */}
                  <button
                    onClick={() => { soundFx.playClick(); onAddFaucetFunds(); }}
                    title="Refresh balance"
                    className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline text-[11px] font-mono font-semibold">Refresh</span>
                  </button>

                  {/* Address dropdown trigger */}
                  <button
                    onClick={() => setWalletMenuOpen(o => !o)}
                    className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-mono text-slate-300 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="sm:hidden">{(wallet.address || '').slice(0, 4)}…</span>
                    <span className="hidden sm:inline">{truncate(wallet.address || '')}</span>
                    <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 ${walletMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* ── Dropdown Menu ──────────────────────── */}
                <AnimatePresence>
                  {walletMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: 10 }}
                      animate={{ opacity: 1, scale: 1,    y: 0  }}
                      exit={{ opacity: 0,   scale: 0.94, y: 10 }}
                      transition={{ duration: 0.18, ease: [0.16,1,0.3,1] }}
                      className="absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl p-4 z-50"
                      style={{
                        background: 'rgba(8,10,20,0.97)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.07) inset',
                        backdropFilter: 'blur(24px)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3 pb-3 border-b border-white/[0.07]">
                        <span>Connected Wallet</span>
                        <span
                          className="text-cyan-300 font-bold px-2 py-0.5 rounded-md text-[9px]"
                          style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.20)' }}
                        >
                          {wallet.network}
                        </span>
                      </div>

                      {/* Address row */}
                      <div
                        className="flex items-center justify-between p-2.5 rounded-xl mb-3"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <span className="font-mono text-xs text-slate-300 truncate pr-2">{wallet.address}</span>
                        <button
                          onClick={handleCopy}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                          title="Copy Address"
                        >
                          {copied
                            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.12)' }}>
                          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Balance</div>
                          <div className="text-sm font-['Orbitron'] font-black text-cyan-300 mt-1">
                            {wallet.solBalance.toFixed(isEthBased ? 4 : 2)}
                            <span className="text-[10px] font-mono font-normal ml-1 text-cyan-400/70">{currency}</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Commission</div>
                          <div className="text-sm font-['Orbitron'] font-black text-emerald-400 mt-1">
                            2%<span className="text-[10px] font-mono font-normal ml-1 text-emerald-500/70">per wager</span>
                          </div>
                        </div>
                      </div>

                      {/* Treasury link */}
                      <a
                        href={treasuryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl mb-3 group transition-all"
                        style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.12)' }}
                      >
                        <div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Commission Treasury</div>
                          <span className="text-xs font-mono text-cyan-300 group-hover:text-cyan-200 transition-colors">0x155A...5Af9</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                      </a>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => { onAddFaucetFunds(); setWalletMenuOpen(false); }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          style={{ background: 'rgba(0,240,255,0.10)', border: '1px solid rgba(0,240,255,0.25)', color: '#67E8F9' }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Refresh Balance
                        </button>
                        <button
                          onClick={() => { onDisconnectWallet(); setWalletMenuOpen(false); }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-mono font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
