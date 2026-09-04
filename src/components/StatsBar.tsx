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
      border: 'border-cyan-500/20',
      glow: 'shadow-[0_0_15px_rgba(0,240,255,0.1)]',
    },
    {
      label: 'TOTAL FLIPS',
      value: totalFlips.toLocaleString(),
      sublabel: 'PROVABLY FAIR ROUNDS',
      icon: Flame,
      accent: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'shadow-[0_0_15px_rgba(112,0,255,0.1)]',
    },
    {
      label: 'WIN RATE',
      value: totalFlips > 0 ? `${winRate.toFixed(1)}%` : '0.0%',
      sublabel: '50/50 BASELINE PROBABILITY',
      icon: Shield,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    },
    {
      label: 'COMMISSION ROUTED',
      value: `${totalCommission.toFixed(isEthBased ? 5 : 3)} ${currency}`,
      sublabel: `TO ${COMMISSION_TREASURY_ADDRESS.slice(0, 6)}...${COMMISSION_TREASURY_ADDRESS.slice(-4)}`,
      icon: CheckCircle2,
      accent: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-3.5 sm:p-4 rounded-2xl glass-panel border ${stat.border} ${stat.glow} flex flex-col justify-between transition-all duration-300 hover:border-white/20`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                  {stat.label}
                </span>
                <Icon className={`w-4 h-4 ${stat.accent}`} />
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-base sm:text-xl font-['Orbitron'] font-black tracking-tight ${stat.accent}`}>
                  {stat.value}
                </span>
                {stat.sublabel && (
                  <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
                    {stat.sublabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
