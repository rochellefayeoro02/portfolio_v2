// Contact.jsx
import { useEffect, useRef, useState } from 'react';
import './styles.css';

/* ─────────────────────────────────────────────────────────────
   ✉️  SEND MESSAGES TO YOUR INBOX (free, ~2 minutes, no backend)

   1. Go to https://web3forms.com
   2. Enter ororochellefaye0226@gmail.com → "Create Access Key"
   3. The key is emailed to you. Paste it below.

   Visitors fill in the form → you get the message in your Gmail,
   with Reply-To set to their email. (The access key is meant to be
   public, so it's safe in front-end code.)

   Until you paste a key, the form falls back to opening the
   visitor's email app with the message already written.
   ───────────────────────────────────────────────────────────── */
const WEB3FORMS_KEY = 'efc786f4-e22f-42f4-8c8d-7fd3e7e47172';
const MY_EMAIL = 'ororochellefaye0226@gmail.com';
const FORM_READY = !WEB3FORMS_KEY.startsWith('YOUR_');

const CONTACT_ITEMS = [
  {
    icon: '📧',
    label: 'Email',
    value: 'ororochellefaye0226@gmail.com',
    link: 'mailto:ororochellefaye0226@gmail.com',
  },
  {
    icon: '💻',
    label: 'GitHub',
    value: 'github.com/rochellefayeoro02',
    link: 'https://github.com/rochellefayeoro02',
  },
  {
    icon: '🔗',
    label: 'LinkedIn',
    value: 'linkedin.com/in/rochelle-faye-oro',
    link: 'https://www.linkedin.com/in/rochelle-faye-oro-3ba473372/',
  },
];

const EMPTY_FORM = { name: '', email: '', message: '', website: '' }; // website = spam trap

async function sendMessage({ name, email, message }) {
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `New portfolio message from ${name}`,
      from_name: 'Portfolio Contact Form',
      name,
      email,   // used as Reply-To
      message,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || 'Send failed');
}

function openMailApp({ name, email, message }) {
  const subject = encodeURIComponent(`New message from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${MY_EMAIL}?subject=${subject}&body=${body}`;
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [usedMailApp, setUsedMailApp] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleChange = (e) => {
    if (status === 'error') setStatus('idle');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const finish = () => {
    setStatus('sent');
    resetTimer.current = setTimeout(() => {
      setStatus('idle');
      setUsedMailApp(false);
      setForm(EMPTY_FORM);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;

    // Bots fill the hidden field; people never see it
    if (form.website) return finish();

    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };
    if (!data.name || !data.email || !data.message) return;

    setStatus('sending');
    try {
      if (FORM_READY) {
        await sendMessage(data);
      } else {
        openMailApp(data);
        setUsedMailApp(true);
      }
      finish();
    } catch (err) {
      console.error('Email failed:', err);
      setStatus('error');
    }
  };

  const busy = status === 'sending';
  const sent = status === 'sent';

  return (
    <section className="contact-section">
      <div className="section-tag">Get In Touch</div>
      <h2 className="section-title">
        Let's <span className="highlight">Connect</span>
      </h2>
      <p className="contact-subtitle">
        Have a project in mind? Reach out and let's create something amazing together.
      </p>

      <div className="contact-wrapper">
        {/* ── Left: Contact Info ── */}
        <div className="contact-info">
          {CONTACT_ITEMS.map((item) => {
            const isMail = item.link.startsWith('mailto:');
            return (
              <a
                key={item.label}
                href={item.link}
                className="contact-item"
                {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                <div className="contact-icon">{item.icon}</div>
                <div className="contact-details">
                  <div className="contact-label">{item.label}</div>
                  <div className="contact-value">{item.value}</div>
                </div>
                <div className="contact-arrow">→</div>
              </a>
            );
          })}
        </div>

        {/* ── Right: Contact Form ── */}
        <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
          <div className="form-field">
            <label className="form-label" htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              className="form-input"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              disabled={busy}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="contact-email">Email Address</label>
            <input
              id="contact-email"
              className="form-input"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@gmail.com"
              value={form.email}
              onChange={handleChange}
              disabled={busy}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              className="form-textarea"
              name="message"
              placeholder="Tell me about your project or inquiry..."
              value={form.message}
              onChange={handleChange}
              disabled={busy}
              maxLength={2000}
              required
              rows="5"
            />
          </div>

          {/* Spam trap: hidden from people, bots fill it in */}
          <input
            className="form-trap"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={handleChange}
          />

          <button
            type="submit"
            className={`btn-submit ${sent ? 'is-sent' : ''}`}
            disabled={busy || sent}
          >
            {sent ? (
              <>
                <span className="checkmark">✓</span>
                Message Sent!
              </>
            ) : busy ? (
              <>
                <span className="spinner" />
                Sending…
              </>
            ) : (
              <>
                Send Message
                <span className="send-icon">→</span>
              </>
            )}
          </button>

          <div className="form-status" aria-live="polite">
            {status === 'error' && (
              <p className="form-error" role="alert">
                Your message didn't send. Check your connection and try again, or email{' '}
                <a href={`mailto:${MY_EMAIL}`}>{MY_EMAIL}</a> directly.
              </p>
            )}
            {sent && usedMailApp && (
              <p className="form-note">
                Your email app opened with the message ready. Press send there to finish.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}