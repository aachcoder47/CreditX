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
  totalVolume,
  totalFlips,
  winRate,
  totalCommission,
  currency,
}) => {
  const isEthBased = ['ETH', 'POL', 'BNB'].some(s => currency.toUpperCase().includes(s));

  const stats = [
    {
      label: 'Session Volume',
      value: `${totalVolume.toFixed(isEthBased ? 4 : 2)}`,
      unit: currency,
      sub: 'Real on-chain bets',
      Icon: TrendingUp,
      accentText: 'text-cyan-300',
      accentBg: 'rgba(0,240,255,0.07)',
      accentBorder: 'rgba(0,240,255,0.16)',
      glowColor: 'rgba(0,240,255,0.18)',
      iconColor: '#22D3EE',
    },
    {
      label: 'Total Flips',
      value: totalFlips.toLocaleString(),
      unit: '',
      sub: '5-sec PVP rounds',
      Icon: Flame,
      accentText: 'text-violet-300',
      accentBg: 'rgba(139,92,246,0.07)',
      accentBorder: 'rgba(139,92,246,0.18)',
      glowColor: 'rgba(112,0,255,0.18)',
      iconColor: '#A78BFA',
    },
    {
      label: 'Win Rate',
      value: totalFlips > 0 ? `${winRate.toFixed(1)}` : '0.0',
      unit: '%',
      sub: '50/50 provably fair',
      Icon: Shield,
      accentText: 'text-emerald-300',
      accentBg: 'rgba(16,185,129,0.07)',
      accentBorder: 'rgba(16,185,129,0.18)',
      glowColor: 'rgba(16,185,129,0.15)',
      iconColor: '#34D399',
    },
    {
      label: 'Commission Sent',
      value: `${totalCommission.toFixed(isEthBased ? 5 : 3)}`,
      unit: currency,
      sub: `→ ${COMMISSION_TREASURY_ADDRESS.slice(0, 6)}...${COMMISSION_TREASURY_ADDRESS.slice(-4)}`,
      Icon: Coins,
      accentText: 'text-amber-300',
      accentBg: 'rgba(245,158,11,0.07)',
      accentBorder: 'rgba(245,158,11,0.18)',
      glowColor: 'rgba(245,158,11,0.15)',
      iconColor: '#FCD34D',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((s, i) => {
          const Icon = s.Icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, scale: 1.018 }}
              className="relative rounded-2xl p-3 sm:p-4 cursor-default overflow-hidden transition-all duration-300"
              style={{
                background: `radial-gradient(110% 90% at 50% -10%, ${s.accentBg} 0%, rgba(8,10,18,0.85) 100%)`,
                border: `1px solid ${s.accentBorder}`,
                boxShadow: `0 0 30px -10px ${s.glowColor}, 0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 24px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Corner glow */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${s.glowColor} 0%, transparent 70%)` }}
              />

              <div className="relative flex items-start justify-between gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-400 uppercase leading-tight">
                  {s.label}
                </span>
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${s.accentBg}`, border: `1px solid ${s.accentBorder}` }}
                >
                  <Icon style={{ color: s.iconColor, width: 13, height: 13 }} />
                </div>
              </div>

              <div className="relative mt-2 sm:mt-3">
                <div className={`flex items-baseline gap-1 ${s.accentText}`}>
                  <span className="font-['Orbitron'] text-sm sm:text-xl font-black tracking-tight leading-none">
                    {s.value}
                  </span>
                  {s.unit && (
                    <span className="text-[10px] sm:text-xs font-mono font-bold opacity-70">{s.unit}</span>
                  )}
                </div>
                <p className="text-[8px] sm:text-[9px] font-mono text-slate-500 mt-1 truncate">
                  {s.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
