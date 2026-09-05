import { useState, useRef } from 'react';
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
  const feedRef = useRef<HTMLDivElement>(null);
  const [feedPos, setFeedPos] = useState({ mx: 50, my: 50 });

  const handleFeedMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!feedRef.current) return;
    const rect = feedRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    setFeedPos({ mx, my });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div
        ref={feedRef}
        onMouseMove={handleFeedMouseMove}
        className="relative rounded-3xl glass-panel p-4 sm:p-6 border border-white/10 shadow-2xl corner-brackets glow-card overflow-hidden"
        style={{
          ['--mx' as string]: `${feedPos.mx}%`,
          ['--my' as string]: `${feedPos.my}%`,
          background: `
            radial-gradient(circle at ${feedPos.mx}% ${feedPos.my}%, rgba(0,240,255,0.06) 0%, transparent 45%),
            linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(2,6,23,0.92) 100%)
          `,
        }}
      >
        <span className="cb-tl" />
        <span className="cb-br" />

        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-52 h-52 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-cyan-500 shadow-[0_0_8px_#22D3EE]" />
            </span>
            <h3 className="font-['Orbitron'] text-xs sm:text-sm md:text-base font-bold text-white tracking-wider">
              ON-CHAIN <span className="text-shimmer">ACTIVITY</span>
            </h3>
            <span className="tag-emerald text-[9px] sm:text-[10px]">
              VERIFIED
            </span>
          </div>

          <div className="relative flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 self-start sm:self-auto backdrop-blur-sm">
            <motion.div
              layoutId="feedActiveTab"
              className={`absolute top-1 bottom-1 rounded-lg shadow-lg pointer-events-none z-0 ${
                activeTab === 'GLOBAL'
                  ? 'left-1 bg-gradient-to-r from-cyan-500/25 to-cyan-500/10 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'right-1 bg-gradient-to-r from-purple-500/25 to-purple-500/10 border border-purple-500/40 shadow-[0_0_12px_rgba(112,0,255,0.3)]'
              }`}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('GLOBAL')}
              className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all ${
                activeTab === 'GLOBAL' ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${activeTab === 'GLOBAL' ? 'drop-shadow-[0_0_6px_#22D3EE]' : ''}`} />
              <span>LIVE ({liveItems.length})</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('MY_HISTORY')}
              className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all ${
                activeTab === 'MY_HISTORY' ? 'text-purple-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${activeTab === 'MY_HISTORY' ? 'drop-shadow-[0_0_6px_#A855F7]' : ''}`} />
              <span>MY ROUNDS ({userHistory.length})</span>
            </motion.button>
          </div>
        </div>

        <div className="relative mt-3 sm:mt-4 space-y-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {activeTab === 'GLOBAL' ? (
            liveItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-slate-400 font-mono text-xs relative">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  No rounds yet. Connect wallet and flip to see live on-chain activity!
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {liveItems.map((item) => {
                  const txUrl = item.txHash ? getExplorerTxLink(item.chainId || null, item.txHash) : null;
                  const accent = item.isWin ? '#10B981' : '#F43F5E';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -1, scale: 1.005 }}
                      className={`relative group p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-2 text-xs font-mono overflow-hidden ${
                        item.isWin
                          ? 'bg-emerald-950/25 border-emerald-500/30 hover:border-emerald-400/70'
                          : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-400/50'
                      }`}
                      style={{
                        boxShadow: item.isWin
                          ? '0 0 18px rgba(16,185,129,0.1)'
                          : '0 0 12px rgba(244,63,94,0.08)',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at 20% 50%, ${accent}12 0%, transparent 50%)`,
                          boxShadow: `inset 0 0 20px ${accent}0A`,
                        }}
                      />
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 transition-all duration-400 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${accent}AA, transparent)`,
                          boxShadow: `0 0 10px ${accent}88`,
                        }}
                      />

                      <div className="relative flex items-center gap-2 sm:gap-3 min-w-0">
                        <div
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 font-bold transition-all duration-300 group-hover:scale-105 ${
                            item.side === 'HEADS'
                              ? 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300'
                              : 'bg-purple-950/80 border-purple-400/50 text-purple-300'
                          }`}
                          style={{
                            boxShadow: item.side === 'HEADS'
                              ? '0 0 12px rgba(0,240,255,0.25), inset 0 0 10px rgba(0,240,255,0.1)'
                              : '0 0 12px rgba(112,0,255,0.25), inset 0 0 10px rgba(112,0,255,0.1)',
                          }}
                        >
                          {item.side === 'HEADS' ? (
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                              {item.player}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              flipped <span className={item.side === 'HEADS' ? 'text-cyan-400 font-bold' : 'text-purple-400 font-bold'}>{item.side}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-slate-500" />
                              {item.timeAgo}
                            </span>
                            {txUrl && (
                              <a
                                href={txUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 transition-colors group/tx"
                              >
                                <span className="group-hover/tx:underline">Tx</span>
                                <ExternalLink className="w-2.5 h-2.5 group-hover/tx:translate-x-0.5 group-hover/tx:-translate-y-0.5 transition-transform" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="relative text-right shrink-0">
                        {item.isWin ? (
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 text-emerald-400 font-bold font-['Orbitron'] text-xs sm:text-sm">
                            <ArrowUpRight className="w-3.5 h-3.5 drop-shadow-[0_0_6px_#10B981]" />
                            <span className="text-glow-emerald">+{item.payout.toFixed(3)} {item.currency || currency}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1 text-rose-400/90 font-mono text-xs sm:text-sm">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>-{item.amount.toFixed(3)} {item.currency || currency}</span>
                          </div>
                        )}
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${item.isWin ? 'text-emerald-400/90' : 'text-rose-400/80'}`}>
                          {item.isWin ? 'WON 1.98X' : 'LOST'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )
          ) : userHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-slate-400 font-mono text-xs relative">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10">
                <History className="w-3.5 h-3.5 text-purple-400" />
                No flips recorded yet. Start flipping above to build your PVP record!
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {userHistory.map((h) => {
                const txUrl = h.txHash ? getExplorerTxLink(h.chainId || null, h.txHash) : null;
                const accent = h.isWin ? '#10B981' : '#F43F5E';
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -1, scale: 1.005 }}
                    className={`relative group p-2.5 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs font-mono overflow-hidden ${
                      h.isWin
                        ? 'bg-emerald-950/25 border-emerald-500/40'
                        : 'bg-rose-950/20 border-rose-500/25'
                    }`}
                    style={{
                      boxShadow: h.isWin ? '0 0 18px rgba(16,185,129,0.14)' : undefined,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                      style={{
                        background: `radial-gradient(circle at 20% 50%, ${accent}12 0%, transparent 50%)`,
                        boxShadow: `inset 0 0 20px ${accent}0A`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 transition-all duration-400 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${accent}AA, transparent)`,
                        boxShadow: `0 0 10px ${accent}88`,
                      }}
                    />

                    <div className="relative flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all duration-300 group-hover:scale-105 ${
                          h.winningSide === 'HEADS'
                            ? 'bg-cyan-950/80 border border-cyan-400/50 text-cyan-300'
                            : 'bg-purple-950/80 border border-purple-400/50 text-purple-300'
                        }`}
                        style={{
                          boxShadow: h.winningSide === 'HEADS'
                            ? '0 0 12px rgba(0,240,255,0.25), inset 0 0 10px rgba(0,240,255,0.1)'
                            : '0 0 12px rgba(112,0,255,0.25), inset 0 0 10px rgba(112,0,255,0.1)',
                        }}
                      >
                        {h.winningSide === 'HEADS' ? <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-white">
                            Landed <span className={h.winningSide === 'HEADS' ? 'text-cyan-400' : 'text-purple-400'}>{h.winningSide}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            (Picked <span className={h.selectedSide === h.winningSide ? 'text-emerald-400' : 'text-rose-400'}>{h.selectedSide}</span>)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-400">
                          <span className="font-bold text-slate-300">#{h.nonce}</span>
                          <span>•</span>
                          <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                          {txUrl && (
                            <>
                              <span>•</span>
                              <a
                                href={txUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 transition-colors group/ex"
                              >
                                <span className="group/ex:underline">Explorer</span>
                                <ExternalLink className="w-2.5 h-2.5 group/ex:translate-x-0.5 group/ex:-translate-y-0.5 transition-transform" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative text-right shrink-0">
                      <span className={`font-['Orbitron'] font-bold text-xs sm:text-sm ${h.isWin ? 'text-emerald-400 text-glow-emerald' : 'text-rose-400'}`}>
                        {h.isWin ? `+${h.payout.toFixed(3)} ${h.currency || currency}` : `-${h.betAmount.toFixed(3)} ${h.currency || currency}`}
                      </span>
                      <span className={`block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${h.isWin ? 'text-emerald-400/90' : 'text-rose-400/80'}`}>
                        {h.isWin ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
