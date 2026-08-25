import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    showToast('Message sent — we will reply within 24 hours');
  }

  return (
    <div className="section" style={{ paddingTop: 48 }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <span className="eyebrow">Contact</span>
        <h1 style={{ margin: '12px 0 24px', fontSize: 34 }}>Get in touch</h1>
        {sent ? (
          <p>Thanks for reaching out — our team will get back to you shortly.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}
