import { motion } from 'framer-motion';
import { TrendingUp, Flame, Shield, CheckCircle2 } from 'lucide-react';
import { COMMISSION_TREASURY_ADDRESS } from '../utils/blockchain';

interface StatsBarProps {
  totalVolume: number;
  totalFlips: number;
  winRate: number;
  totalCommission: number;
  currency: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalVolume,
  totalFlips,
  winRate,
  totalCommission,
  currency,
}) => {
  const isEthBased = currency.toUpperCase().includes('ETH') || currency.toUpperCase().includes('POL') || currency.toUpperCase().includes('BNB');

  const stats = [
    {
      label: 'SESSION VOLUME',
      value: `${totalVolume.toFixed(isEthBased ? 4 : 2)} ${currency}`,
      sublabel: 'REAL ON-CHAIN BETS',
      icon: TrendingUp,
      accent: 'text-cyan-400',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      glow: 'shadow-[0_0_15px_rgba(0,240,255,0.08)]',
    },
    {
      label: 'TOTAL FLIPS',
      value: totalFlips.toLocaleString(),
      sublabel: '5-SEC PVP ROUNDS',
      icon: Flame,
      accent: 'text-purple-400',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'shadow-[0_0_15px_rgba(112,0,255,0.08)]',
    },
    {
      label: 'WIN RATE',
      value: totalFlips > 0 ? `${winRate.toFixed(1)}%` : '0.0%',
      sublabel: '50/50 CRYPTO SEED',
      icon: Shield,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.08)]',
    },
    {
      label: 'COMMISSION ROUTED',
      value: `${totalCommission.toFixed(isEthBased ? 5 : 3)} ${currency}`,
      sublabel: `TO ${COMMISSION_TREASURY_ADDRESS.slice(0, 6)}...${COMMISSION_TREASURY_ADDRESS.slice(-4)}`,
      icon: CheckCircle2,
      accent: 'text-amber-400',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -2, scale: 1.015 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`p-2.5 sm:p-4 rounded-2xl glass-panel border ${stat.border} ${stat.glow} flex flex-col justify-between transition-all duration-300 cursor-default`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-400 uppercase truncate">
                  {stat.label}
                </span>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.accent} shrink-0`} />
              </div>

              <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                <span className={`text-xs sm:text-lg md:text-xl font-['Orbitron'] font-black tracking-tight ${stat.accent} truncate`}>
                  {stat.value}
                </span>
                {stat.sublabel && (
                  <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 truncate">
                    {stat.sublabel}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
