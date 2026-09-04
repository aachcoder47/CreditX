import { useState } from 'react';
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
  ExternalLink
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
  const isEthBased = currency.toUpperCase().includes('ETH') || currency.toUpperCase().includes('POL') || currency.toUpperCase().includes('BNB');

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      soundFx.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const treasuryExplorerUrl = getExplorerAddressLink(wallet.chainId || null, COMMISSION_TREASURY_ADDRESS);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090A0F]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-['Orbitron'] text-lg">
                    CX
                  </span>
                </div>
              </div>
              {/* Pulsing ring */}
              <div className="absolute -inset-1 rounded-xl bg-cyan-500/20 blur-sm -z-10 group-hover:bg-cyan-500/40 transition-all duration-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron'] text-lg sm:text-xl font-black tracking-wider text-white">
                  CYBER<span className="text-cyan-400">FLIP</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PVP ARENA
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-medium tracking-tight">
                  ON-CHAIN <span className="text-slate-400 hidden sm:inline">• 2% COMMISSION</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Provably Fair Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenProvablyFair();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-400 border border-white/10 transition-all"
            title="Provably Fair Cryptographic Verification & Commission Details"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">PROVABLY FAIR</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-all"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
          </button>

          {/* Wallet State & Button */}
          {!wallet.isConnected ? (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenWalletModal();
              }}
              className="relative group px-4 sm:px-5 py-2.5 rounded-xl font-['Orbitron'] text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all duration-300 flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="relative">
              <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/15 p-1 gap-1.5 sm:gap-2">
                {/* Balance Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-500/30">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF]" />
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {wallet.solBalance.toFixed(isEthBased ? 4 : 2)} {currency}
                  </span>
                </div>

                {/* Refresh Balance Button */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onAddFaucetFunds();
                  }}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 text-[11px] font-mono font-semibold flex items-center gap-1 transition-all"
                  title="Refresh on-chain balance"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Address Button / Dropdown Trigger */}
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 transition-colors"
                >
                  <span>{truncateAddress(wallet.address || '')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Wallet Dropdown Menu */}
              {walletMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-white/15 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    <span>Connected Wallet</span>
                    <span className="text-cyan-400 font-bold">{wallet.network}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10 mb-3">
                    <span className="font-mono text-xs text-slate-200 truncate pr-2">
                      {wallet.address}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                      title="Copy Address"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono mb-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Balance:</span>
                      <span className="text-cyan-300 font-bold">{wallet.solBalance.toFixed(isEthBased ? 4 : 2)} {currency}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Commission:</span>
                      <span className="text-emerald-400 font-bold">2% per wager</span>
                    </div>
                  </div>

                  {/* Treasury Link */}
                  <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10px] font-mono mb-3">
                    <div className="text-slate-400 mb-0.5">Commission Treasury:</div>
                    <a
                      href={treasuryExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-cyan-200 flex items-center justify-between underline break-all"
                    >
                      <span>0x155A...5Af9</span>
                      <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                    </a>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        onAddFaucetFunds();
                        setWalletMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh Balance
                    </button>
                    <button
                      onClick={() => {
                        onDisconnectWallet();
                        setWalletMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
