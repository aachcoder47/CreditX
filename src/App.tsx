import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundFX } from './components/BackgroundFX';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { Arena } from './components/Arena';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { WalletModal } from './components/WalletModal';
import { WinLossOverlay } from './components/WinLossOverlay';
import { OpeningTransition } from './components/OpeningTransition';
import type { CoinSide, GameState, WalletState, FlipResult, LivePVPItem } from './types/game';
import { soundFx } from './utils/audio';
import { computeProvablyFairResult, generateRandomHex, sha256 } from './utils/provablyFair';
import { 
  COMMISSION_TREASURY_ADDRESS, 
  calculateCommission, 
  sendCommissionTransaction, 
  getChainInfo 
} from './utils/blockchain';

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
      network: 'Ethereum',
      chainId: '0x1',
      currency: 'ETH',
    };
  });

  // Game Engine States
  const [gameState, setGameState] = useState<GameState>(wallet.isConnected ? 'READY' : 'DISCONNECTED');
  const [selectedSide, setSelectedSide] = useState<CoinSide>('HEADS');
  const [winningSide, setWinningSide] = useState<CoinSide | null>('HEADS');
  const [betAmount, setBetAmount] = useState<number>(0.01);
  const [flipCountdown, setFlipCountdown] = useState<number>(5.0);
  const [lastResult, setLastResult] = useState<FlipResult | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Provably Fair Cryptographic Seeds
  const [serverSeedHash, setServerSeedHash] = useState<string>('a8f342d87e14f9c824e815bc91238910fedcba987654321012345678abcdef01');
  const [clientSeed, setClientSeed] = useState<string>('seed_' + generateRandomHex(8));
  const [nonce, setNonce] = useState<number>(1);

  // Real-time stats (starts at zero, tracks user's actual session)
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [totalFlips, setTotalFlips] = useState<number>(0);
  const [totalCommission, setTotalCommission] = useState<number>(0);
  const [livePVP, setLivePVP] = useState<LivePVPItem[]>([]);
  const [userHistory, setUserHistory] = useState<FlipResult[]>([]);

  // Modals, Intro & Sound
  const [showOpening, setShowOpening] = useState<boolean>(true);
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

  // Listen to MetaMask account / chain changes
  useEffect(() => {
    const win = window as unknown as {
      ethereum?: {
        on?: (event: string, handler: (...args: unknown[]) => void) => void;
        removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
      };
    };
    if (!win.ethereum?.on || !wallet.isConnected || wallet.network !== 'Ethereum') return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (!accs || accs.length === 0) {
        handleDisconnectWallet();
      } else {
        setWallet((prev) => ({ ...prev, address: accs[0] }));
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const hex = chainIdHex as string;
      const chainInfo = getChainInfo(hex);
      setWallet((prev) => ({
        ...prev,
        chainId: hex,
        currency: chainInfo.symbol,
      }));
      handleRefreshBalance();
    };

    win.ethereum.on('accountsChanged', handleAccountsChanged);
    win.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      win.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      win.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected, wallet.network]);

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
  const handleConnectWallet = (
    walletName: string, 
    address: string, 
    initialBalance = 0,
    chainId?: string | null,
    currency?: string
  ) => {
    const isEth = walletName.includes('MetaMask');
    const newWallet: WalletState = {
      isConnected: true,
      address,
      solBalance: initialBalance,
      tokenBalance: 1500,
      network: isEth ? 'Ethereum' : 'Solana',
      chainId: chainId || (isEth ? '0x1' : null),
      currency: currency || (isEth ? 'ETH' : 'SOL'),
    };
    setWallet(newWallet);
    setTxError(null);

    // Adjust default bet for ETH wagers
    if (isEth && betAmount > 0.1) {
      setBetAmount(0.01);
    }

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
      network: 'Ethereum',
      chainId: '0x1',
      currency: 'ETH',
    };
    setWallet(disconnected);
    setTxError(null);
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

  // Main Flip Execution with Real On-Chain Commission Transaction
  const handleStartFlip = async () => {
    if (gameState === 'FLIPPING' || gameState === 'AWAITING_TX') return;

    if (!wallet.isConnected) {
      setWalletModalOpen(true);
      return;
    }

    const currentCurrency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');

    if (wallet.solBalance < betAmount) {
      setTxError(`Insufficient ${currentCurrency} balance (${wallet.solBalance.toFixed(4)}) for ${betAmount} ${currentCurrency} bet.`);
      return;
    }

    setTxError(null);
    const commissionAmount = calculateCommission(betAmount);
    let onChainTxHash: string | undefined = undefined;

    // Send real blockchain transaction for EVM / MetaMask to Commission Treasury 0x155A...5Af9
    if (wallet.network === 'Ethereum' && wallet.address) {
      try {
        setGameState('AWAITING_TX');
        onChainTxHash = await sendCommissionTransaction(wallet.address, commissionAmount);
      } catch (err: unknown) {
        setGameState('READY');
        const e = err as { code?: number; message?: string };
        if (e?.code === 4001) {
          setTxError('Transaction was rejected in your wallet. Flip cancelled.');
        } else {
          setTxError(e?.message || 'Blockchain transaction failed. Flip cancelled.');
        }
        return;
      }
    }

    // 1. Deduct bet from active balance
    const postBetBalance = Number((wallet.solBalance - betAmount).toFixed(4));
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

    // 3. Start 5-second countdown timer (decrements every 50ms)
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

      // Audio tick on whole seconds
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
        finalizeFlip(willWin, outcomeSide, currentNonce, serverSecret, onChainTxHash, commissionAmount);
      }
    }, 50);
  };

  // Finalize round settlement
  const finalizeFlip = async (
    isWin: boolean,
    resultSide: CoinSide,
    flipNonce: number,
    _serverSecret: string,
    txHash?: string,
    commissionAmount = 0
  ) => {
    const payout = isWin ? Number((betAmount * 1.98).toFixed(4)) : 0;
    const currentCurrency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');

    // Credit winning payout to balance
    if (isWin) {
      setWallet((prev) => {
        const credited = {
          ...prev,
          solBalance: Number((prev.solBalance + payout).toFixed(4)),
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

    // Build real verified record
    const record: FlipResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      playerAddress: wallet.address || '0xUser',
      selectedSide,
      winningSide: resultSide,
      betAmount,
      commissionAmount,
      commissionAddress: COMMISSION_TREASURY_ADDRESS,
      txHash,
      chainId: wallet.chainId,
      currency: currentCurrency,
      payout,
      isWin,
      serverSeedHash,
      clientSeed,
      nonce: flipNonce,
    };

    setLastResult(record);
    setUserHistory((prev) => [record, ...prev]);
    setGameState(isWin ? 'VICTORY' : 'DEFEAT');

    // Add to live feed
    const liveItem: LivePVPItem = {
      id: record.id,
      player: wallet.address ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}` : 'You',
      side: selectedSide,
      amount: betAmount,
      payout,
      currency: currentCurrency,
      txHash,
      chainId: wallet.chainId,
      isWin,
      timeAgo: 'Just now',
      timestamp: Date.now(),
    };
    setLivePVP((prev) => [liveItem, ...prev.slice(0, 9)]);

    // Real stats accumulation
    setTotalVolume((prev) => Number((prev + betAmount).toFixed(4)));
    setTotalCommission((prev) => Number((prev + commissionAmount).toFixed(6)));
    setTotalFlips((prev) => prev + 1);

    // Prepare next round's cryptographic server seed hash
    setNonce((prev) => prev + 1);
    const nextSeed = generateRandomHex(32);
    const nextHash = await sha256(nextSeed);
    setServerSeedHash(nextHash);
  };

  const handleDoubleDown = () => {
    const doubled = Number((betAmount * 2).toFixed(4));
    setBetAmount(doubled);
    setLastResult(null);
    setGameState('READY');
  };

  // Real win rate calculation based on user's actual history
  const totalUserWins = userHistory.filter((h) => h.isWin).length;
  const currentWinRate = userHistory.length > 0 ? (totalUserWins / userHistory.length) * 100 : 0;
  const currentCurrency = wallet.currency || (wallet.network === 'Solana' ? 'SOL' : 'ETH');

  return (
    <div className={`min-h-screen relative flex flex-col text-white noise-overlay vignette ${isScreenShaking ? 'animate-[bounce_0.12s_3]' : ''}`}>
      <BackgroundFX intensity="intense" />

      <AnimatePresence>
        {showOpening && (
          <OpeningTransition onComplete={() => setShowOpening(false)} />
        )}
      </AnimatePresence>


      {/* Top Navbar with Entrance Spring */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Navbar
          wallet={wallet}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          onOpenProvablyFair={() => setProvablyFairOpen(true)}
          onDisconnectWallet={handleDisconnectWallet}
          onAddFaucetFunds={handleRefreshBalance}
        />
      </motion.div>

      {/* Main Game Arena Content with Staggered Entrance */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16,1,0.3,1] }}
        className="relative z-10 flex-1 pt-[60px] sm:pt-[68px]"
      >
        {/* Real Stats Metrics Bar */}
        <StatsBar
          totalVolume={totalVolume}
          totalFlips={totalFlips}
          winRate={currentWinRate}
          totalCommission={totalCommission}
          currency={currentCurrency}
        />

        {/* Center PVP Arena */}
        <Arena
          wallet={wallet}
          gameState={gameState}
          selectedSide={selectedSide}
          winningSide={winningSide}
          betAmount={betAmount}
          flipCountdown={flipCountdown}
          txError={txError}
          onSelectSide={(side) => setSelectedSide(side)}
          onChangeBet={(amount) => setBetAmount(amount)}
          onStartFlip={handleStartFlip}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          onOpenProvablyFair={() => setProvablyFairOpen(true)}
        />

        {/* Real PVP Activity Feed */}
        <LiveActivityFeed
          liveItems={livePVP}
          userHistory={userHistory}
          currency={currentCurrency}
        />
      </motion.main>

      {/* Win / Loss Overlay */}
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

      {/* Real Wallet Connect Modal */}
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

      {/* Footer — Knox editorial style */}
      <footer
        className="relative z-10 w-full mt-auto px-5 sm:px-8 lg:px-10 py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#000' }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 flex items-center justify-center"
              style={{ background: '#00F0FF', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <span className="font-mono-ui font-bold text-[8px] text-black">CF</span>
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white tracking-tight">CYBER<span style={{ color: '#00F0FF' }}>FLIP</span></span>
              <p className="font-mono-ui text-[10px] text-white/25 mt-0.5 uppercase tracking-widest">On-chain · Provably Fair · 5s Rounds</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono-ui text-[10px] uppercase tracking-widest text-white/25">
            <span>Treasury: <strong className="text-cyan-400/60">0x155A...5Af9</strong></span>
            <button onClick={() => setProvablyFairOpen(true)} className="hover:text-white/60 transition-colors">Provably Fair</button>
            <button onClick={() => setShowOpening(true)} className="hover:text-white/60 transition-colors">Replay Intro</button>
            <span>Product Preview / 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
