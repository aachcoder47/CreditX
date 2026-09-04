import { useState, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative overflow-hidden">
        {/* Corner accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-['Orbitron'] text-lg font-bold text-white tracking-wide">
              Connect Web3 Wallet
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Connect real wallet to execute on-chain flips
            </p>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Commission Treasury Indicator */}
        <div className="mt-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              COMMISSION TREASURY
            </span>
            <span className="text-emerald-400">2% HOUSE FEE</span>
          </div>
          <p className="text-[10px] text-slate-300 break-all bg-black/50 p-2 rounded-xl border border-white/10 select-all font-mono">
            {COMMISSION_TREASURY_ADDRESS}
          </p>
          <span className="block text-[10px] text-slate-400 mt-1">
            MetaMask (EVM) executes direct on-chain commission routing.
          </span>
        </div>

        {/* Wallet Options */}
        <div className="mt-4 space-y-3">
          {/* MetaMask (EVM - Recommended for Commission Treasury) */}
          <button
            onClick={handleConnectMetaMask}
            disabled={connecting !== null}
            className="w-full group p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 hover:from-orange-500/20 hover:to-amber-500/10 border border-orange-500/30 hover:border-orange-400/60 transition-all duration-200 flex items-center justify-between disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <span className="font-['Orbitron'] text-white font-black text-base">M</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-['Orbitron'] text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                    MetaMask
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    EVM ON-CHAIN
                  </span>
                  {hasEthereum ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ DETECTED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      NOT INSTALLED
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Ethereum • Sepolia • Base • Arbitrum • Polygon
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connecting === 'MetaMask' ? (
                <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
              ) : (
                <span className="text-xs font-mono text-slate-400 group-hover:text-orange-300 transition-colors">
                  {hasEthereum ? 'Connect →' : (
                    <a
                      href="https://metamask.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Install <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </span>
              )}
            </div>
          </button>

          {/* Phantom (Solana) */}
          <button
            onClick={handleConnectPhantom}
            disabled={connecting !== null}
            className="w-full group p-4 rounded-2xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/10 hover:border-purple-400/50 transition-all duration-200 flex items-center justify-between disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(112,0,255,0.4)]">
                <span className="font-['Orbitron'] text-white font-black text-base">P</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-['Orbitron'] text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Phantom
                  </span>
                  {hasSolana ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ DETECTED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      NOT INSTALLED
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400">Solana Devnet Wallet</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connecting === 'Phantom' ? (
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <span className="text-xs font-mono text-slate-400 group-hover:text-purple-300 transition-colors">
                  {hasSolana ? 'Connect →' : (
                    <a
                      href="https://phantom.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Install <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Non-custodial web3 connection</span>
          </div>
          <span className="text-cyan-400">Real on-chain tx</span>
        </div>
      </div>
    </div>
  );
};
