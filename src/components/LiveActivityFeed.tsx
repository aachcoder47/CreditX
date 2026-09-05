import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, History, ArrowUpRight, ExternalLink } from 'lucide-react';
import type { LivePVPItem, FlipResult } from '../types/game';
import { getExplorerTxLink } from '../utils/blockchain';

interface LiveActivityFeedProps {
  liveItems: LivePVPItem[];
  userHistory: FlipResult[];
  currency: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  liveItems,
  userHistory,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'MY_HISTORY'>('GLOBAL');

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="defi-card p-4 sm:p-6 specular-border">
        
        {/* Header Ribbon & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <h3 className="font-display font-bold text-base sm:text-lg text-white">
              Settlement Activity
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-ui bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              On-Chain Verified
            </span>
          </div>

          {/* Segmented Tab Pill */}
          <div className="segmented-control self-start sm:self-auto p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setActiveTab('GLOBAL')}
              className={`py-1.5 px-3 rounded-lg font-mono-ui text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'GLOBAL'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Network Bets ({liveItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('MY_HISTORY')}
              className={`py-1.5 px-3 rounded-lg font-mono-ui text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'MY_HISTORY'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3 h-3 text-amber-400" />
              <span>My Rounds ({userHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Stream List */}
        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
          {activeTab === 'GLOBAL' ? (
            liveItems.length === 0 ? (
              <div className="text-center py-10 sm:py-14 text-slate-500 font-mono-ui text-xs">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse mx-auto mb-2" />
                No global rounds recorded yet. Place a wager to trigger the live on-chain stream!
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {liveItems.map((item) => {
                  const txUrl = item.txHash ? getExplorerTxLink(item.chainId || null, item.txHash) : null;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono-ui text-xs"
                    >
                      {/* Player & Side info */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            item.side === 'HEADS'
                              ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300'
                              : 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
                          }`}
                        >
                          {item.side}
                        </span>
                        <span className="text-slate-300 font-medium">
                          {item.player}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {item.timeAgo}
                        </span>
                      </div>

                      {/* Financial return & explorer link */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        <span className="text-slate-400">
                          Stake: <strong className="text-white">{item.amount} {item.currency || currency}</strong>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            item.isWin
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                              : 'bg-slate-800/60 text-slate-400 border border-white/5'
                          }`}
                        >
                          {item.isWin ? `+${item.payout} ${item.currency || currency}` : 'LOST'}
                        </span>

                        {txUrl && (
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="View on Explorer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )
          ) : (
            userHistory.length === 0 ? (
              <div className="text-center py-10 sm:py-14 text-slate-500 font-mono-ui text-xs">
                <History className="w-4 h-4 text-amber-400 mx-auto mb-2" />
                You haven't played any rounds yet this session.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {userHistory.map((item) => {
                  const txUrl = item.txHash ? getExplorerTxLink(item.chainId || null, item.txHash) : null;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono-ui text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            item.selectedSide === 'HEADS'
                              ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300'
                              : 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
                          }`}
                        >
                          {item.selectedSide}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Result: <strong className="text-white">{item.winningSide}</strong>
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          Nonce #{item.nonce}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        <span className="text-slate-400">
                          Stake: <strong className="text-white">{item.betAmount} {item.currency || currency}</strong>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            item.isWin
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                              : 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          {item.isWin ? `+${item.payout} ${item.currency || currency}` : 'DEFEAT'}
                        </span>

                        {txUrl && (
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Verify on Chain"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )
          )}
        </div>
      </div>
    </div>
  );
};
