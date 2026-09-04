import { useState } from 'react';
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
  ExternalLink
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

  // Interactive Verifier State
  const [testServerSeed, setTestServerSeed] = useState('demo_server_secret_key_cyberflip_2026');
  const [testClientSeed, setTestClientSeed] = useState(clientSeed);
  const [testNonce, setTestNonce] = useState(nonce.toString());
  const [verifierResult, setVerifierResult] = useState<{
    outcomeNumber: number;
    resultSide: string;
    hash: string;
  } | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-7 border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.15)] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white tracking-wider">
                PROVABLY FAIR SYSTEM
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                100% Cryptographic Transparency & Commission Routing
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setTab('OVERVIEW')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              tab === 'OVERVIEW'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ACTIVE SEEDS & RULES
          </button>
          <button
            onClick={() => setTab('VERIFIER')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              tab === 'VERIFIER'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(112,0,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            INTERACTIVE VERIFIER
          </button>
        </div>

        {tab === 'OVERVIEW' ? (
          <div className="mt-5 space-y-4 text-xs font-mono">
            {/* Commission Treasury Section */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  VERIFIED COMMISSION TREASURY
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  2.0% HOUSE EDGE
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-200 break-all flex items-center justify-between gap-2 select-all">
                <span>{COMMISSION_TREASURY_ADDRESS}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleCopyTreasury}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-400"
                    title="Copy Treasury Address"
                  >
                    {copiedTreasury ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={treasuryExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-400"
                    title="View on Block Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All rounds take an exact 2% commission fee sent directly on-chain to this designated house treasury wallet on every flip.
              </p>
            </div>

            {/* Server Seed Hash */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  CURRENT ROUND SERVER SEED (SHA-256 HASH)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  COMMITTED PRE-FLIP
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-cyan-300 break-all flex items-center justify-between gap-2">
                <span>{serverSeedHash}</span>
                <button
                  onClick={handleCopyHash}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-400 shrink-0"
                  title="Copy Hash"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The server generates a secret seed and reveals its SHA-256 hash before your bet. The game outcome cannot be modified once committed.
              </p>
            </div>

            {/* Client Seed & Nonce */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    YOUR CLIENT SEED
                  </span>
                  <button
                    onClick={handleRandomizeClientSeed}
                    className="text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Randomize
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-purple-300 break-all">
                  {clientSeed}
                </div>
                <p className="text-[10px] text-slate-400">
                  Provided by your browser to ensure you co-create the randomness.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-300">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  NONCE COUNTER
                </span>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-base font-bold text-amber-300">
                  #{nonce}
                </div>
                <p className="text-[10px] text-slate-400">
                  Increments by 1 with each flip to prevent replay attacks.
                </p>
              </div>
            </div>

            {/* Game Rules & Formula */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
              <h4 className="font-['Orbitron'] text-xs font-bold text-white tracking-wider">
                HOW RESULTS & PAYOUTS WORK
              </h4>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed list-disc list-inside">
                <li><strong className="text-cyan-300">Round Duration:</strong> Exactly 5 seconds with live cryptographic validation.</li>
                <li><strong className="text-cyan-300">Payout Multiplier:</strong> Fixed 1.98x of your bet amount (2% house fee / edge).</li>
                <li><strong className="text-cyan-300">Mathematical Formula:</strong> <code>HMAC_SHA256(server_seed, client_seed + nonce) % 100</code></li>
                <li><strong className="text-cyan-300">Outcome Mapping:</strong> <code>0 - 49 = HEADS (50%)</code>, <code>50 - 99 = TAILS (50%)</code>.</li>
                <li><strong className="text-cyan-300">On-Chain Commission:</strong> 2% commission sent directly to treasury <code>0x155A...5Af9</code>.</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Interactive Verifier */
          <div className="mt-5 space-y-4 text-xs font-mono">
            <p className="text-slate-300 text-xs">
              Test and verify any round result independently by entering the server seed secret, your client seed, and the nonce:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Server Seed Secret:</label>
                <input
                  type="text"
                  value={testServerSeed}
                  onChange={(e) => setTestServerSeed(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-slate-200 font-mono text-xs focus:border-purple-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Client Seed:</label>
                  <input
                    type="text"
                    value={testClientSeed}
                    onChange={(e) => setTestClientSeed(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-slate-200 font-mono text-xs focus:border-purple-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nonce:</label>
                  <input
                    type="number"
                    value={testNonce}
                    onChange={(e) => setTestNonce(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-slate-200 font-mono text-xs focus:border-purple-400 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleRunVerify}
                className="w-full py-3 rounded-xl font-['Orbitron'] font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(112,0,255,0.4)] flex items-center justify-center gap-2"
              >
                <span>Run Cryptographic Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {verifierResult && (
                <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/40 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Outcome Number:</span>
                    <span className="font-bold text-white text-base">
                      {verifierResult.outcomeNumber} / 99
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Result Side:</span>
                    <span className={`font-['Orbitron'] font-bold text-sm px-2.5 py-1 rounded-lg border ${
                      verifierResult.resultSide === 'HEADS' 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' 
                        : 'bg-purple-500/20 text-purple-300 border-purple-400'
                    }`}>
                      {verifierResult.resultSide}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 break-all">
                    Calculated Hash: {verifierResult.hash}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
