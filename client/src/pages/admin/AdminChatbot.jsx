import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AdminChatbot() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/chat/settings').then((res) => setSettings(res.data));
  }, []);

  async function save(updated) {
    const res = await api.put('/chat/settings', updated);
    setSettings(res.data);
    showToast(t('toast_chatbot_saved'));
  }

  if (!settings) return <div>{t('loading_text')}</div>;

  function addQuickQuestion() {
    if (!newQuestion.trim()) return;
    const updated = { ...settings, quickQuestions: [...settings.quickQuestions, newQuestion.trim()] };
    setSettings(updated);
    setNewQuestion('');
  }
  function removeQuickQuestion(idx) {
    setSettings({ ...settings, quickQuestions: settings.quickQuestions.filter((_, i) => i !== idx) });
  }

  function addFaq() {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setSettings({ ...settings, faqs: [...settings.faqs, newFaq] });
    setNewFaq({ question: '', answer: '' });
  }
  function removeFaq(idx) {
    setSettings({ ...settings, faqs: settings.faqs.filter((_, i) => i !== idx) });
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>{t('chatbot_settings_title')}</h2>
        <button className="btn btn-primary" onClick={() => save(settings)}>{t('btn_save_settings')}</button>
      </div>

      <div className="admin-form-section">
        <label className="checkbox-row" style={{ marginBottom: 16 }}>
          <input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} /> {t('chatbot_enabled')}
        </label>
        <div className="field">
          <label>{t('field_welcome_message')}</label>
          <textarea value={settings.welcomeMessage} onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })} />
        </div>
        <div className="field">
          <label>{t('field_store_info')}</label>
          <textarea value={settings.storeInfo} onChange={(e) => setSettings({ ...settings, storeInfo: e.target.value })} />
        </div>
        <div className="field">
          <label>{t('field_delivery_info')}</label>
          <textarea value={settings.deliveryInfo} onChange={(e) => setSettings({ ...settings, deliveryInfo: e.target.value })} />
        </div>
      </div>

      <div className="admin-form-section">
        <h4>{t('quick_questions')}</h4>
        <div className="tag-chip-input" style={{ marginBottom: 12 }}>
          {settings.quickQuestions.map((q, idx) => (
            <span className="tag-chip" key={idx}>{q} <button type="button" onClick={() => removeQuickQuestion(idx)}>×</button></span>
          ))}
        </div>
        <div className="flex gap-8">
          <input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder={t('add_quick_question_placeholder')} style={{ flex: 1, padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }} />
          <button type="button" className="btn btn-outline btn-sm" onClick={addQuickQuestion}>{t('btn_add')}</button>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>{t('faqs_title')}</h4>
        {settings.faqs.map((f, idx) => (
          <div key={idx} className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', padding: '10px 0' }}>
            <div>
              <strong style={{ fontSize: 14 }}>{f.question}</strong>
              <p className="text-muted" style={{ fontSize: 13 }}>{f.answer}</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--signal)' }} onClick={() => removeFaq(idx)}>{t('btn_remove')}</button>
          </div>
        ))}
        <div className="admin-form-grid" style={{ marginTop: 14 }}>
          <div className="field">
            <label>{t('field_question')}</label>
            <input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('field_answer')}</label>
            <input value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} />
          </div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={addFaq}>{t('btn_add_faq')}</button>
      </div>
    </div>
  );
}
