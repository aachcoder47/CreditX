import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles, AlertCircle, ExternalLink, CheckCircle2, Wallet, ArrowRight } from 'lucide-react';
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
      // fallback
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        ref={panelRef}
        onMouseMove={handlePanelMouseMove}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="w-full max-w-md relative overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <div className="rounded-3xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
          <div
            className="relative rounded-3xl defi-card p-5 sm:p-6 overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(0,240,255,0.05) 0%, transparent 50%),
                linear-gradient(180deg, rgba(13,18,30,0.98) 0%, rgba(6,10,18,0.99) 100%)
              `,
            }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                    Connect Wallet
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Select a supported provider to access CreditX
                  </p>
                </div>
              </div>
              <button
                onClick={() => { soundFx.playClick(); onClose(); }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative pt-4">
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Commission Treasury notice */}
              <div className="mb-4 p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Verified Protocol Treasury
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-medium border border-emerald-500/20">
                    2.0% House Edge
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 break-all bg-black/40 p-2 rounded-lg border border-white/5 select-all font-mono">
                  {COMMISSION_TREASURY_ADDRESS}
                </p>
                <span className="block text-[10px] text-slate-400">
                  MetaMask executes direct non-custodial commission routing on-chain.
                </span>
              </div>

              {/* Wallet Options */}
              <div className="space-y-3">
                {/* MetaMask */}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleConnectMetaMask}
                  disabled={connecting !== null}
                  className="w-full group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600/30 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <span className="font-display text-amber-400 font-black text-lg">M</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          MetaMask
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[9px] font-mono border border-amber-500/20">
                          EVM ON-CHAIN
                        </span>
                        {hasEthereum ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-mono border border-emerald-500/20">
                            DETECTED
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Ethereum · Sepolia · Base · Arbitrum · Polygon
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {connecting === 'MetaMask' ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        <span>Connecting…</span>
                      </div>
                    ) : hasEthereum ? (
                      <span className="text-xs text-slate-400 group-hover:text-amber-300 transition-colors flex items-center gap-1 font-mono font-medium">
                        <span>Connect</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    ) : (
                      <a
                        href="https://metamask.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-mono font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Install</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.button>

                {/* Phantom */}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleConnectPhantom}
                  disabled={connecting !== null}
                  className="w-full group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/40 transition-all flex items-center justify-between disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600/30 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <span className="font-display text-purple-400 font-black text-lg">P</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          Phantom
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 text-[9px] font-mono border border-purple-500/20">
                          SOLANA DEVNET
                        </span>
                        {hasSolana ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-mono border border-emerald-500/20">
                            DETECTED
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Solana Devnet Wallet
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {connecting === 'Phantom' ? (
                      <div className="flex items-center gap-1.5 text-xs text-purple-300 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        <span>Connecting…</span>
                      </div>
                    ) : hasSolana ? (
                      <span className="text-xs text-slate-400 group-hover:text-purple-300 transition-colors flex items-center gap-1 font-mono font-medium">
                        <span>Connect</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    ) : (
                      <a
                        href="https://phantom.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-mono font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Install</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Security guarantee footer */}
              <div className="mt-5 pt-3.5 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Non-custodial connection</span>
                </div>
                <span className="flex items-center gap-1 text-cyan-400 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
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
