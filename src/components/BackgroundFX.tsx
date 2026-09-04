import { useEffect, useRef } from 'react';

interface BackgroundFXProps {
  intensity?: 'normal' | 'intense';
}

export const BackgroundFX: React.FC<BackgroundFXProps> = ({ intensity = 'normal' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = intensity === 'intense' ? 70 : 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#00F0FF' : '#7000FF',
      alpha: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2,
    }));

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.01;

      // Draw subtle glowing dust particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#090A0F]" />

      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid cyber-grid-glow opacity-30" />

      {/* Ambient Neon Glow Orbs */}
      <div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#00F0FF]/10 blur-[130px] animate-pulse-glow"
      />
      <div 
        className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-[#7000FF]/15 blur-[140px] animate-pulse-glow" 
        style={{ animationDelay: '1.5s' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-cyan-950/20 blur-[160px] pointer-events-none"
      />

      {/* Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-15 pointer-events-none" />
    </div>
  );
};
