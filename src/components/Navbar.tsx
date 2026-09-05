import { useState, useRef } from 'react';
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
  const navRef = useRef<HTMLDivElement>(null);
  const [navMx, setNavMx] = useState(50);

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

  const handleNavMouse = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setNavMx(((e.clientX - rect.left) / rect.width) * 100);
  };

  const treasuryUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <nav
        ref={navRef}
        onMouseMove={handleNavMouse}
        className="mx-auto max-w-[1400px] transition-all duration-500 mt-3 sm:mt-4 px-3 sm:px-0"
      >
        <div
          className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[58px] sm:h-[64px] lg:h-[68px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(8,8,14,0.92) 0%, rgba(4,4,8,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            borderRadius: '16px',
            boxShadow:
              '0 8px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(600px circle at ${navMx}% -10%, rgba(0,240,255,0.08), transparent 50%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.4), rgba(139,92,246,0.4), transparent)',
            }}
          />

          <a href="#" className="flex items-center gap-2.5 group shrink-0 relative z-10" onClick={e => e.preventDefault()}>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 blur-md"
                style={{ background: '#00F0FF', opacity: 0.5 }}
              />
              <div
                className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
                style={{ background: '#00F0FF', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', boxShadow: '0 0 18px rgba(0,240,255,0.5)' }}
              >
                <span className="font-['Space_Mono'] font-bold text-[10px] text-black leading-none">CF</span>
              </div>
            </div>
            <span
              className="font-display font-bold text-lg sm:text-xl tracking-tight text-white transition-all duration-500 group-hover:tracking-[0.02em]"
              style={{ letterSpacing: '-0.02em' }}
            >
              CYBER<span className="text-shimmer">FLIP</span>
            </span>
            <span className="font-mono-ui text-[9px] text-white/30 mt-1 hidden sm:block group-hover:text-cyan-400/60 transition-colors duration-500">™</span>
          </a>

          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <div className="tag-cyan tag relative overflow-hidden group">
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" style={{ boxShadow: '0 0 8px #00F0FF' }} />
              </span>
              <span className="relative">On-Chain · Live</span>
              <span className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-spotlight pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-10">
            <button
              onClick={() => { soundFx.playClick(); onOpenProvablyFair(); }}
              onMouseMove={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                (e.currentTarget as HTMLElement).style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                (e.currentTarget as HTMLElement).style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
              }}
              className="btn-premium hidden sm:flex items-center gap-1.5 px-3 py-2 font-mono-ui text-[10px] font-bold uppercase tracking-widest text-white/45 hover:text-white/85 transition-all border border-white/10 hover:border-cyan-500/40"
              style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
              title="Provably Fair"
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#00F0FF' }} />
              Provably Fair
            </button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggleMute}
              className="p-2 sm:p-2.5 border border-white/10 hover:border-cyan-500/40 text-white/40 hover:text-cyan-400 transition-all btn-premium relative overflow-hidden"
              style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted
                ? <VolumeX className="w-4 h-4 text-rose-400" />
                : <Volume2 className="w-4 h-4" style={{ color: '#00F0FF' }} />
              }
            </motion.button>

            {!wallet.isConnected ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { soundFx.playClick(); onOpenWalletModal(); }}
                className="relative flex items-center gap-2 overflow-hidden font-mono-ui text-[10px] sm:text-xs font-bold tracking-widest uppercase text-black btn-premium group"
                style={{
                  background: 'linear-gradient(135deg, #00F0FF 0%, #22D3EE 50%, #0EA5E9 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 0 24px rgba(0,240,255,0.35), 0 4px 20px rgba(0,240,255,0.15)',
                  padding: 0,
                }}
              >
                <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-premium-shimmer pointer-events-none" />
                <span
                  className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 shrink-0"
                  style={{ background: 'rgba(0,0,0,0.16)', borderRight: '1px solid rgba(0,0,0,0.2)' }}
                >
                  <Wallet className="w-4 h-4" />
                </span>
                <span className="hidden sm:inline pr-4 font-bold">Connect Wallet</span>
              </motion.button>
            ) : (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 border hover:border-cyan-500/50 transition-all btn-premium relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10,10,14,0.95) 0%, rgba(4,4,8,0.98) 100%)',
                    borderRadius: '12px',
                    boxShadow: menuOpen
                      ? '0 0 0 1px rgba(0,240,255,0.35), 0 0 25px rgba(0,240,255,0.2), 0 8px 30px rgba(0,0,0,0.6)'
                      : '0 4px 18px rgba(0,0,0,0.45)',
                    borderColor: menuOpen ? 'rgba(0,240,255,0.45)' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 relative">
                    <span className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse opacity-60" />
                    <span className="relative block w-full h-full rounded-full bg-cyan-400" style={{ boxShadow: '0 0 8px #00F0FF' }} />
                  </span>
                  <span className="font-mono-ui text-[11px] sm:text-xs font-bold text-cyan-300 whitespace-nowrap">
                    {wallet.solBalance.toFixed(isEthBased ? 3 : 2)} <span className="text-cyan-400/60">{currency}</span>
                  </span>
                  <span className="hidden sm:inline font-mono-ui text-[10px] text-white/35 group-hover:text-white/55 transition-colors">
                    {truncate(wallet.address || '')}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{ opacity: 0,    y: 8,  scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16,1,0.3,1] }}
                      className="absolute right-0 mt-3 w-72 sm:w-80 z-50 corner-brackets"
                      style={{
                        background: 'linear-gradient(180deg, rgba(10,10,16,0.96) 0%, rgba(4,4,10,0.98) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow:
                          '0 25px 70px rgba(0,0,0,0.75), 0 0 40px rgba(0,240,255,0.06) inset',
                        backdropFilter: 'blur(24px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                        borderRadius: '16px',
                      }}
                    >
                      <span className="cb-tl" />
                      <span className="cb-br" />

                      <div
                        className="flex items-center justify-between px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', borderRadius: '16px 16px 0 0' }}
                      >
                        <span>Connected Wallet</span>
                        <span
                          className="px-2 py-0.5 text-[9px] font-bold"
                          style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.14), rgba(0,240,255,0.04))', border: '1px solid rgba(0,240,255,0.35)', color: '#22D3EE', borderRadius: '6px' }}
                        >
                          {wallet.network}
                        </span>
                      </div>

                      <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-ui text-xs text-white/60 truncate pr-2">{wallet.address}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={handleCopy}
                            className="p-1.5 border border-white/10 hover:border-cyan-500/40 text-white/35 hover:text-cyan-400 transition-all shrink-0"
                            style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </motion.button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 px-4 py-3.5 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="p-2.5" style={{ background: 'rgba(0,240,255,0.04)', borderRadius: '10px', border: '1px solid rgba(0,240,255,0.12)' }}>
                          <div className="font-mono-ui text-[9px] uppercase tracking-widest text-white/30 mb-1">Balance</div>
                          <div className="font-display font-bold text-base text-cyan-300 text-glow-cyan" style={{ textShadow: 'none' }}>
                            {wallet.solBalance.toFixed(isEthBased ? 4 : 2)}
                            <span className="text-xs text-white/35 font-mono-ui ml-1">{currency}</span>
                          </div>
                        </div>
                        <div className="p-2.5" style={{ background: 'rgba(16,185,129,0.04)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.12)' }}>
                          <div className="font-mono-ui text-[9px] uppercase tracking-widest text-white/30 mb-1">Commission</div>
                          <div className="font-display font-bold text-base text-emerald-400">
                            2%<span className="text-xs text-white/35 font-mono-ui ml-1">/ wager</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={treasuryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 group transition-all hover:bg-cyan-500/5"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(0,240,255,0.01))' }}
                      >
                        <div>
                          <div className="font-mono-ui text-[9px] uppercase tracking-widest text-white/25 mb-0.5">Treasury</div>
                          <span className="font-mono-ui text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors">0x155A...5Af9</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-colors shrink-0" />
                      </a>

                      <div className="p-2.5 flex flex-col gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.008 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => { onAddFaucetFunds(); setMenuOpen(false); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 font-mono-ui text-xs font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/8 transition-all group btn-premium relative overflow-hidden"
                          style={{ borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(0,240,255,0.02))' }}
                        >
                          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                          Refresh Balance
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.008 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => { onDisconnectWallet(); setMenuOpen(false); }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 font-mono-ui text-xs font-bold uppercase tracking-wider text-rose-400/75 hover:text-rose-300 hover:bg-rose-500/6 border border-white/10 hover:border-rose-500/40 transition-all"
                          style={{ borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect
                        </motion.button>
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
