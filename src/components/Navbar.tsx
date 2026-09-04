import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Volume2, VolumeX, ShieldCheck, ChevronDown, RefreshCw, Copy, Check, LogOut, ExternalLink } from 'lucide-react';
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
  const truncate = (a: string) => a ? `${a.slice(0,6)}...${a.slice(-4)}` : '';

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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <nav
        className="mx-auto max-w-[1400px] transition-all duration-500"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-5 sm:px-8 lg:px-10 h-[60px] sm:h-[68px]"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0" onClick={e => e.preventDefault()}>
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
              style={{ background: '#00F0FF', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <span className="font-['Space_Mono'] font-bold text-[10px] text-black leading-none">CF</span>
            </div>
            <span
              className="font-display font-bold text-lg sm:text-xl tracking-tight text-white transition-all duration-300"
              style={{ letterSpacing: '-0.02em' }}
            >
              CYBER<span style={{ color: '#00F0FF' }}>FLIP</span>
            </span>
            <span className="font-mono-ui text-[9px] text-white/30 mt-1 hidden sm:block">™</span>
          </a>

          {/* Live status pill */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <div className="tag-cyan tag">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              On-Chain · Live
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Provably Fair */}
            <button
              onClick={() => { soundFx.playClick(); onOpenProvablyFair(); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 font-mono-ui text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors border border-white/10 hover:border-white/25"
              title="Provably Fair"
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#00F0FF' }} />
              Provably Fair
            </button>

            {/* Mute */}
            <button
              onClick={onToggleMute}
              className="p-2 sm:p-2.5 border border-white/10 hover:border-white/25 text-white/40 hover:text-white/80 transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted
                ? <VolumeX className="w-4 h-4 text-red-400" />
                : <Volume2 className="w-4 h-4" style={{ color: '#00F0FF' }} />
              }
            </button>

            {/* Wallet */}
            {!wallet.isConnected ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
                className="relative flex items-center gap-2 overflow-hidden font-mono-ui text-[10px] sm:text-xs font-bold tracking-widest uppercase text-black transition-all"
                style={{ background: '#00F0FF', padding: '0' }}
              >
                {/* Knox-style arrow block */}
                <span
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0"
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                >
                  <Wallet className="w-4 h-4" />
                </span>
                <span className="hidden sm:inline pr-4">Connect Wallet</span>
              </motion.button>
            ) : (
              <div className="relative">
                {/* Connected cluster */}
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 border border-white/15 hover:border-white/35 transition-all"
                  style={{ background: '#0a0a0a' }}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" style={{ boxShadow: '0 0 6px #00F0FF' }} />
                  <span className="font-mono-ui text-[11px] sm:text-xs font-bold text-cyan-300 whitespace-nowrap">
                    {wallet.solBalance.toFixed(isEthBased ? 3 : 2)} {currency}
                  </span>
                  <span className="hidden sm:inline font-mono-ui text-[10px] text-white/35">
                    {truncate(wallet.address || '')}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{ opacity: 0,    y: 8,  scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.16,1,0.3,1] }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 z-50"
                      style={{
                        background: '#080808',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
                      }}
                    >
                      {/* Header */}
                      <div
                        className="flex items-center justify-between px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
                      >
                        <span>Connected Wallet</span>
                        <span
                          className="px-2 py-0.5 text-[9px] font-bold"
                          style={{ background: 'rgba(0,240,255,0.10)', border: '1px solid rgba(0,240,255,0.25)', color: '#22D3EE' }}
                        >
                          {wallet.network}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-ui text-xs text-white/60 truncate pr-2">{wallet.address}</span>
                          <button
                            onClick={handleCopy}
                            className="p-1.5 border border-white/10 hover:border-white/25 text-white/35 hover:text-cyan-400 transition-all shrink-0"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 px-4 py-3 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div>
                          <div className="font-mono-ui text-[9px] uppercase tracking-widest text-white/25 mb-1">Balance</div>
                          <div className="font-display font-bold text-base text-cyan-300">
                            {wallet.solBalance.toFixed(isEthBased ? 4 : 2)}
                            <span className="text-xs text-white/35 font-mono-ui ml-1">{currency}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-mono-ui text-[9px] uppercase tracking-widest text-white/25 mb-1">Commission</div>
                          <div className="font-display font-bold text-base text-emerald-400">
                            2%<span className="text-xs text-white/35 font-mono-ui ml-1">/ wager</span>
                          </div>
                        </div>
                      </div>

                      {/* Treasury */}
                      <a
                        href={treasuryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 group transition-all"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,240,255,0.02)' }}
                      >
                        <div>
                          <div className="font-mono-ui text-[9px] uppercase tracking-widest text-white/25 mb-0.5">Treasury</div>
                          <span className="font-mono-ui text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors">0x155A...5Af9</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-colors shrink-0" />
                      </a>

                      {/* Actions */}
                      <div className="p-2 flex flex-col gap-1">
                        <button
                          onClick={() => { onAddFaucetFunds(); setMenuOpen(false); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 font-mono-ui text-xs font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/25 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Refresh Balance
                        </button>
                        <button
                          onClick={() => { onDisconnectWallet(); setMenuOpen(false); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 font-mono-ui text-xs font-bold uppercase tracking-wider text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
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
      </nav>
    </header>
  );
};
