import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ChatbotWidget() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api
      .get('/chat/settings')
      .then((res) => {
        setSettings(res.data);
        setMessages([{ role: 'bot', text: res.data.welcomeMessage, products: [] }]);
      })
      .catch(() => {
        setSettings({ enabled: true, welcomeMessage: t('chat_title'), quickQuestions: [] });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!settings || settings.enabled === false) return null;

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setSending(true);
    try {
      const res = await api.post('/chat', { message: trimmed, language });
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: res.data.reply, products: res.data.products || [] }
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: t('chat_error'), products: [] }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        className="chatbot-fab"
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div>
              <strong>{t('chat_title')}</strong>
              <div className="text-muted" style={{ fontSize: 12 }}>{t('chat_subtitle')}</div>
            </div>
          </div>

          <div className="chatbot-body" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role}`}>
                <p>{m.text}</p>
                {m.products?.length > 0 && (
                  <div className="chat-product-list">
                    {m.products.map((p) => (
                      <Link to={`/phones/${p.slug}`} key={p.id} className="chat-product-item" onClick={() => setOpen(false)}>
                        <img src={p.image} alt={p.title} />
                        <div>
                          <div className="chat-product-title">{p.title}</div>
                          <div className="mono" style={{ fontSize: 12 }}>${p.price?.toFixed(2)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="chat-bubble bot">
                <span className="typing-dots"><span></span><span></span><span></span></span>
              </div>
            )}
          </div>

          {messages.length <= 1 && settings.quickQuestions?.length > 0 && (
            <div className="chat-quick-questions">
              {settings.quickQuestions.slice(0, 4).map((q) => (
                <button key={q} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          <form
            className="chatbot-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              placeholder={t('chat_placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-signal btn-sm" disabled={sending}>
              {t('chat_send')}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
