import { useEffect, useRef, useState } from 'react';

interface BackgroundFXProps {
  intensity?: 'normal' | 'intense';
}

export const BackgroundFX: React.FC<BackgroundFXProps> = ({ intensity = 'normal' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

    const particleCount = intensity === 'intense' ? 85 : 55;
    type Particle = {
      x: number; y: number; radius: number;
      color: string; alpha: number;
      speedX: number; speedY: number;
      twinkle: number; twinkleSpeed: number;
      size: number;
    };
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const isCyan = Math.random() > 0.45;
      const isEmerald = !isCyan && Math.random() > 0.5;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.3,
        size: Math.random() * 1.8 + 0.3,
        color: isCyan ? '#00F0FF' : (isEmerald ? '#10B981' : '#A855F7'),
        alpha: Math.random() * 0.5 + 0.12,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.5 - 0.12,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
      };
    });

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.012;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.twinkle += p.twinkleSpeed;

        if (p.y < -20) { p.y = height + 20; p.x = Math.random() * width; }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        const twinkleAlpha = p.alpha * (0.55 + 0.45 * Math.sin(p.twinkle));
        const pulse = 1 + 0.3 * Math.sin(t * 2 + p.twinkle);
        const r = p.radius * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = twinkleAlpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();

        if (p.size > 1.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2.8, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.8);
          grad.addColorStop(0, p.color + '55');
          grad.addColorStop(1, p.color + '00');
          ctx.fillStyle = grad;
          ctx.globalAlpha = twinkleAlpha * 0.7;
          ctx.shadowBlur = 0;
          ctx.fill();
        }
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

  const px = (mouse.x - 0.5) * 60;
  const py = (mouse.y - 0.5) * 60;
  const px2 = (mouse.x - 0.5) * 100;
  const py2 = (mouse.y - 0.5) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0" style={{ background: '#020205' }} />

      <div className="absolute inset-0 dot-grid" style={{ opacity: 0.55 }} />

      <div
        className="aurora-orb aurora-orb-1"
        style={{ transform: `translate(${px * 0.3}px, ${py * 0.3}px)` }}
      />
      <div
        className="aurora-orb aurora-orb-2"
        style={{ transform: `translate(${px2 * 0.25}px, ${py2 * 0.25}px)` }}
      />
      <div
        className="aurora-orb aurora-orb-3"
        style={{ transform: `translate(${px * 0.18}px, ${py * 0.18}px)` }}
      />

      <div
        className="absolute w-[40vw] h-[40vw] rounded-full pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          top: `${30 - py * 0.3}%`,
          left: `${45 + px * 0.3}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 60%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 block" />

      <div className="absolute inset-0 scanlines" />

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at ${50 + px * 0.8}% ${40 + py * 0.8}%, transparent 0%, transparent 35%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
    </div>
  );
};
