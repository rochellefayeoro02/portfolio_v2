
import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './styles.css';
import './upgrades.css'; 
import './scroll.css';   
import Navbar from '../components/navbar';
import CustomCursor from './CustomCursor';
import InteractiveBackground from './inter';
import Home from './Home';
import About from './About';
import Projects from './Projects';
import Skills from './Skills';
import Contact from './Contact';

const PAGES = ['Home', 'About', 'Projects', 'Skills', 'Contact'];
const sectionId = (name) => `section-${name.toLowerCase()}`;


function Section({ name, lazy = false, children }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(!lazy);

  useEffect(() => {
    if (!lazy || mounted) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -30% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, mounted]);

  return (
    <div
      ref={ref}
      id={sectionId(name)}
      data-page={name}
      className="page-section"
      style={!mounted ? { minHeight: '100vh' } : undefined}
    >
      {mounted ? children : null}
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState('Home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const lockRef = useRef(false);   // true while a nav click is scrolling
  const lockTimer = useRef(null);

  // Navbar / buttons call this: scroll smoothly to that section
  const goTo = useCallback((name) => {
    const el = document.getElementById(sectionId(name));
    if (!el) return;

    setActivePage(name);
    lockRef.current = true;
    clearTimeout(lockTimer.current);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

    // Sections above may finish mounting mid-scroll; re-align once, then unlock
    lockTimer.current = setTimeout(() => {
      const top = el.getBoundingClientRect().top;
      if (Math.abs(top) > 4) window.scrollBy({ top, behavior: reduce ? 'auto' : 'smooth' });
      lockTimer.current = setTimeout(() => { lockRef.current = false; }, 600);
    }, 900);
  }, []);

  useEffect(() => () => clearTimeout(lockTimer.current), []);

  // Scroll-spy: highlight the navbar item for the section you're reading
  useEffect(() => {
    const els = PAGES.map((p) => document.getElementById(sectionId(p))).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActivePage(hit.target.dataset.page);
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Back-to-top button + "bottom of page = Contact" (Contact can be short)
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && !lockRef.current) setActivePage('Contact');
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="portfolio-wrapper">
      <InteractiveBackground />
      <CustomCursor />

      {/* Ambient background blobs (now float with your pointer + scroll) */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <Navbar activePage={activePage} setActivePage={goTo} />

      <main className="page-content">
        <Section name="Home"><Home setActivePage={goTo} /></Section>
        <Section name="About" lazy><About /></Section>
        <Section name="Projects"><Projects /></Section>
        <Section name="Skills"><Skills /></Section>
        <Section name="Contact"><Contact /></Section>
      </main>

      <button
        className={`back-to-top ${showBackToTop ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <span className="back-to-top-arrow">↑</span>
      </button>
    </div>
  );
}

export default App;