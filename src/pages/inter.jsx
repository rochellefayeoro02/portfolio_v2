// InteractiveBackground.jsx
// A living background that reacts to you:
//  • drifting purple/pink diamonds + dots joined by faint lines
//  • the cursor (or finger) pushes and swirls them, and glows softly
//  • clicking sends out a shockwave ring that shoves nearby particles
//  • scrolling adds parallax depth and makes the particles streak faster
//  • your existing .blob elements float with the pointer and the scroll
import { useEffect, useRef } from 'react';

const LINK_DIST = 130;
const MOUSE_DIST = 170;
const PUSH_DIST = 150;
const PURPLE = '192, 132, 252';
const PINK = '232, 121, 249';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const blobs = Array.from(document.querySelectorAll('.blob'));

    let w = 0, h = 0, dpr = 1, raf;
    let particles = [];
    const ripples = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const glow = { x: -9999, y: -9999 };   // eased cursor position
    const tilt = { x: 0, y: 0, sx: 0, sy: 0 }; // -1..1 for blob parallax
    let scroll = window.scrollY;
    let lastScroll = scroll;
    let scrollVel = 0;

    const rand = (a, b) => a + Math.random() * (b - a);

    const makeParticle = () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.18, 0.18),
      vy: rand(-0.18, 0.18),
      ox: 0, // impulse from cursor / clicks (decays)
      oy: 0,
      z: rand(0.25, 1), // depth: bigger = closer = more parallax
      r: rand(1.2, 2.8),
      diamond: Math.random() < 0.35,
      color: Math.random() < 0.7 ? PURPLE : PINK,
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(coarse ? 45 : 95, Math.round((w * h) / (coarse ? 20000 : 15000)));
      while (particles.length < target) particles.push(makeParticle());
      particles.length = target;
      if (reduce) draw();
    };

    // On-screen position (parallax applied, wrapped so it loops forever)
    const project = (p) => {
      const py = (((p.y - scroll * p.z * 0.3) % h) + h) % h;
      return [p.x, py];
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // soft light that follows the cursor
      if (mouse.active) {
        const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 240);
        g.addColorStop(0, `rgba(${PURPLE}, 0.16)`);
        g.addColorStop(1, `rgba(${PURPLE}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(glow.x - 240, glow.y - 240, 480, 480);
      }

      const pts = particles.map(project);

      // links between neighbours + to the cursor
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const dx = x1 - pts[j][0];
          const dy = y1 - pts[j][1];
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(${PURPLE}, ${(1 - d / LINK_DIST) * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(pts[j][0], pts[j][1]);
            ctx.stroke();
          }
        }
        if (mouse.active) {
          const d = Math.hypot(x1 - glow.x, y1 - glow.y);
          if (d < MOUSE_DIST) {
            ctx.strokeStyle = `rgba(${PINK}, ${(1 - d / MOUSE_DIST) * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(glow.x, glow.y);
            ctx.stroke();
          }
        }
      }

      // particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const [x, y] = pts[i];
        const alpha = 0.35 + p.z * 0.5;
        const s = p.r * (0.6 + p.z * 0.8);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        if (p.diamond) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-s, -s, s * 2, s * 2);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // click shockwaves
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.strokeStyle = `rgba(${PINK}, ${r.a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        if (!reduce) {
          r.r += 7;
          r.a -= 0.018;
        }
        if (r.a <= 0) ripples.splice(i, 1);
      }
    };

    const step = () => {
      // ease values
      glow.x += (mouse.x - glow.x) * 0.18;
      glow.y += (mouse.y - glow.y) * 0.18;
      tilt.sx += (tilt.x - tilt.sx) * 0.05;
      tilt.sy += (tilt.y - tilt.sy) * 0.05;

      const delta = scroll - lastScroll;
      lastScroll = scroll;
      scrollVel += (delta - scrollVel) * 0.12;
      const boost = 1 + Math.min(Math.abs(scrollVel) * 0.12, 4);

      for (const p of particles) {
        const [px, py] = project(p);

        if (mouse.active) {
          const dx = px - glow.x;
          const dy = py - glow.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < PUSH_DIST) {
            const f = 1 - d / PUSH_DIST;
            // push away + a little sideways swirl
            p.ox += (dx / d) * f * 0.9 - (dy / d) * f * 0.3;
            p.oy += (dy / d) * f * 0.9 + (dx / d) * f * 0.3;
          }
        }

        p.ox *= 0.92;
        p.oy *= 0.92;
        p.x += p.vx * boost + p.ox;
        p.y += p.vy * boost + p.oy;

        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y += h + 40;
        else if (p.y > h + 20) p.y -= h + 40;
      }

      // floating blobs follow the pointer and drift with scroll
      blobs.forEach((b, i) => {
        const k = (i + 1) * 16;
        b.style.translate = `${tilt.sx * k}px ${tilt.sy * k - scroll * 0.04 * (i + 1)}px`;
      });

      draw();
      raf = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.active) {
        glow.x = e.clientX;
        glow.y = e.clientY;
      }
      mouse.active = true;
      tilt.x = (e.clientX / w - 0.5) * 2;
      tilt.y = (e.clientY / h - 0.5) * 2;
    };
    const onLeave = () => { mouse.active = false; };

    const onDown = (e) => {
      ripples.push({ x: e.clientX, y: e.clientY, r: 6, a: 0.6 });
      for (const p of particles) {
        const [px, py] = project(p);
        const dx = px - e.clientX;
        const dy = py - e.clientY;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 300) {
          const f = 1 - d / 300;
          p.ox += (dx / d) * f * 14;
          p.oy += (dy / d) * f * 14;
        }
      }
    };

    const onScroll = () => { scroll = window.scrollY; };

    resize();
    window.addEventListener('resize', resize);
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('mouseleave', onLeave);
      window.addEventListener('blur', onLeave);
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      blobs.forEach((b) => { b.style.translate = ''; });
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />;
}