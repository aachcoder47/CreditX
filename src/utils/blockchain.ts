// Blockchain integration & Commission Treasury configuration

export const COMMISSION_TREASURY_ADDRESS = '0x155A92e352001843C0cEB69cF86d2D6362eB5Af9';
export const HOUSE_COMMISSION_PERCENT = 2.0; // 2% House Fee

export interface ChainConfig {
  name: string;
  symbol: string;
  explorerUrl: string;
}

export const KNOWN_CHAINS: Record<string, ChainConfig> = {
  '0x1': {
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
  },
  '0xaa36a7': {
    name: 'Sepolia Testnet',
    symbol: 'SepoliaETH',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  '0x89': {
    name: 'Polygon',
    symbol: 'POL',
    explorerUrl: 'https://polygonscan.com',
  },
  '0xa4b1': {
    name: 'Arbitrum One',
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
  },
  '0x2105': {
    name: 'Base',
    symbol: 'ETH',
    explorerUrl: 'https://basescan.org',
  },
  '0x38': {
    name: 'BNB Chain',
    symbol: 'BNB',
    explorerUrl: 'https://bscscan.com',
  },
};

export function getChainInfo(chainId: string | null): ChainConfig {
  if (!chainId) {
    return {
      name: 'Ethereum / EVM',
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
    };
  }
  return (
    KNOWN_CHAINS[chainId.toLowerCase()] || {
      name: `Chain ${chainId}`,
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
    }
  );
}

export function getExplorerTxLink(chainId: string | null, txHash: string): string {
  if (!txHash) return '#';
  const chain = getChainInfo(chainId);
  return `${chain.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressLink(chainId: string | null, address: string): string {
  if (!address) return '#';
  const chain = getChainInfo(chainId);
  return `${chain.explorerUrl}/address/${address}`;
}

/**
 * Calculates house commission (2% of wager)
 * Minimum 0.00001 to prevent zero-value transfers on small test wagers
 */
export function calculateCommission(betAmount: number): number {
  const comm = betAmount * (HOUSE_COMMISSION_PERCENT / 100);
  return Number(Math.max(0.00001, comm).toFixed(6));
}

/**
 * Send real commission transaction on EVM blockchain via MetaMask / Injected Provider
 */
export async function sendCommissionTransaction(
  senderAddress: string,
  commissionEth: number
): Promise<string> {
  const win = window as unknown as {
    ethereum?: {
      request: (args: { method: string; params: unknown[] }) => Promise<string>;
    };
  };

  if (!win.ethereum?.request) {
    throw new Error('MetaMask or Web3 wallet is not available');
  }

  // Convert commission value in ETH to Hexadecimal Wei string
  const weiAmount = BigInt(Math.round(commissionEth * 1e18));
  const hexWei = '0x' + weiAmount.toString(16);

  const txHash = await win.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: senderAddress,
        to: COMMISSION_TREASURY_ADDRESS,
        value: hexWei,
      },
    ],
  });

  return txHash;
}
