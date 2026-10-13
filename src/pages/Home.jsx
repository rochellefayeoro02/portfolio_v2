// Home.jsx
import './styles.css';
import { useState, useEffect, useRef } from 'react';

const SOCIALS = [
  { label: 'GitHub',   href: 'https://github.com/rochellefayeoro02',                       icon: 'fab fa-github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rochelle-faye-oro-3ba473372/', icon: 'fab fa-linkedin-in' },
  { label: 'Email',    href: 'mailto:ororochellefaye0226@gmail.com',                       icon: 'fas fa-envelope' },
];

const ROLES = [
  'UI/UX Designer',
  'Front-end Developer',
  'Problem Solver',
  'Creative Thinker',
];

export default function Home({ setActivePage }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  // Typing animation: one timer per step, always cleaned up
  useEffect(() => {
    const role = ROLES[roleIndex];
    const atEnd = !isDeleting && text === role;
    const atStart = isDeleting && text === '';

    let delay = isDeleting ? 45 : 90;
    if (atEnd) delay = 2200;   // hold the finished word
    if (atStart) delay = 350;  // short beat before the next word

    const timer = setTimeout(() => {
      if (atEnd) setIsDeleting(true);
      else if (atStart) {
        setIsDeleting(false);
        setRoleIndex((i) => (i + 1) % ROLES.length);
      } else {
        setText(role.slice(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setImgLoaded(true);
  }, []);

  return (
    <section className="home-section" id="home">
      {/* ── Left Content ── */}
      <div className="home-content">
        <div className="home-tag">
          <span className="home-tag-dot" />
          Welcome to my world ✦
        </div>

        <p className="home-greeting">Hi, I'm</p>
        <h1 className="home-name">Rochelle Faye A. Oro</h1>

        <div className="home-title-wrapper">
          <h2 className="home-title">
            I'm a{' '}
            <span className="role-container">
              <span className="highlight typing-text">{text}</span>
              <span className="cursor-blink"></span>
            </span>
          </h2>
        </div>

        <p className="home-desc">
          Passionate UI/UX designer who creates intuitive and visually
          compelling digital experiences. I transform ideas into seamless
          designs that exceed users' expectations. With a keen eye for detail
          and a love for clean code, I bridge the gap between design and development.
        </p>

        <div className="home-actions">
          <button className="btn-primary" onClick={() => setActivePage('Contact')}>
            <span>✦</span> connect with me
          </button>
        </div>

        <div className="home-socials">
          {SOCIALS.map(({ label, href, icon }) => {
            const isMail = href.startsWith('mailto:');
            return (
              <a
                key={label}
                href={href}
                className="social-btn"
                {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                aria-label={label}
                title={`Connect on ${label}`}
              >
                <i className={icon}></i>
                <span className="social-tooltip">{label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── Avatar: frame glides in, photo develops from blur ── */}
      <div className="home-visual">
        <div className="avatar-frame">
          <div className="avatar-glow" />
          <div className="avatar-ring" />
          <div className="avatar-inner">
            <img
              ref={imgRef}
              src="/rochelle.jpg"
              alt="Rochelle Faye A. Oro - UI/UX Designer"
              className={`avatar-image ${imgLoaded ? 'is-loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'https://ui-avatars.com/api/?name=Rochelle+Oro&background=6d28d9&color=fff&size=400';
              }}
            />
            <div className="avatar-overlay">
              <span className="avatar-emoji-overlay"></span>
              <span className="avatar-text-overlay">View Portfolio</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="scroll-indicator" onClick={() => setActivePage('About')}>
        <div className="scroll-dot" />
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}