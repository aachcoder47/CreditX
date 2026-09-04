import type { CoinSide } from '../types/game';

// Standard SHA-256 using Browser Web Crypto API
export async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random hex string of specified length
export function generateRandomHex(length: number = 32): string {
  const array = new Uint8Array(length / 2);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Deterministic Provably Fair outcome generator:
// 1. Combine server_seed + client_seed + nonce
// 2. Hash combined string with SHA-256
// 3. Take first 8 characters (4 bytes) of the hash as hexadecimal integer
// 4. Modulo 100 to get a number 0 to 99
// 5. If outcome < 50 => HEADS (50%), else => TAILS (50%)
export async function computeProvablyFairResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<{ outcomeNumber: number; resultSide: CoinSide; hash: string }> {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = await sha256(combined);
  const hexSubstring = hash.slice(0, 8);
  const intVal = parseInt(hexSubstring, 16);
  const outcomeNumber = intVal % 100;
  const resultSide: CoinSide = outcomeNumber < 50 ? 'HEADS' : 'TAILS';

  return { outcomeNumber, resultSide, hash };
}
