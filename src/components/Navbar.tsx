import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Volume2, VolumeX, ShieldCheck, ChevronDown, Copy, Check, LogOut, ExternalLink, RefreshCw } from 'lucide-react';
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
  wallet, isMuted, onToggleMute, onOpenWalletModal,
  onOpenProvablyFair, onDisconnectWallet, onAddFaucetFunds,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));
  const truncate = (a: string) => a ? `${a.slice(0, 5)}...${a.slice(-4)}` : '';

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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <nav className="mx-auto max-w-[1340px] px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-4">
        <div className="relative flex items-center justify-between px-3.5 sm:px-5 h-14 sm:h-16 rounded-2xl bg-[#080C14]/85 border border-white/[0.08] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.55)]">
          
          {/* ─── Left Brand Emblem ─── */}
          <div className="flex items-center gap-3">
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#070B14] rounded-[11px] flex items-center justify-center">
                  <span className="font-display font-extrabold text-xs sm:text-sm text-cyan-400">
                    X
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1 leading-tight">
                  Credit<span className="text-cyan-400">X</span>
                </span>
                <span className="font-mono-ui text-[9px] text-slate-400 tracking-wider uppercase hidden sm:block">
                  Double-or-Nothing
                </span>
              </div>
            </a>

            {/* Live Indicator Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono-ui">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mainnet Live</span>
            </div>
          </div>

          {/* ─── Center Navigation Links (Desktop) ─── */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-mono-ui text-slate-400">
            <button
              onClick={onOpenProvablyFair}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fair Verifier</span>
            </button>
            <a
              href={treasuryUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Treasury</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* ─── Right Controls (Audio + Wallet Pill) ─── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 sm:p-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all bg-white/[0.02]"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            {/* Provably Fair shortcut on mobile */}
            <button
              onClick={onOpenProvablyFair}
              className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white lg:hidden"
              title="Provably Fair"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Wallet Button */}
            {!wallet.isConnected ? (
              <button
                onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
                className="btn-defi btn-cta-cyan py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-display text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all font-mono-ui text-xs text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-cyan-300">
                      {wallet.solBalance.toFixed(isEthBased ? 3 : 2)} {currency}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-400">|</span>
                  <span className="hidden sm:inline text-slate-300">
                    {wallet.address ? truncate(wallet.address) : ''}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 p-2 rounded-xl bg-[#0B101D] border border-white/10 shadow-2xl z-50 font-mono-ui text-xs"
                    >
                      <div className="px-2.5 py-1.5 mb-1 border-b border-white/[0.06] text-slate-400 text-[11px]">
                        <div>Network: <strong className="text-white">{wallet.network}</strong></div>
                        <div className="truncate text-[10px] mt-0.5 text-slate-500">{wallet.address}</div>
                      </div>

                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 hover:text-white transition-colors"
                      >
                        <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => { onAddFaucetFunds(); setMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/[0.04] text-slate-300 hover:text-white transition-colors"
                      >
                        <span>Request Faucet Funds</span>
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        onClick={() => { onDisconnectWallet(); setMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors mt-1"
                      >
                        <span>Disconnect</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
