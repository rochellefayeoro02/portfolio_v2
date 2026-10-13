// Projects.jsx
import { useEffect, useRef, useState } from 'react';
import './styles.css';
import './Projects.css'; // square cards, centered rows of 3, scroll pop-in
import devify from '../logo/devify.png';   
import letsgo from '../logo/letsgo.png'; 
import synctask from '../logo/synctask.svg';    

const PROJECTS = [
  {
    id: 1,
    tags: ['UI/UX', 'Figma', 'Dashboard'],
    name: 'Devify',
    desc: 'An app that notifies you in real time event which can easily track your activitiess.',
    theme: 'theme-indigo',
image: devify,
    fit: 'contain', // logo: show whole image instead of cropping
    link: 'https://www.figma.com/proto/RcEAgcitjEzZQlW6RD0miK/DEVIFY?node-id=499-726&p=f&m=draw&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=499%3A712&page-id=440%3A281&t=R0XNP1WNOUqqwGrM-1',
  },
  {
    id: 2,
    tags: ['Web Design', 'UI/UX', 'Figma'],
    name: 'LetsGo',
    desc: 'Real time activity tracking app to join different activities base on your interest and location.',
    theme: 'theme-blue',
    image: letsgo, // ← public/projects/letsgo.png
    link: 'https://www.figma.com/proto/BZBrT1mz1qnNmV2bs9eoQO/Let-s-GO?page-id=243%3A640&node-id=243-641&p=f&viewport=256%2C99%2C0.03&t=JXHfD3RKYXBdXGi6-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=243%3A641',
  },
  {
    id: 3,
    emoji: '📓',
    tags: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    name: 'Task Tracker App',
    desc: 'awesome todos app.',
    theme: 'theme-dark',
    image: '/logo/tasktracker.png', 
    link: 'https://awesometodos-nd1t.onrender.com',
  },
  {
    id: 4,
    tags: ['React', 'Supabase', 'Vite','javascript','css'],
    name: 'SyncTask',
    desc: 'Task tracker on projects for fair task contribution.',
    theme: 'theme-purple',
    image: synctask, 
    fit: 'contain',
    link: 'https://synctask-kohl.vercel.app/',
  },
  {
    id: 5,
    tags: ['React', 'css'],
    name: 'V1 portfolio',
    desc: 'Myfirst portfolio',
    theme: 'theme-purple',
    image: '',
    link: 'https://rochellefayeoro02-portfolio.vercel.app/',
  },
];


const ENTRANCES = [
  { fx: '-110px', fy: '0px' },
  { fx: '0px', fy: '90px' },
  { fx: '110px', fy: '0px' },
];

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [shown, setShown] = useState(false);

 
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const enter = ENTRANCES[index % 3];

  const hasLink = Boolean(project.link);
  const showImage = Boolean(project.image) && !imgFailed;
  const Tag = hasLink ? 'a' : 'div';
  const linkProps = hasLink
    ? { href: project.link, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  
  const handleMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Tag
      ref={cardRef}
      className={`project-card reveal ${shown ? 'is-visible' : ''} ${hasLink ? '' : 'is-empty'}`}
      style={{ '--fx': enter.fx, '--fy': enter.fy, '--delay': `${(index % 3) * 130}ms` }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...linkProps}
    >
      <div className={`project-thumb ${project.theme}`}>
        {showImage ? (
          <img
            className={`project-image ${project.fit === 'contain' ? 'is-contain' : ''}`}
            src={project.image}
            alt={`${project.name} preview`}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="project-emoji">{project.emoji || project.name.charAt(0)}</span>
        )}
        <div className="project-overlay">
          <span className="overlay-icon">{hasLink ? '↗' : '✦'}</span>
          <span className="overlay-text">{hasLink ? 'View Live' : 'Coming soon'}</span>
        </div>
      </div>

      <div className="project-info">
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-tag">{tag}</span>
          ))}
        </div>
        <h3 className="project-name">{project.name}</h3>
        <p className="project-desc">{project.desc}</p>
        <div className="project-link">
          <span className="link-text">{hasLink ? 'View Project' : 'Coming soon'}</span>
          {hasLink && <span className="link-arrow"></span>}
        </div>
      </div>
    </Tag>
  );
}

export default function Projects() {
  return (
    <section className="projects-section">
      <div className="section-tag">My Work</div>
      <h2 className="section-title">
        Featured <span className="highlight">Projects</span>
      </h2>

      <div className="projects-grid">
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}