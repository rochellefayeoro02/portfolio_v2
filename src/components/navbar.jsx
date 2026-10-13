// navbar.jsx
import './header.css';
import { useState, useEffect } from 'react';

const NAV_ITEMS = ['Home', 'About', 'Projects', 'Skills', 'Contact'];

export default function Navbar({ activePage, setActivePage }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const handleNavClick = (item) => {
    setActivePage(item);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo" onClick={() => handleNavClick('Home')}>
            <span className="logo-first">Rochelle</span>
            <span className="logo-last">Faye A. Oro</span>
          </div>

          {/* Desktop Navigation */}
          <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <button
                  className={`nav-link-btn ${activePage === item ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="nav-link-text">{item}</span>
                  <span className="nav-link-indicator"></span>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop CTA Button */}
          <button 
            className="btn-cta desktop-cta" 
            onClick={() => handleNavClick('Contact')}
          >
            <span>Connect with Me</span>
            <svg className="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}