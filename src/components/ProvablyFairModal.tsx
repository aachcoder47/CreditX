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

  const [testServerSeed, setTestServerSeed] = useState('demo_server_secret_key_cyberflip_2026');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/88 backdrop-blur-lg">
      <motion.div
        ref={panelRef}
        onMouseMove={handlePanelMouseMove}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 360 }}
        className="w-full max-w-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <div className="gradient-border rounded-3xl p-[1.5px]">
          <div
            className="relative rounded-3xl glass-panel p-4 sm:p-6 md:p-7 corner-brackets overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(16,185,129,0.06) 0%, transparent 45%),
                radial-gradient(circle at ${100 - panelPos.mx}% ${100 - panelPos.my}%, rgba(112,0,255,0.06) 0%, transparent 45%),
                linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(2,6,23,0.97) 100%)
              `,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span className="cb-tl" />
            <span className="cb-br" />

            <div className="absolute -top-28 -right-28 w-56 h-56 rounded-full bg-emerald-500/14 blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-28 w-60 h-60 rounded-full bg-purple-500/14 blur-[70px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

            <div className="relative flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0"
                  style={{ boxShadow: '0 0 20px rgba(16,185,129,0.3), inset 0 0 14px rgba(16,185,129,0.12)' }}
                >
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" style={{ filter: 'drop-shadow(0 0 6px #10B981)' }} />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-sm sm:text-base md:text-lg font-bold tracking-wider">
                    PROVABLY <span className="text-shimmer">FAIR SYSTEM</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
                    100% Cryptographic Transparency
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors border border-white/5 hover:border-white/20"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="relative flex items-center gap-1.5 mt-3 sm:mt-4 p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-mono backdrop-blur-sm">
              <motion.div
                layoutId="pfTabActive"
                className={`absolute top-1 bottom-1 rounded-lg pointer-events-none z-0 ${
                  tab === 'OVERVIEW'
                    ? 'left-1 bg-gradient-to-r from-cyan-500/25 to-cyan-500/8 border border-cyan-500/40 shadow-[0_0_14px_rgba(0,240,255,0.25)]'
                    : 'right-1 bg-gradient-to-r from-purple-500/25 to-purple-500/8 border border-purple-500/40 shadow-[0_0_14px_rgba(112,0,255,0.25)]'
                }`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
              <button
                onClick={() => { setTab('OVERVIEW'); soundFx.playClick(); }}
                className={`relative z-10 flex-1 py-1.5 sm:py-2 rounded-lg font-bold transition-all text-[11px] sm:text-xs ${
                  tab === 'OVERVIEW' ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                ACTIVE SEEDS & RULES
              </button>
              <button
                onClick={() => { setTab('VERIFIER'); soundFx.playClick(); }}
                className={`relative z-10 flex-1 py-1.5 sm:py-2 rounded-lg font-bold transition-all text-[11px] sm:text-xs ${
                  tab === 'VERIFIER' ? 'text-purple-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                INTERACTIVE VERIFIER
              </button>
            </div>

            {tab === 'OVERVIEW' ? (
              <div className="mt-4 space-y-3 sm:space-y-4 text-xs font-mono relative">
                <div className="relative p-3 sm:p-4 rounded-2xl space-y-1.5 sm:space-y-2 overflow-hidden group"
                  style={{
                    background: 'linear-gradient(180deg, rgba(8,47,73,0.55) 0%, rgba(6,28,44,0.65) 100%)',
                    border: '1px solid rgba(0,240,255,0.38)',
                    boxShadow: '0 0 28px rgba(0,240,255,0.18), inset 0 0 20px rgba(0,240,255,0.1)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(0,240,255,0.13) 0%, transparent 55%)` }}
                  />
                  <div className="flex items-center justify-between text-slate-300 font-bold relative">
                    <span className="flex items-center gap-1.5 text-cyan-300 text-[11px] sm:text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px #22D3EE)' }} />
                      VERIFIED COMMISSION TREASURY
                    </span>
                    <span className="tag-emerald text-[9px] sm:text-[10px]">2.0% HOUSE EDGE</span>
                  </div>
                  <div className="relative p-2 sm:p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] sm:text-[11px] text-slate-200 break-all flex items-center justify-between gap-2 select-all backdrop-blur-sm">
                    <span>{COMMISSION_TREASURY_ADDRESS}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={handleCopyTreasury}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Copy Treasury Address"
                      >
                        {copiedTreasury ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px #10B981)' }} /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </motion.button>
                      <motion.a
                        whileHover={{ scale: 1.08 }}
                        href={treasuryExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors group/ex1"
                        title="View on Block Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group/ex1:translate-x-0.5 group/ex1:-translate-y-0.5" />
                      </motion.a>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed relative">
                    All rounds take an exact 2% commission fee sent directly on-chain to this designated house treasury wallet on every flip.
                  </p>
                </div>

                <div className="relative p-3 sm:p-4 rounded-2xl space-y-1.5 sm:space-y-2 overflow-hidden group"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(2,6,23,0.8) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 0 18px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at ${panelPos.mx}% ${panelPos.my}%, rgba(0,240,255,0.08) 0%, transparent 55%)` }}
                  />
                  <div className="flex items-center justify-between text-slate-400 relative">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] sm:text-xs">
                      <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px #22D3EE)' }} />
                      CURRENT ROUND SERVER SEED (SHA-256)
                    </span>
                    <span className="tag-cyan text-[9px] sm:text-[10px]">COMMITTED PRE-FLIP</span>
                  </div>
                  <div className="relative p-2 sm:p-2.5 rounded-xl bg-black/65 border border-white/5 font-mono text-[10px] sm:text-[11px] text-cyan-300 break-all flex items-center justify-between gap-2">
                    <span>{serverSeedHash}</span>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleCopyHash}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 shrink-0 transition-colors"
                      title="Copy Hash"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px #10B981)' }} /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </motion.button>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed relative">
                    The server generates a secret seed and reveals its SHA-256 hash before your bet. The game outcome cannot be modified once committed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 relative">
                  <div className="relative p-3 sm:p-4 rounded-2xl space-y-1.5 overflow-hidden group"
                    style={{
                      background: 'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(2,6,23,0.8) 100%)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      boxShadow: '0 0 18px rgba(112,0,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                      style={{ background: 'radial-gradient(circle at 30% 50%, rgba(112,0,255,0.1) 0%, transparent 55%)' }}
                    />
                    <div className="flex items-center justify-between text-slate-400 relative">
                      <span className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] sm:text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-purple-400" style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }} />
                        YOUR CLIENT SEED
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={handleRandomizeClientSeed}
                        className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1 transition-colors group/refresh"
                      >
                        <RefreshCw className="w-3 h-3 transition-transform group-hover/refresh:rotate-180" />
                        Randomize
                      </motion.button>
                    </div>
                    <div className="relative p-2 sm:p-2.5 rounded-xl bg-black/65 border border-white/5 font-mono text-[10px] sm:text-[11px] text-purple-300 break-all">
                      {clientSeed}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 relative">
                      Browser-supplied seed to co-create round randomness.
                    </p>
                  </div>

                  <div className="relative p-3 sm:p-4 rounded-2xl space-y-1.5 overflow-hidden group"
                    style={{
                      background: 'linear-gradient(180deg, rgba(15,23,42,0.75) 0%, rgba(2,6,23,0.8) 100%)',
                      border: '1px solid rgba(251,191,36,0.22)',
                      boxShadow: '0 0 18px rgba(251,191,36,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                      style={{ background: 'radial-gradient(circle at 70% 50%, rgba(251,191,36,0.12) 0%, transparent 55%)' }}
                    />
                    <span className="relative flex items-center gap-1.5 font-bold text-slate-300 text-[11px] sm:text-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
                      NONCE COUNTER
                    </span>
                    <div className="relative p-2 sm:p-2.5 rounded-xl bg-black/65 border border-white/5 font-mono text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2"
                      style={{ textShadow: '0 0 8px rgba(251,191,36,0.5)' }}
                    >
                      <span className="text-slate-500 text-[10px] font-normal">#</span>
                      {nonce}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 relative">
                      Increments by 1 with each flip to prevent replay attacks.
                    </p>
                  </div>
                </div>

                <div className="relative p-3 sm:p-4 rounded-2xl space-y-1.5 sm:space-y-2 overflow-hidden group"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(2,6,23,0.68) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <h4 className="font-['Orbitron'] text-[11px] sm:text-xs font-bold tracking-wider relative inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    HOW RESULTS & PAYOUTS WORK
                  </h4>
                  <ul className="space-y-1 text-slate-300 text-[10px] sm:text-[11px] leading-relaxed list-disc list-inside relative mt-1">
                    <li><strong className="text-cyan-300">Round Duration:</strong> Exactly 5 seconds with live cryptographic validation.</li>
                    <li><strong className="text-cyan-300">Payout Multiplier:</strong> Fixed 1.98x of your bet amount (2% house fee / edge).</li>
                    <li><strong className="text-cyan-300">Formula:</strong> <code className="px-1.5 py-0.5 rounded-md bg-black/50 border border-white/10 text-cyan-300 text-[9px] sm:text-[10px]">HMAC_SHA256(server_seed, client_seed + nonce) % 100</code></li>
                    <li><strong className="text-cyan-300">Outcomes:</strong> <code className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] sm:text-[10px]">0 - 49 = HEADS (50%)</code>, <code className="px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[9px] sm:text-[10px]">50 - 99 = TAILS (50%)</code>.</li>
                    <li><strong className="text-cyan-300">Commission:</strong> 2% fee sent on-chain to treasury <code className="text-emerald-300">0x155A…5Af9</code>.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 sm:space-y-4 text-xs font-mono relative">
                <p className="text-slate-300 text-[11px] sm:text-xs relative">
                  Test and verify any round result independently by entering the server seed secret, your client seed, and the nonce:
                </p>

                <div className="space-y-2.5 sm:space-y-3 relative">
                  <div className="relative group">
                    <label className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">Server Seed Secret:</label>
                    <input
                      type="text"
                      value={testServerSeed}
                      onChange={(e) => setTestServerSeed(e.target.value)}
                      className="w-full p-2 sm:p-2.5 rounded-xl bg-black/55 border border-white/15 text-slate-200 font-mono text-[11px] sm:text-xs focus:border-purple-400 outline-none transition-all focus:shadow-[0_0_18px_rgba(112,0,255,0.25),inset_0_0_10px_rgba(112,0,255,0.1)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="relative group">
                      <label className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">Client Seed:</label>
                      <input
                        type="text"
                        value={testClientSeed}
                        onChange={(e) => setTestClientSeed(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-xl bg-black/55 border border-white/15 text-slate-200 font-mono text-[11px] sm:text-xs focus:border-purple-400 outline-none transition-all focus:shadow-[0_0_18px_rgba(112,0,255,0.25),inset_0_0_10px_rgba(112,0,255,0.1)]"
                      />
                    </div>
                    <div className="relative group">
                      <label className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">Nonce:</label>
                      <input
                        type="number"
                        value={testNonce}
                        onChange={(e) => setTestNonce(e.target.value)}
                        className="w-full p-2 sm:p-2.5 rounded-xl bg-black/55 border border-white/15 text-slate-200 font-mono text-[11px] sm:text-xs focus:border-purple-400 outline-none transition-all focus:shadow-[0_0_18px_rgba(112,0,255,0.25),inset_0_0_10px_rgba(112,0,255,0.1)]"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRunVerify}
                    className="relative w-full group py-2.5 sm:py-3 rounded-xl font-['Orbitron'] font-bold text-[11px] sm:text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 overflow-hidden border"
                    style={{
                      background: 'linear-gradient(135deg, #7000FF 0%, #581C87 50%, #4338CA 100%)',
                      border: '1px solid rgba(192,132,252,0.5)',
                      boxShadow: '0 0 25px rgba(112,0,255,0.5), 0 0 12px rgba(112,0,255,0.3), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 20px rgba(192,132,252,0.2)',
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="animate-premium-shimmer absolute inset-0" />
                    </div>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: 'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.22) 0%, transparent 55%)' }}
                    />
                    <span className="relative z-10">Run Cryptographic Verification</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                  </motion.button>

                  {verifierResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="relative p-3 sm:p-4 rounded-2xl space-y-2 overflow-hidden corner-brackets"
                      style={{
                        background: 'linear-gradient(180deg, rgba(8,47,73,0.5) 0%, rgba(2,6,23,0.75) 100%)',
                        border: '1px solid rgba(0,240,255,0.45)',
                        boxShadow: '0 0 30px rgba(0,240,255,0.25), inset 0 0 20px rgba(0,240,255,0.1)',
                      }}
                    >
                      <span className="cb-tl" />
                      <span className="cb-br" />
                      <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-cyan-400/15 blur-[50px] pointer-events-none" />
                      <div className="flex items-center justify-between text-xs relative">
                        <span className="text-slate-400">Outcome Number:</span>
                        <span className="font-bold text-white text-sm sm:text-base font-['Orbitron'] text-glow-cyan">
                          {verifierResult.outcomeNumber} <span className="text-slate-500 text-xs">/ 99</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs relative">
                        <span className="text-slate-400">Result Side:</span>
                        <span className={`font-['Orbitron'] font-bold text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border ${
                          verifierResult.resultSide === 'HEADS' 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_14px_rgba(0,240,255,0.35)]' 
                            : 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_14px_rgba(112,0,255,0.35)]'
                        }`}>
                          {verifierResult.resultSide}
                        </span>
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 pt-1.5 border-t border-white/10 break-all relative">
                        <span className="text-cyan-300 font-bold">Calculated Hash:</span> {verifierResult.hash}
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
