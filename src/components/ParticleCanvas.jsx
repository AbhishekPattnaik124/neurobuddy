import { useEffect, useRef } from 'react';

const PARTICLE_COUNT_DESKTOP = 120;
const PARTICLE_COUNT_MOBILE = 60;
const REPEL_RADIUS = 100;
const TRAIL_ALPHA = 0.15;

function createParticle(w, h) {
  const rand = Math.random();
  let color;
  if (rand < 0.60) color = `rgba(0,229,255,`;      // cyan 60%
  else if (rand < 0.85) color = `rgba(0,255,157,`; // green 25%
  else color = `rgba(123,97,255,`;                   // violet 15%

  const opacity = 0.15 + Math.random() * 0.3;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(0.2 + Math.random() * 0.5),  // upward drift
    color,
    opacity,
    baseOpacity: opacity,
  };
}

export function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    );

    const onMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      const { width, height } = canvas;
      const mouse = mouseRef.current;

      // Trail effect: semi-transparent fill instead of clearRect
      ctx.fillStyle = `rgba(2, 8, 16, ${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        // Mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Velocity damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Restore base upward drift
        p.vy += (-(0.2 + p.size * 0.1) - p.vy) * 0.01;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle with glow
        const opacity = Math.min(1, p.baseOpacity + (dist < REPEL_RADIUS ? (REPEL_RADIUS - dist) / REPEL_RADIUS * 0.3 : 0));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${opacity})`;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = `${p.color}0.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    // Spawn particles one by one for the startup effect
    let spawnIdx = 0;
    const spawnInterval = setInterval(() => {
      if (spawnIdx >= particlesRef.current.length) {
        clearInterval(spawnInterval);
        return;
      }
      spawnIdx++;
    }, 8);

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      clearInterval(spawnInterval);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
