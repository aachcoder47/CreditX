import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Hash, 
  KeyRound, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { computeProvablyFairResult, generateRandomHex } from '../utils/provablyFair';
import { COMMISSION_TREASURY_ADDRESS, getExplorerAddressLink } from '../utils/blockchain';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  onUpdateClientSeed: (newSeed: string) => void;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({
  isOpen,
  onClose,
  serverSeedHash,
  clientSeed,
  nonce,
  onUpdateClientSeed,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedTreasury, setCopiedTreasury] = useState(false);
  const [tab, setTab] = useState<'OVERVIEW' | 'VERIFIER'>('OVERVIEW');
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState({ mx: 50, my: 50 });

  const [testServerSeed, setTestServerSeed] = useState('demo_server_secret_key_creditx_2026');
  const [testClientSeed, setTestClientSeed] = useState(clientSeed);
  const [testNonce, setTestNonce] = useState(nonce.toString());
  const [verifierResult, setVerifierResult] = useState<{
    outcomeNumber: number;
    resultSide: string;
    hash: string;
  } | null>(null);

  const handlePanelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    setPanelPos({ mx, my });
  };

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(serverSeedHash);
    setCopied(true);
    soundFx.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTreasury = () => {
    navigator.clipboard.writeText(COMMISSION_TREASURY_ADDRESS);
    setCopiedTreasury(true);
    soundFx.playClick();
    setTimeout(() => setCopiedTreasury(false), 2000);
  };

  const handleRandomizeClientSeed = () => {
    soundFx.playClick();
    const newSeed = generateRandomHex(16);
    onUpdateClientSeed(newSeed);
    setTestClientSeed(newSeed);
  };

  const handleRunVerify = async () => {
    soundFx.playClick();
    const parsedNonce = parseInt(testNonce, 10) || 0;
    const res = await computeProvablyFairResult(testServerSeed, testClientSeed, parsedNonce);
    setVerifierResult(res);
  };

  const treasuryExplorerUrl = getExplorerAddressLink(null, COMMISSION_TREASURY_ADDRESS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        ref={panelRef}
        onMouseMove={handlePanelMouseMove}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="w-full max-w-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <div className="rounded-3xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
          <div
            className="relative rounded-3xl defi-card p-5 sm:p-7 overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(16,185,129,0.05) 0%, transparent 45%),
                radial-gradient(circle at ${100 - panelPos.mx}% ${100 - panelPos.my}%, rgba(0,240,255,0.04) 0%, transparent 45%),
                linear-gradient(180deg, rgba(13,18,30,0.98) 0%, rgba(6,10,18,0.99) 100%)
              `,
            }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Provably Fair Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    100% Cryptographic Open Transparency & Verifiable Randomness
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Tab Navigation */}
            <div className="relative flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-white/[0.03] border border-white/8 text-xs font-sans">
              <button
                onClick={() => { setTab('OVERVIEW'); soundFx.playClick(); }}
                className={`relative z-10 flex-1 py-2 rounded-lg font-medium transition-all text-xs flex items-center justify-center gap-1.5 ${
                  tab === 'OVERVIEW' ? 'text-white bg-white/10 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Seeds & Rules
              </button>
              <button
                onClick={() => { setTab('VERIFIER'); soundFx.playClick(); }}
                className={`relative z-10 flex-1 py-2 rounded-lg font-medium transition-all text-xs flex items-center justify-center gap-1.5 ${
                  tab === 'VERIFIER' ? 'text-white bg-white/10 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Independent Verifier
              </button>
            </div>

            {tab === 'OVERVIEW' ? (
              <div className="mt-4 space-y-3.5 text-xs font-sans relative">
                {/* Verified Treasury */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5 text-cyan-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Verified Commission Treasury
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-medium border border-emerald-500/20">
                      2.0% House Edge
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/45 border border-white/5 font-mono text-[11px] text-slate-200 break-all flex items-center justify-between gap-2 select-all">
                    <span>{COMMISSION_TREASURY_ADDRESS}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={handleCopyTreasury}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Copy Treasury Address"
                      >
                        {copiedTreasury ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={treasuryExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="View on Block Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    All rounds deduct a fixed 2% fee sent transparently to this designated house treasury wallet on each flip.
                  </p>
                </div>

                {/* Server Seed Hash */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300 text-xs">
                      <Hash className="w-4 h-4 text-cyan-400" />
                      Current Server Seed (SHA-256 Hash)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">
                      Pre-committed
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/45 border border-white/5 font-mono text-[11px] text-cyan-300 break-all flex items-center justify-between gap-2">
                    <span>{serverSeedHash}</span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 shrink-0 transition-colors"
                      title="Copy Hash"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The server generates a secret seed and reveals its SHA-256 cryptographic digest before the flip occurs. The outcome cannot be tampered with retrospectively.
                  </p>
                </div>

                {/* Client Seed & Nonce */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300 text-xs">
                        <KeyRound className="w-4 h-4 text-purple-400" />
                        Client Seed
                      </span>
                      <button
                        onClick={handleRandomizeClientSeed}
                        className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 transition-colors group"
                      >
                        <RefreshCw className="w-3 h-3 transition-transform group-hover:rotate-180" />
                        Randomize
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/45 border border-white/5 font-mono text-[11px] text-purple-300 break-all">
                      {clientSeed}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Browser-supplied entropy to ensure dual-party fairness.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-1.5">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300 text-xs">
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      Nonce Counter
                    </span>
                    <div className="p-2.5 rounded-xl bg-black/45 border border-white/5 font-mono text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="text-slate-500 text-xs font-normal">#</span>
                      {nonce}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Sequential counter incremented per flip to protect against replay attacks.
                    </p>
                  </div>
                </div>

                {/* Rules & Payoffs */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-2">
                  <h4 className="font-display text-xs font-semibold text-white inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Protocol Specifications & Formula
                  </h4>
                  <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed list-disc list-inside">
                    <li><strong className="text-slate-200">Execution Time:</strong> 5.0 seconds on-chain / cryptographic confirmation.</li>
                    <li><strong className="text-slate-200">Net Multiplier:</strong> Fixed 1.98x payout (2.00% protocol edge).</li>
                    <li><strong className="text-slate-200">Algorithm:</strong> <code className="px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-cyan-300 font-mono text-[10px]">HMAC_SHA256(server_seed, client_seed + nonce) % 100</code></li>
                    <li><strong className="text-slate-200">Bin Distribution:</strong> <code className="text-cyan-300 font-mono text-[10px]">0–49 = HEADS (50%)</code>, <code className="text-amber-300 font-mono text-[10px]">50–99 = TAILS (50%)</code>.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3.5 text-xs font-sans relative">
                <p className="text-slate-300 text-xs">
                  Verify any past round result independently by providing the unhashed server secret seed, client seed, and round nonce:
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Server Seed Secret:</label>
                    <input
                      type="text"
                      value={testServerSeed}
                      onChange={(e) => setTestServerSeed(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black/45 border border-white/10 text-slate-200 font-mono text-xs focus:border-cyan-400 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Client Seed:</label>
                      <input
                        type="text"
                        value={testClientSeed}
                        onChange={(e) => setTestClientSeed(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/45 border border-white/10 text-slate-200 font-mono text-xs focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Nonce:</label>
                      <input
                        type="number"
                        value={testNonce}
                        onChange={(e) => setTestNonce(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/45 border border-white/10 text-slate-200 font-mono text-xs focus:border-cyan-400 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleRunVerify}
                    className="w-full py-3 rounded-xl font-display font-semibold text-xs text-white flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <span>Run Cryptographic Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {verifierResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Outcome Number:</span>
                        <span className="font-mono font-bold text-white text-base">
                          {verifierResult.outcomeNumber} <span className="text-slate-500 text-xs">/ 99</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Resolved Side:</span>
                        <span className={`font-display font-bold text-xs px-2.5 py-1 rounded-lg border ${
                          verifierResult.resultSide === 'HEADS' 
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' 
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {verifierResult.resultSide}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-white/8 break-all">
                        <span className="text-cyan-300 font-mono font-semibold">HMAC Digest:</span> {verifierResult.hash}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
