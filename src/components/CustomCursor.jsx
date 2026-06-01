import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailsRef = useRef([]);
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Configuration for trails
  const numTrails = 8;
  
  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Initialize trail positions
    const trails = trailsRef.current;
    trails.forEach(t => {
      if (t) {
        t.x = posRef.current.x;
        t.y = posRef.current.y;
      }
    });

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = (e) => {
      const el = e.target;
      if (
        el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.closest('button') ||
        el.closest('[role="button"]') ||
        el.dataset?.cursor === 'pointer' ||
        el.classList?.contains('quiz-option') ||
        el.classList?.contains('nav-item') ||
        el.classList?.contains('flashcard-scene')
      ) {
        setHovered(true);
      }
    };
    const onLeave = () => setHovered(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);

    const animate = () => {
      const { x, y } = posRef.current;
      const rp = ringPosRef.current;

      // Dot follows exactly
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      // Ring lerps (smoothed follow)
      rp.x += (x - rp.x) * 0.15;
      rp.y += (y - rp.y) * 0.15;
      ring.style.left = `${rp.x}px`;
      ring.style.top = `${rp.y}px`;

      // Trail lerping
      let tx = x;
      let ty = y;
      trails.forEach((t, i) => {
        if (!t.el) return;
        t.x += (tx - t.x) * 0.3;
        t.y += (ty - t.y) * 0.3;
        t.el.style.left = `${t.x}px`;
        t.el.style.top = `${t.y}px`;
        t.el.style.transform = `translate(-50%, -50%) scale(${1 - i * 0.1})`;
        t.el.style.opacity = 1 - (i / numTrails);
        tx = t.x;
        ty = t.y;
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Hide on mobile
  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${hovered ? 'hovered' : ''}`}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovered ? 'hovered' : ''}`}
      />
      
      {/* Trailing dots */}
      {Array.from({ length: numTrails }).map((_, i) => (
        <div
          key={i}
          ref={el => {
            if (!trailsRef.current[i]) {
              trailsRef.current[i] = { x: 0, y: 0, el: null };
            }
            trailsRef.current[i].el = el;
          }}
          className="cursor-trail"
        />
      ))}
    </>
  );
}
