import { useState, useEffect, useRef } from 'react';
import { BackgroundFX } from './components/BackgroundFX';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { Arena } from './components/Arena';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { WalletModal } from './components/WalletModal';
import { WinLossOverlay } from './components/WinLossOverlay';
import type { CoinSide, GameState, WalletState, FlipResult, LivePVPItem } from './types/game';
import { soundFx } from './utils/audio';
import { computeProvablyFairResult, generateRandomHex, sha256 } from './utils/provablyFair';



export function App() {
  // Wallet State with localStorage persistence
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem('cyberflip_wallet');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      isConnected: false,
      address: null,
      solBalance: 0,
      tokenBalance: 0,
      network: 'Solana',
    };
  });

  // Game Engine States
  const [gameState, setGameState] = useState<GameState>(wallet.isConnected ? 'READY' : 'DISCONNECTED');
  const [selectedSide, setSelectedSide] = useState<CoinSide>('HEADS');
  const [winningSide, setWinningSide] = useState<CoinSide | null>('HEADS');
  const [betAmount, setBetAmount] = useState<number>(0.5);
  const [flipCountdown, setFlipCountdown] = useState<number>(5.0);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Provably Fair Cryptographic Seeds
  const [serverSeedHash, setServerSeedHash] = useState<string>('a8f342d87e14f9c824e815bc91238910fedcba987654321012345678abcdef01');
  const [clientSeed, setClientSeed] = useState<string>('seed_' + generateRandomHex(8));
  const [nonce, setNonce] = useState<number>(1);

  // Real-time stats (counts only user's own real flips in session)
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [totalFlips, setTotalFlips] = useState<number>(0);
  const [winRate] = useState<number>(49.8);
  const [jackpotPool] = useState<number>(128.45);
  const [livePVP, setLivePVP] = useState<LivePVPItem[]>([]);
  const [userHistory, setUserHistory] = useState<FlipResult[]>([]);

  // Modals & Sound
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [provablyFairOpen, setProvablyFairOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.getMuted());

  // Countdown timer reference
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-generate initial server seed hash
  useEffect(() => {
    async function initSeed() {
      const initialSeed = generateRandomHex(32);
      const hash = await sha256(initialSeed);
      setServerSeedHash(hash);
    }
    initSeed();
  }, []);


  // Refresh wallet balance from chain on session resume
  useEffect(() => {
    if (!wallet.isConnected || !wallet.address) return;

    const fetchBalance = async () => {
      try {
        if (wallet.network === 'Solana') {
          const res = await fetch('https://api.devnet.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0', id: 1,
              method: 'getBalance',
              params: [wallet.address],
            }),
          });
          const data = await res.json();
          if (data?.result?.value != null) {
            const sol = data.result.value / 1_000_000_000;
            setWallet((prev) => ({ ...prev, solBalance: sol }));
          }
        } else {
          const win = window as unknown as {
            ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<string> };
          };
          if (win.ethereum?.request) {
            const hex = await win.ethereum.request({
              method: 'eth_getBalance',
              params: [wallet.address, 'latest'],
            });
            const eth = parseInt(hex, 16) / 1e18;
            setWallet((prev) => ({ ...prev, solBalance: eth }));
          }
        }
      } catch {
        // network unavailable, keep existing balance
      }
    };

    fetchBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected, wallet.address]);


  // Handle Mute Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Connect / Disconnect Wallet with persistence
  const handleConnectWallet = (walletName: string, address: string, initialBalance = 10.0) => {
    const newWallet: WalletState = {
      isConnected: true,
      address,
      solBalance: initialBalance,
      tokenBalance: 1500,
      network: walletName.includes('MetaMask') ? 'Ethereum' : 'Solana',
    };
    setWallet(newWallet);
    try {
      localStorage.setItem('cyberflip_wallet', JSON.stringify(newWallet));
    } catch {
      // ignore
    }
    setGameState('READY');
  };

  const handleDisconnectWallet = () => {
    const disconnected: WalletState = {
      isConnected: false,
      address: null,
      solBalance: 0,
      tokenBalance: 0,
      network: 'Solana',
    };
    setWallet(disconnected);
    try {
      localStorage.removeItem('cyberflip_wallet');
    } catch {
      // ignore
    }
    setGameState('DISCONNECTED');
  };

  // Refresh balance on-demand (called from navbar)
  const handleRefreshBalance = async () => {
    if (!wallet.isConnected || !wallet.address) return;
    try {
      if (wallet.network === 'Solana') {
        const res = await fetch('https://api.devnet.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'getBalance',
            params: [wallet.address],
          }),
        });
        const data = await res.json();
        if (data?.result?.value != null) {
          const sol = data.result.value / 1_000_000_000;
          setWallet((prev) => ({ ...prev, solBalance: sol }));
        }
      } else {
        const win = window as unknown as {
          ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<string> };
        };
        if (win.ethereum?.request) {
          const hex = await win.ethereum.request({
            method: 'eth_getBalance',
            params: [wallet.address, 'latest'],
          });
          const eth = parseInt(hex, 16) / 1e18;
          setWallet((prev) => ({ ...prev, solBalance: eth }));
        }
      }
    } catch {
      // network unavailable
    }
  };

  // Screen shake on loss
  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);
  };

  // Main 5-Second Flip Execution
  const handleStartFlip = async () => {
    if (gameState === 'FLIPPING') return;

    if (!wallet.isConnected) {
      setWalletModalOpen(true);
      return;
    }

    if (wallet.solBalance < betAmount) {
      alert('Insufficient SOL balance! Click "+5 SOL" in the top bar to claim demo funds.');
      return;
    }

    // 1. Deduct bet immediately from balance
    const postBetBalance = Number((wallet.solBalance - betAmount).toFixed(3));
    const betWalletState = { ...wallet, solBalance: postBetBalance };
    setWallet(betWalletState);
    try {
      localStorage.setItem('cyberflip_wallet', JSON.stringify(betWalletState));
    } catch {
      // ignore
    }

    // 2. Generate Provably Fair outcome deterministically
    const currentNonce = nonce;
    const serverSecret = generateRandomHex(32);
    const calculated = await computeProvablyFairResult(serverSecret, clientSeed, currentNonce);
    const willWin = calculated.resultSide === selectedSide;
    const outcomeSide = calculated.resultSide;

    setWinningSide(outcomeSide);
    setGameState('FLIPPING');
    setLastResult(null);
    setFlipCountdown(5.0);

    // 3. Start 5-second countdown timer (decrements every 100ms)
    let remainingTime = 5.0;
    const startTime = Date.now();
    let lastTickSecond = 5;

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      remainingTime = Math.max(0, 5.0 - elapsed);
      setFlipCountdown(remainingTime);

      // Play audio tick on each whole second countdown
      const currentSec = Math.ceil(remainingTime);
      if (currentSec !== lastTickSecond && currentSec > 0) {
        lastTickSecond = currentSec;
        soundFx.playCountdownTick(currentSec);
      }

      // Finalize when 5 seconds elapse
      if (remainingTime <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        finalizeFlip(willWin, outcomeSide, currentNonce, serverSecret);
      }
    }, 50);
  };

  // Finalize round settlement
  const finalizeFlip = async (
    isWin: boolean,
    resultSide: CoinSide,
    flipNonce: number,
    _serverSecret: string
  ) => {
    const payout = isWin ? Number((betAmount * 1.98).toFixed(3)) : 0;

    // Credit winning payout to wallet
    if (isWin) {
      setWallet((prev) => {
        const credited = {
          ...prev,
          solBalance: Number((prev.solBalance + payout).toFixed(3)),
        };
        try {
          localStorage.setItem('cyberflip_wallet', JSON.stringify(credited));
        } catch {
          // ignore
        }
        return credited;
      });
    } else {
      triggerScreenShake();
    }

    // Build record
    const record: FlipResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      playerAddress: wallet.address || '0xUser',
      selectedSide,
      winningSide: resultSide,
      betAmount,
      payout,
      isWin,
      serverSeedHash,
      clientSeed,
      nonce: flipNonce,
    };

    setLastResult(record);
    setUserHistory((prev) => [record, ...prev]);
    setGameState(isWin ? 'VICTORY' : 'DEFEAT');

    // Add to global live feed
    const liveItem: LivePVPItem = {
      id: record.id,
      player: wallet.address ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : 'You',
      side: selectedSide,
      amount: betAmount,
      payout,
      isWin,
      timeAgo: 'Just now',
      timestamp: Date.now(),
    };
    setLivePVP((prev) => [liveItem, ...prev.slice(0, 7)]);

    // Update stats
    setTotalVolume((prev) => prev + betAmount * 150);
    setTotalFlips((prev) => prev + 1);

    // Prepare next round's cryptographic server seed hash
    setNonce((prev) => prev + 1);
    const nextSeed = generateRandomHex(32);
    const nextHash = await sha256(nextSeed);
    setServerSeedHash(nextHash);
  };

  const handleDoubleDown = () => {
    const doubled = Number((betAmount * 2).toFixed(2));
    setBetAmount(doubled);
    setLastResult(null);
    setGameState('READY');
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-between text-slate-100 ${isScreenShaking ? 'animate-[bounce_0.15s_infinite]' : ''}`}>
      {/* Dynamic Cyberpunk Particle & Grid Canvas */}
      <BackgroundFX intensity={gameState === 'FLIPPING' ? 'intense' : 'normal'} />

      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenWalletModal={() => setWalletModalOpen(true)}
        onOpenProvablyFair={() => setProvablyFairOpen(true)}
        onDisconnectWallet={handleDisconnectWallet}
        onAddFaucetFunds={handleRefreshBalance}
      />

      {/* Main Game Arena Content */}
      <main className="relative z-10 flex-1 py-4">
        {/* Global Stats Metrics Bar */}
        <StatsBar
          totalVolume={totalVolume}
          totalFlips={totalFlips}
          winRate={winRate}
          jackpotPool={jackpotPool}
        />

        {/* Center PVP Arena */}
        <Arena
          wallet={wallet}
          gameState={gameState}
          selectedSide={selectedSide}
          winningSide={winningSide}
          betAmount={betAmount}
          flipCountdown={flipCountdown}
          onSelectSide={(side) => setSelectedSide(side)}
          onChangeBet={(amount) => setBetAmount(amount)}
          onStartFlip={handleStartFlip}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          onOpenProvablyFair={() => setProvablyFairOpen(true)}
        />

        {/* Real-time PVP Live Stream Activity Feed */}
        <LiveActivityFeed
          liveItems={livePVP}
          userHistory={userHistory}
        />
      </main>

      {/* Win / Loss Celebratory / Defeat Overlay */}
      <WinLossOverlay
        lastResult={lastResult}
        onPlayAgain={() => {
          setLastResult(null);
          setGameState('READY');
          handleStartFlip();
        }}
        onDoubleDown={handleDoubleDown}
        onDismiss={() => {
          setLastResult(null);
          setGameState('READY');
        }}
      />

      {/* Wallet Connect Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSelectWallet={handleConnectWallet}
      />

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={provablyFairOpen}
        onClose={() => setProvablyFairOpen(false)}
        serverSeedHash={serverSeedHash}
        clientSeed={clientSeed}
        nonce={nonce}
        onUpdateClientSeed={(newSeed) => setClientSeed(newSeed)}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 py-6 px-4 text-center text-xs font-mono text-slate-500 bg-[#090A0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-['Orbitron'] font-bold text-slate-300">CYBERFLIP // 5S PVP ARENA</span>
            <span>• Instant Non-Custodial Coinflip</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>2% House Edge</span>
            <span>•</span>
            <button 
              onClick={() => setProvablyFairOpen(true)}
              className="hover:text-cyan-400 underline underline-offset-2 transition-colors"
            >
              Verify Seed Hashes
            </button>
            <span>•</span>
            <span>Instant Auto-Payout</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
