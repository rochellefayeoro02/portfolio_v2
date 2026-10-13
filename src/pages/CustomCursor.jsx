// CustomCursor.jsx
// Purple diamond cursor: a sharp core that tracks the pointer exactly,
// plus a softer outline that trails behind. Only runs on devices with a
// real mouse, so touch screens keep their normal behaviour.
import { useEffect, useRef } from 'react';

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, ' +
  '.project-card, .contact-item, .scroll-indicator, .skill-tile';

export default function CustomCursor() {
  const root = useRef(null);
  const core = useRef(null);
  const trail = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!finePointer.matches) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const html = document.documentElement;
    html.classList.add('has-diamond-cursor');

    let x = -100, y = -100;     // real pointer position
    let tx = -100, ty = -100;   // trailing position
    let seen = false;
    let raf;

    const place = (el, px, py) => {
      if (el) el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        tx = x;
        ty = y;
        root.current?.classList.add('is-visible');
      }
      place(core.current, x, y);
      const overLink = !!e.target.closest?.(INTERACTIVE);
      root.current?.classList.toggle('is-link', overLink);
    };

    const loop = () => {
      const ease = reduceMotion ? 1 : 0.16;
      tx += (x - tx) * ease;
      ty += (y - ty) * ease;
      place(trail.current, tx, ty);
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => root.current?.classList.add('is-down');
    const onUp = () => root.current?.classList.remove('is-down');
    const onLeave = () => root.current?.classList.remove('is-visible');
    const onEnter = () => seen && root.current?.classList.add('is-visible');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('has-diamond-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <div ref={root} className="diamond-root" aria-hidden="true">
      <div ref={trail} className="diamond-pos">
        <span className="diamond-trail" />
      </div>
      <div ref={core} className="diamond-pos">
        <span className="diamond-core" />
      </div>
    </div>
  );
}