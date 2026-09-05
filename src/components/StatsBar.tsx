import { motion, useMotionValue, animate } from 'framer-motion';
import { TrendingUp, Flame, Shield, Coins } from 'lucide-react';
import { COMMISSION_TREASURY_ADDRESS } from '../utils/blockchain';
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
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString());
      },
    });
    prevRef.current = value;
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals]);

  return <span>{display}</span>;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalVolume, totalFlips, winRate, totalCommission, currency,
}) => {
  const isEthBased = ['ETH','POL','BNB'].some(s => currency.toUpperCase().includes(s));
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapMx, setWrapMx] = useState(50);

  const stats = [
    {
      label: 'Session Volume',
      value: totalVolume,
      decimals: isEthBased ? 4 : 2,
      unit: currency,
      sub: 'Real on-chain bets',
      icon: TrendingUp,
      accent: '#22D3EE',
      accentBg: 'rgba(34,211,238,0.14)',
      accentBorder: 'rgba(34,211,238,0.35)',
      tag: 'LIVE',
    },
    {
      label: 'Total Flips',
      value: totalFlips,
      decimals: 0,
      unit: '',
      sub: '5-second PVP rounds',
      icon: Flame,
      accent: '#C084FC',
      accentBg: 'rgba(192,132,252,0.14)',
      accentBorder: 'rgba(192,132,252,0.35)',
      tag: 'ROUNDS',
    },
    {
      label: 'Win Rate',
      value: totalFlips > 0 ? winRate : 0,
      decimals: 1,
      unit: '%',
      sub: 'Provably 50/50 seed',
      icon: Shield,
      accent: '#34D399',
      accentBg: 'rgba(52,211,153,0.14)',
      accentBorder: 'rgba(52,211,153,0.35)',
      tag: 'FAIR',
    },
    {
      label: 'Commission Routed',
      value: totalCommission,
      decimals: isEthBased ? 5 : 3,
      unit: currency,
      sub: `→ ${COMMISSION_TREASURY_ADDRESS.slice(0,6)}…${COMMISSION_TREASURY_ADDRESS.slice(-4)}`,
      icon: Coins,
      accent: '#FBBF24',
      accentBg: 'rgba(251,191,36,0.14)',
      accentBorder: 'rgba(251,191,36,0.35)',
      tag: 'ON-CHAIN',
    },
  ];

  const handleWrapMouse = (e: React.MouseEvent) => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setWrapMx(((e.clientX - r.left) / r.width) * 100);
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleWrapMouse}
      className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6 relative"
    >
      <div className="absolute inset-x-5 sm:inset-x-8 lg:inset-x-10 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{
        background: `linear-gradient(90deg, transparent, rgba(0,240,255,0.25) ${wrapMx}%, rgba(139,92,246,0.25), transparent)`,
      }} />
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/25 relative z-10">Session Stats</span>
        <div className="flex-1 h-px relative z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" style={{ boxShadow: '0 0 10px #00F0FF' }} />
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16,1,0.3,1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative p-4 sm:p-5 cursor-default transition-all duration-500 group overflow-hidden corner-brackets"
              style={{
                background: `linear-gradient(180deg, rgba(10,10,16,0.92) 0%, rgba(5,5,10,0.96) 100%)`,
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = s.accentBorder;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${s.accent}15, 0 16px 40px rgba(0,0,0,0.5), 0 0 30px ${s.accent}12 inset`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <span className="cb-tl" />
              <span className="cb-br" />
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(400px circle at 50% 0%, ${s.accent}14, transparent 60%)`,
                }}
              />

              <div className="absolute inset-x-0 top-0 h-px pointer-events-none" style={{
                background: `linear-gradient(90deg, transparent, ${s.accent}55, transparent)`,
                opacity: 0.5,
              }} />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="font-mono-ui text-[9px] uppercase tracking-[0.14em] text-white/32 group-hover:text-white/50 transition-colors">
                  {s.label}
                </span>
                <div
                  className="w-7 h-7 flex items-center justify-center transition-all duration-400 group-hover:scale-110 group-hover:-rotate-6 relative"
                  style={{
                    background: s.accentBg,
                    border: `1px solid ${s.accentBorder}`,
                    borderRadius: '10px',
                    boxShadow: `0 0 12px ${s.accent}18 inset`,
                  }}
                >
                  <Icon style={{ color: s.accent, width: 14, height: 14 }} />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 relative z-10">
                <span
                  className="font-display font-bold text-xl sm:text-2xl leading-none tracking-tight"
                  style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}44` }}
                >
                  <AnimatedNumber value={s.value} decimals={s.decimals} />
                </span>
                {s.unit && (
                  <span className="font-mono-ui text-[10px] text-white/32 font-bold">{s.unit}</span>
                )}
              </div>

              <p className="font-mono-ui text-[9px] text-white/22 mt-2 truncate uppercase tracking-wider group-hover:text-white/35 transition-colors relative z-10">
                {s.sub}
              </p>

              <div
                className="absolute top-3 right-3 hidden sm:block font-mono-ui text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 transition-all duration-400 relative z-10"
                style={{
                  color: `${s.accent}BB`,
                  border: `1px solid ${s.accentBorder}`,
                  background: s.accentBg,
                  borderRadius: '6px',
                }}
              >
                {s.tag}
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)`,
                  boxShadow: `0 0 10px ${s.accent}88`,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
