import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, History, ArrowUpRight, ArrowDownRight, Zap, Flame, ExternalLink } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10">
        {/* Header with Live Status & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white tracking-wider">
              ON-CHAIN ACTIVITY
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
              VERIFIED
            </span>
          </div>

          {/* Feed Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setActiveTab('GLOBAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'GLOBAL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE FEED ({liveItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('MY_HISTORY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'MY_HISTORY'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(112,0,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>MY ROUNDS ({userHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Live List Stream */}
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {activeTab === 'GLOBAL' ? (
            liveItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-mono text-xs">
                No rounds played yet in this session. Connect your wallet and flip to see live activity!
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {liveItems.map((item) => {
                  const txUrl = item.txHash ? getExplorerTxLink(item.chainId || null, item.txHash) : null;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs font-mono ${
                        item.isWin
                          ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                          : 'bg-rose-950/15 border-rose-500/20 hover:border-rose-500/40'
                      }`}
                    >
                      {/* Left: Player & Side */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border font-bold ${
                            item.side === 'HEADS'
                              ? 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300'
                              : 'bg-purple-950/80 border-purple-400/50 text-purple-300'
                          }`}
                        >
                          {item.side === 'HEADS' ? (
                            <Zap className="w-4 h-4" />
                          ) : (
                            <Flame className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">
                              {item.player}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              flipped <span className={item.side === 'HEADS' ? 'text-cyan-400' : 'text-purple-400'}>{item.side}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{item.timeAgo}</span>
                            {txUrl && (
                              <a
                                href={txUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 underline"
                              >
                                <span>Tx</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Outcome & Amount */}
                      <div className="text-right">
                        {item.isWin ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-bold font-['Orbitron'] text-xs sm:text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+{item.payout.toFixed(3)} {item.currency || currency}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-rose-400/80 font-mono text-xs sm:text-sm">
                            <ArrowDownRight className="w-4 h-4" />
                            <span>-{item.amount.toFixed(3)} {item.currency || currency}</span>
                          </div>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isWin ? 'text-emerald-400/80' : 'text-rose-400/70'}`}>
                          {item.isWin ? 'WON 1.98X' : 'LOST'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )
          ) : userHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-mono text-xs">
              No flips recorded yet in this session. Start flipping above to build your PVP record!
            </div>
          ) : (
            <div className="space-y-2">
              {userHistory.map((h) => {
                const txUrl = h.txHash ? getExplorerTxLink(h.chainId || null, h.txHash) : null;
                return (
                  <div
                    key={h.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                      h.isWin
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-rose-950/15 border-rose-500/25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          h.winningSide === 'HEADS'
                            ? 'bg-cyan-950/80 border border-cyan-400/50 text-cyan-300'
                            : 'bg-purple-950/80 border border-purple-400/50 text-purple-300'
                        }`}
                      >
                        {h.winningSide === 'HEADS' ? <Zap className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            Landed {h.winningSide}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Picked {h.selectedSide})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Nonce #{h.nonce}</span>
                          <span>•</span>
                          <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                          {txUrl && (
                            <>
                              <span>•</span>
                              <a
                                href={txUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 underline"
                              >
                                <span>Explorer</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-['Orbitron'] font-bold text-xs sm:text-sm ${h.isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {h.isWin ? `+${h.payout.toFixed(3)} ${h.currency || currency}` : `-${h.betAmount.toFixed(3)} ${h.currency || currency}`}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {h.isWin ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
