// About.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import './styles.css';
import './about-typing.css';

const PARAGRAPHS = [
  "I'm Rochelle, a UI/UX designer who creates meaningful digital experiences. I believe great design happens at the intersection of creativity and functionality.",
  "Every pixel serves a purpose and every interaction feels natural. I'm passionate about designing products that people love to use.",
  'My approach combines user research, visual design, and thoughtful interaction to build experiences that truly connect with people.',
];
const QUOTE = "Design is not just how it looks — it's how it works.";


const CODE_CHARS = '01{}[]()<>/=+-*&|#$%;:_~^?!@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SCRAMBLE_MS = 55; // how fast the symbols switch
const randomGlyph = () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];


function buildTimeline(text, cps) {
  const step = 1000 / cps;
  const times = [];
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    t += step;
    if (/[.!?]/.test(text[i - 1] ?? '')) t += 220;
    times.push(t);
  }
  return times;
}

function useRobotTyping(text, active, cps, onDone) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const times = useMemo(() => buildTimeline(text, cps), [text, cps]);

  useEffect(() => {
    if (!active) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      doneRef.current?.();
      return;
    }

    let raf;
    let start;
    let shown = 0;
    const tick = (now) => {
      if (start === undefined) start = now;
      const elapsed = now - start;
      while (shown < times.length && times[shown] <= elapsed) shown++;
      setCount((c) => (c === shown ? c : shown));
      if (shown < text.length) raf = requestAnimationFrame(tick);
      else doneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, text, times]);

  return count;
}

/* Words are kept whole (nowrap) and untyped letters stay in the layout
   as invisible, so the text never re-wraps or jumps while it types. */
function TypedText({ text, active, onDone, cps = 30, keepCaret = false, big = false }) {
  const count = useRobotTyping(text, active, cps, onDone);
  const typing = active && count < text.length;
  const finished = active && count >= text.length;
  const showCaret = typing || (finished && keepCaret);
  const caret = <span className={`type-caret ${typing ? 'is-typing' : 'is-idle'}`} />;

  // Re-roll the random symbols on a steady beat until the sentence is done
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!typing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setTick((t) => t + 1), SCRAMBLE_MS);
    return () => clearInterval(id);
  }, [typing]);

  let idx = 0;
  const words = text.split(' ').map((word, wi, arr) => {
    const letters = [...word].map((ch) => {
      const i = idx++;
      const decoded = i < count;
      return (
        <span
          key={i}
          className={`ch ${active ? 'is-in' : ''} ${decoded ? 'is-done' : 'is-code'}`}
        >
          {active && !decoded ? randomGlyph() : ch}
          {showCaret && i === count - 1 && caret}
        </span>
      );
    });
    const space = wi < arr.length - 1 ? ' ' : '';
    idx += space.length;
    return (
      <span key={wi}>
        <span className="word">{letters}</span>
        {space}
      </span>
    );
  });

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className={`robo ${big ? 'robo-big' : ''}`} aria-hidden="true">
        {showCaret && count === 0 && caret}
        {words}
      </span>
    </>
  );
}

export default function About() {
  const [headIn, setHeadIn] = useState(false);
  const [step, setStep] = useState(-1); // which line is typing: 0-2 paragraphs, 3 quote

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeadIn(true));
    const timer = setTimeout(() => setStep(0), 650);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  // A beat between lines, like a machine feeding the next sheet.
  const next = (i) => () => {
    setTimeout(() => setStep((s) => Math.max(s, i + 1)), 350);
  };

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-content">
          <div className={`section-tag reveal-right ${headIn ? 'is-in' : ''}`}>About Me</div>
          <h2 className={`section-title reveal-right ${headIn ? 'is-in' : ''}`} style={{ transitionDelay: '0.12s' }}>
            Crafting <span className="highlight">Digital</span> Experiences
          </h2>

          <div className="about-text">
            {PARAGRAPHS.map((para, i) => (
              <p key={i} className={`about-paragraph reveal-right ${step >= i ? 'is-in' : ''}`}>
                <TypedText text={para} active={step >= i} onDone={next(i)} />
              </p>
            ))}
          </div>

          <div className={`about-highlight reveal-right ${step >= 3 ? 'is-in' : ''}`}>
            <span className="highlight-emoji">✨</span>
            <span className="highlight-text">
              <TypedText text={QUOTE} active={step >= 3} cps={26} keepCaret big />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}