import { motion, useMotionValue, animate } from 'framer-motion';
import { TrendingUp, Flame, Shield, Coins } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface StatsBarProps {
  totalVolume: number;
  totalFlips: number;
  winRate: number;
  totalCommission: number;
  currency: string;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState('0');
  const prevRef = useRef(0);

  useEffect(() => {
    const prev = prevRef.current;
    const controls = animate(count, value, {
      from: prev,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString());
      },
    });
    prevRef.current = value;
    return controls.stop;
  }, [value, decimals, count]);

  return <span>{display}</span>;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalVolume, totalFlips, winRate, totalCommission, currency,
}) => {
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));

  const stats = [
    {
      label: 'Session Volume',
      value: totalVolume,
      decimals: isEthBased ? 4 : 2,
      unit: currency,
      sub: 'Verified On-Chain',
      icon: TrendingUp,
      accentColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    },
    {
      label: 'Total Flips',
      value: totalFlips,
      decimals: 0,
      unit: 'Rounds',
      sub: 'Instant Settlement',
      icon: Flame,
      accentColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    },
    {
      label: 'Session Win Rate',
      value: totalFlips > 0 ? winRate : 0,
      decimals: 1,
      unit: '%',
      sub: 'Provably Fair 50/50',
      icon: Shield,
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    },
    {
      label: 'Treasury Routed',
      value: totalCommission,
      decimals: isEthBased ? 5 : 3,
      unit: currency,
      sub: '2.0% Protocol Fee',
      icon: Coins,
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    },
  ];

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
      {/* 2x2 on Mobile, 4-cols on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
              className="defi-card-subtle p-3 sm:p-4 hover:border-white/15 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                <span className="font-mono-ui text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider truncate">
                  {s.label}
                </span>
                <div className={`p-1 sm:p-1.5 rounded-lg border ${s.badgeBg} shrink-0`}>
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              <div className="font-mono-ui text-base sm:text-xl font-bold text-white tracking-tight flex items-baseline gap-1 truncate">
                <AnimatedNumber value={s.value} decimals={s.decimals} />
                <span className="text-[10px] sm:text-xs text-slate-400 font-normal">
                  {s.unit}
                </span>
              </div>

              <div className="mt-1 text-[10px] sm:text-[11px] font-mono-ui text-slate-500 truncate">
                {s.sub}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
