import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles, AlertCircle, ExternalLink, CheckCircle2, Wallet } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { COMMISSION_TREASURY_ADDRESS, getChainInfo } from '../utils/blockchain';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (
    walletName: string,
    address: string,
    initialBalance?: number,
    chainId?: string | null,
    currency?: string
  ) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSelectWallet,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSolana, setHasSolana] = useState(false);
  const [hasEthereum, setHasEthereum] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState({ mx: 50, my: 50 });

  const handlePanelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    setPanelPos({ mx, my });
  };

  useEffect(() => {
    if (!isOpen) {
      setConnecting(null);
      setError(null);
      return;
    }
    const win = window as unknown as {
      solana?: { isPhantom?: boolean };
      ethereum?: { isMetaMask?: boolean };
    };
    setHasSolana(!!win.solana?.isPhantom);
    setHasEthereum(!!win.ethereum);
  }, [isOpen]);

  if (!isOpen) return null;

  const getSolBalance = async (address: string): Promise<number> => {
    try {
      const res = await fetch(`https://api.devnet.solana.com`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });
      const data = await res.json();
      if (data?.result?.value != null) {
        return data.result.value / 1_000_000_000;
      }
    } catch {
    }
    return 0;
  };

  const getEthBalance = async (address: string): Promise<number> => {
    try {
      const win = window as unknown as {
        ethereum: { request: (args: { method: string; params: unknown[] }) => Promise<string> };
      };
      const hexBalance = await win.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const wei = parseInt(hexBalance as string, 16);
      return wei / 1e18;
    } catch {
      return 0;
    }
  };

  const handleConnectPhantom = async () => {
    setError(null);
    const win = window as unknown as {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
      };
    };

    if (!win.solana?.isPhantom) {
      setError('Phantom wallet not found. Please install it from phantom.app');
      return;
    }

    setConnecting('Phantom');
    soundFx.playClick();

    try {
      const resp = await win.solana.connect();
      const pubkey = resp.publicKey.toString();
      const balance = await getSolBalance(pubkey);
      onSelectWallet('Phantom', pubkey, balance, null, 'SOL');
      onClose();
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e?.code === 4001) {
        setError('Connection rejected. Please approve the request in Phantom.');
      } else {
        setError(e?.message || 'Failed to connect Phantom. Try again.');
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectMetaMask = async () => {
    setError(null);
    const win = window as unknown as {
      ethereum?: {
        isMetaMask?: boolean;
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    };

    if (!win.ethereum) {
      setError('No EVM wallet detected. Please install MetaMask from metamask.io');
      return;
    }

    setConnecting('MetaMask');
    soundFx.playClick();

    try {
      const accounts = (await win.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        setError('No account returned from MetaMask. Please try again.');
        return;
      }

      const chainId = (await win.ethereum.request({
        method: 'eth_chainId',
      })) as string;

      const chainInfo = getChainInfo(chainId);
      const address = accounts[0];
      const balance = await getEthBalance(address);

      onSelectWallet('MetaMask', address, balance, chainId, chainInfo.symbol);
      onClose();
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e?.code === 4001) {
        setError('Connection rejected. Please approve the request in MetaMask.');
      } else {
        setError(e?.message || 'Failed to connect MetaMask. Try again.');
      }
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/88 backdrop-blur-lg">
      <motion.div
        ref={panelRef}
        onMouseMove={handlePanelMouseMove}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 360 }}
        className="w-full max-w-md relative overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <div className="gradient-border rounded-3xl p-[1.5px]">
          <div
            className="relative rounded-3xl glass-panel p-4 sm:p-6 corner-brackets overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(112,0,255,0.08) 0%, transparent 45%),
                radial-gradient(circle at ${100 - panelPos.mx}% ${100 - panelPos.my}%, rgba(0,240,255,0.06) 0%, transparent 45%),
                linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.97) 100%)
              `,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span className="cb-tl" />
            <span className="cb-br" />

            <div className="absolute -top-28 -right-24 w-52 h-52 rounded-full bg-cyan-500/20 blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-28 w-56 h-56 rounded-full bg-purple-500/20 blur-[70px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/6 blur-[90px] pointer-events-none" />

            <div className="relative flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0"
                  style={{ boxShadow: '0 0 18px rgba(0,240,255,0.25), inset 0 0 12px rgba(0,240,255,0.1)' }}
                >
                  <Wallet className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] text-cyan-300" style={{ filter: 'drop-shadow(0 0 6px #22D3EE)' }} />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold tracking-wide">
                    <span className="text-white">CONNECT </span>
                    <span className="text-shimmer">WALLET</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
                    Connect real wallet for on-chain flips
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { soundFx.playClick(); onClose(); }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors border border-white/5 hover:border-white/20"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="relative">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-3 sm:mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-start gap-2 relative overflow-hidden"
                    style={{ boxShadow: '0 0 20px rgba(244,63,94,0.15), inset 0 0 15px rgba(244,63,94,0.08)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" style={{ filter: 'drop-shadow(0 0 5px #F43F5E)' }} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative mt-3 sm:mt-4 p-3 rounded-2xl space-y-1.5 sm:space-y-2 overflow-hidden group"
                style={{
                  background: 'linear-gradient(180deg, rgba(8,47,73,0.55) 0%, rgba(6,28,44,0.65) 100%)',
                  border: '1px solid rgba(0,240,255,0.35)',
                  boxShadow: '0 0 25px rgba(0,240,255,0.18), inset 0 0 18px rgba(0,240,255,0.1)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(0,240,255,0.12) 0%, transparent 50%)`,
                  }}
                />
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-cyan-300 font-bold mb-1 relative">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px #22D3EE)' }} />
                    VERIFIED COMMISSION TREASURY
                  </span>
                  <span className="tag-emerald text-[9px] sm:text-[10px]">2% HOUSE FEE</span>
                </div>
                <p className="text-[10px] text-slate-300 break-all bg-black/55 p-2 rounded-xl border border-white/10 select-all font-mono relative backdrop-blur-sm">
                  {COMMISSION_TREASURY_ADDRESS}
                </p>
                <span className="block text-[9px] sm:text-[10px] text-slate-400 mt-1 relative">
                  MetaMask (EVM) executes direct on-chain commission routing.
                </span>
              </div>

              <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 relative">
                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.988 }}
                  onClick={handleConnectMetaMask}
                  disabled={connecting !== null}
                  className="relative w-full group p-3.5 sm:p-4 rounded-2xl transition-all duration-300 flex items-center justify-between disabled:opacity-60 disabled:cursor-wait overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(217,119,6,0.06) 50%, rgba(245,158,11,0.1) 100%)',
                    border: '1px solid rgba(245,158,11,0.38)',
                    boxShadow: '0 0 22px rgba(245,158,11,0.15), inset 0 0 18px rgba(245,158,11,0.08)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 20% 50%, rgba(245,158,11,0.2) 0%, transparent 55%)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 transition-all duration-500 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
                      boxShadow: '0 0 12px #F59E0B',
                    }}
                  />
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-400/8 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center gap-3">
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2"
                      style={{ boxShadow: '0 0 20px rgba(245,158,11,0.55), inset 0 0 10px rgba(255,255,255,0.2)' }}
                    >
                      <span className="font-['Orbitron'] text-white font-black text-base drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]">M</span>
                    </div>
                    <div className="text-left">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          MetaMask
                        </span>
                        <span className="tag-amber text-[8px] sm:text-[9px]">EVM ON-CHAIN</span>
                        {hasEthereum ? (
                          <span className="tag-emerald text-[8px] sm:text-[9px]">✓ DETECTED</span>
                        ) : (
                          <span className="tag-amber text-[8px] sm:text-[9px]" style={{ opacity: 0.9 }}>NOT INSTALLED</span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                        Ethereum • Sepolia • Base • Arbitrum • Polygon
                      </span>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-2">
                    {connecting === 'MetaMask' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-orange-400" style={{ filter: 'drop-shadow(0 0 6px #F59E0B)' }} />
                        <span className="text-[11px] font-mono text-amber-300">Connecting…</span>
                      </motion.div>
                    ) : (
                      <span className="text-xs font-mono text-slate-400 group-hover:text-amber-300 transition-colors flex items-center gap-1 group/cta">
                        {hasEthereum ? (
                          <>
                            <span>Connect</span>
                            <span className="transition-transform duration-200 group-hover/cta:translate-x-1 inline-block">→</span>
                          </>
                        ) : (
                          <a
                            href="https://metamask.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold group/install"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Install</span>
                            <ExternalLink className="w-3 h-3 transition-transform duration-200 group/install:translate-x-0.5 group/install:-translate-y-0.5" />
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.988 }}
                  onClick={handleConnectPhantom}
                  disabled={connecting !== null}
                  className="relative w-full group p-3.5 sm:p-4 rounded-2xl transition-all duration-300 flex items-center justify-between disabled:opacity-60 disabled:cursor-wait overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(112,0,255,0.16) 0%, rgba(67,56,202,0.07) 50%, rgba(112,0,255,0.1) 100%)',
                    border: '1px solid rgba(139,92,246,0.42)',
                    boxShadow: '0 0 22px rgba(112,0,255,0.17), inset 0 0 18px rgba(112,0,255,0.1)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                    style={{
                      background: 'radial-gradient(circle at 20% 50%, rgba(112,0,255,0.22) 0%, transparent 55%)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 transition-all duration-500 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #A855F7, transparent)',
                      boxShadow: '0 0 12px #A855F7',
                    }}
                  />
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-400/8 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-center gap-3">
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2"
                      style={{ boxShadow: '0 0 20px rgba(112,0,255,0.55), inset 0 0 10px rgba(255,255,255,0.2)' }}
                    >
                      <span className="font-['Orbitron'] text-white font-black text-base drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]">P</span>
                    </div>
                    <div className="text-left">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          Phantom
                        </span>
                        <span className="tag-violet text-[8px] sm:text-[9px]">SOLANA DEVNET</span>
                        {hasSolana ? (
                          <span className="tag-emerald text-[8px] sm:text-[9px]">✓ DETECTED</span>
                        ) : (
                          <span className="tag-amber text-[8px] sm:text-[9px]" style={{ opacity: 0.9 }}>NOT INSTALLED</span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                        Solana Devnet Wallet
                      </span>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-2">
                    {connecting === 'Phantom' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" style={{ filter: 'drop-shadow(0 0 6px #A855F7)' }} />
                        <span className="text-[11px] font-mono text-purple-300">Connecting…</span>
                      </motion.div>
                    ) : (
                      <span className="text-xs font-mono text-slate-400 group-hover:text-purple-300 transition-colors flex items-center gap-1 group/cta2">
                        {hasSolana ? (
                          <>
                            <span>Connect</span>
                            <span className="transition-transform duration-200 group-hover/cta2:translate-x-1 inline-block">→</span>
                          </>
                        ) : (
                          <a
                            href="https://phantom.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold group/install2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Install</span>
                            <ExternalLink className="w-3 h-3 transition-transform duration-200 group/install2:translate-x-0.5 group/install2:-translate-y-0.5" />
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                </motion.button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400 relative">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px #10B981)' }} />
                  <span>Non-custodial connection</span>
                </div>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                  Real on-chain tx
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
