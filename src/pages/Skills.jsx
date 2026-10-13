// Skills.jsx
import { useRef, useState } from 'react';
import './styles.css';

// Logo images come from the Devicon CDN (Cisco from Simple Icons).
// To use your own file instead, put it in public/ and write '/logos/name.svg'.
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons';
const dev = (name) => `${DEVICON}/${name}/${name}-original.svg`;

const ROW_ONE = [
  { name: 'React',        icon: dev('react') },
  { name: 'HTML5',        icon: dev('html5') },
  { name: 'CSS3',         icon: dev('css3') },
  { name: 'JavaScript',   icon: dev('javascript') },
  { name: 'Tailwind CSS', icon: dev('tailwindcss') },
  { name: 'Figma',        icon: dev('figma') },
  { name: 'Git',          icon: dev('git') },
  { name: 'GitHub',       icon: dev('github') },
   { name: 'Php',       icon: dev('php') },
  { name: 'linux',    icon: dev('linux') },
];

const ROW_TWO = [
  { name: 'Node.js',    icon: dev('nodejs') },
  { name: 'Express.js', icon: dev('express') },
  { name: 'MongoDB',    icon: dev('mongodb') },
  { name: 'Python',     icon: dev('python') },
  { name: 'Java',       icon: dev('java') },
  { name: 'Cisco',      icon: 'https://cdn.simpleicons.org/cisco/1BA0D7' },
  { name: 'Postman',    icon: dev('postman') },
  { name: 'VS Code',    icon: dev('vscode') },
  { name: 'Supabase',    icon: dev('supabase') },
  { name: 'Arduino',    icon: dev('arduino') },
];

function SkillTile({ skill, lit, onToggle, hidden }) {
  return (
    <button
      type="button"
      className={`skill-tile ${lit ? 'is-lit' : ''}`}
      onClick={() => onToggle(skill.name)}
      aria-pressed={lit}
      aria-label={skill.name}
      tabIndex={hidden ? -1 : 0}
    >
      <span className="skill-logo-wrap">
        <img
          className="skill-logo"
          src={skill.icon}
          alt=""
          loading="lazy"
          draggable="false"
          onError={(e) => {
            // If a logo can't load, show the first letter instead
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.dataset.fallback = skill.name[0];
          }}
        />
      </span>
      <span className="skill-tile-name">{skill.name}</span>
    </button>
  );
}

function MarqueeRow({ items, duration, lit, onToggle }) {
  const [touched, setTouched] = useState(false);
  const resumeTimer = useRef(null);

  // Hover pauses on desktop; touching pauses on phones
  const handleTouchStart = () => {
    clearTimeout(resumeTimer.current);
    setTouched(true);
  };
  const handleTouchEnd = () => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setTouched(false), 1500);
  };

  // Each group holds the list twice so it is always wider than the screen;
  // two identical groups make the loop seamless.
  const group = (hidden) => (
    <ul className="marquee-group" aria-hidden={hidden || undefined}>
      {[...items, ...items].map((skill, i) => (
        <li key={`${skill.name}-${i}`}>
          <SkillTile skill={skill} lit={lit.has(skill.name)} onToggle={onToggle} hidden={hidden} />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`marquee-row ${touched ? 'is-paused' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="marquee-track" style={{ '--duration': `${duration}s` }}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

export default function Skills() {
  const [lit, setLit] = useState(() => new Set());

  const toggle = (name) =>
    setLit((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <section className="skills-section">
      <div className="section-tag">Skills & Tools</div>
      <h2 className="section-title">
        Tech<span className="highlight">stack</span>
      </h2>
      <p className="section-sub">
        From full‑stack development to design and networking — tools I use daily to build robust digital solutions.
      </p>

      <div className="skills-marquee">
        <MarqueeRow items={ROW_ONE} duration={46} lit={lit} onToggle={toggle} />
        <MarqueeRow items={ROW_TWO} duration={58} lit={lit} onToggle={toggle} />
      </div>

      <p className="skills-hint">Hover or touch to pause. Click a logo to see its colors.</p>
    </section>
  );
}