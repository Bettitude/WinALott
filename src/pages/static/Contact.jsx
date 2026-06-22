import { useState } from 'react';
import { FiMail, FiMessageCircle, FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject required';
    if (!form.message.trim()) e.message = 'Message required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/enquiries`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ category: 'contact', ...form }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Something went wrong. Please try again.');
      }
      setSent(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">Contact Us</h1>
        <p className="text-blue-200">We're here to help. Reach out any time.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#1A1A2E]">Get in Touch</h2>
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <FiMail className="w-4 h-4 text-[#1A4D8F]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">Email Support</p>
              <p className="text-xs text-gray-400">support@winalot.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <FiMessageCircle className="w-4 h-4 text-[#1A4D8F]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1A1A2E]">Live Chat</p>
              <p className="text-xs text-gray-400">Available Mon–Fri, 9am–6pm WAT</p>
            </div>
          </div>
          <div className="bg-[#1A4D8F] rounded-2xl p-5 text-white">
            <p className="font-bold mb-2">Response Times</p>
            <p className="text-sm text-blue-200">General enquiries: 24–48 hours</p>
            <p className="text-sm text-blue-200">Payments & winnings: 4–8 hours</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-bold text-[#1A1A2E] mb-1">Message sent!</h3>
              <p className="text-gray-500 text-sm">We'll get back to you within 24–48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}
              {[
                { k: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                { k: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                { k: 'subject', label: 'Subject', type: 'text', placeholder: 'How can we help?' },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors[f.k] ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors[f.k] && <p className="text-red-500 text-xs mt-1">{errors[f.k]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={4} placeholder="Describe your issue…"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] resize-none ${errors.message ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                <FiSend className="w-4 h-4" />
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
