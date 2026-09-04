import { motion } from 'framer-motion';
import { TrendingUp, Flame, Shield, Coins } from 'lucide-react';
import { COMMISSION_TREASURY_ADDRESS } from '../utils/blockchain';

interface StatsBarProps {
  totalVolume: number;
  totalFlips: number;
  winRate: number;
  totalCommission: number;
  currency: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalVolume, totalFlips, winRate, totalCommission, currency,
}) => {
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));

  const stats = [
    {
      label: 'Session Volume',
      value: totalVolume.toFixed(isEthBased ? 4 : 2),
      unit: currency,
      sub: 'Real on-chain bets',
      icon: TrendingUp,
      accent: '#22D3EE',
      tag: 'LIVE',
    },
    {
      label: 'Total Flips',
      value: totalFlips.toLocaleString(),
      unit: '',
      sub: '5-second PVP rounds',
      icon: Flame,
      accent: '#A78BFA',
      tag: 'ROUNDS',
    },
    {
      label: 'Win Rate',
      value: totalFlips > 0 ? winRate.toFixed(1) : '0.0',
      unit: '%',
      sub: 'Provably 50/50 seed',
      icon: Shield,
      accent: '#34D399',
      tag: 'FAIR',
    },
    {
      label: 'Commission Routed',
      value: totalCommission.toFixed(isEthBased ? 5 : 3),
      unit: currency,
      sub: `→ ${COMMISSION_TREASURY_ADDRESS.slice(0,6)}…${COMMISSION_TREASURY_ADDRESS.slice(-4)}`,
      icon: Coins,
      accent: '#FCD34D',
      tag: 'ON-CHAIN',
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6">
      {/* Ticker label */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/25">Session Stats</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16,1,0.3,1] }}
              whileHover={{ y: -2 }}
              className="relative p-4 sm:p-5 cursor-default transition-all duration-300 group"
              style={{
                background: '#080808',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${s.accent}33`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/30">
                  {s.label}
                </span>
                <div
                  className="w-6 h-6 flex items-center justify-center"
                  style={{ background: `${s.accent}12`, border: `1px solid ${s.accent}25` }}
                >
                  <Icon style={{ color: s.accent, width: 12, height: 12 }} />
                </div>
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-display font-bold text-xl sm:text-2xl leading-none tracking-tight"
                  style={{ color: s.accent }}
                >
                  {s.value}
                </span>
                {s.unit && (
                  <span className="font-mono-ui text-[10px] text-white/30 font-bold">{s.unit}</span>
                )}
              </div>

              {/* Sub */}
              <p className="font-mono-ui text-[9px] text-white/20 mt-2 truncate uppercase tracking-wider">
                {s.sub}
              </p>

              {/* Tag badge */}
              <div
                className="absolute top-3 right-3 hidden sm:block font-mono-ui text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                style={{ color: `${s.accent}99`, border: `1px solid ${s.accent}25` }}
              >
                {s.tag}
              </div>

              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: s.accent }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
