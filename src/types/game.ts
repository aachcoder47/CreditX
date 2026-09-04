export type CoinSide = 'HEADS' | 'TAILS';

export type GameState = 
  | 'DISCONNECTED'
  | 'READY'
  | 'AWAITING_TX'
  | 'FLIPPING'
  | 'VICTORY'
  | 'DEFEAT';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  solBalance: number; // Native currency balance (ETH or SOL)
  tokenBalance: number;
  network: 'Solana' | 'Ethereum' | 'Base';
  chainId?: string | null;
  currency: string; // 'ETH', 'SepoliaETH', 'SOL', etc.
}

export interface FlipResult {
  id: string;
  timestamp: number;
  playerAddress: string;
  selectedSide: CoinSide;
  winningSide: CoinSide;
  betAmount: number;
  commissionAmount: number;
  commissionAddress: string;
  txHash?: string;
  chainId?: string | null;
  currency: string;
  payout: number;
  isWin: boolean;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export interface ProvablyFairRecord {
  serverSeedHash: string;
  serverSeedSecret?: string;
  clientSeed: string;
  nonce: number;
  outcomeNumber: number; // 0-99
  resultSide: CoinSide;
}

export interface LivePVPItem {
  id: string;
  player: string;
  side: CoinSide;
  amount: number;
  payout: number;
  currency: string;
  txHash?: string;
  chainId?: string | null;
  isWin: boolean;
  timeAgo: string;
  timestamp: number;
}
