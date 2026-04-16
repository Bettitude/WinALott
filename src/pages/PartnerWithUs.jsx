import { useState } from 'react';
import { FiCheck, FiSend, FiMonitor, FiLink, FiBarChart2 } from 'react-icons/fi';

const tiers = [
  {
    name: 'Ad Sponsor',
    Icon: FiMonitor,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1A4D8F]',
    desc: 'Place your brand in front of thousands of active football fans.',
    benefits: ['Banner placement on Home & Lobby pages', 'Sponsored match cards', 'Weekly audience report', 'Flexible budget options'],
    cta: 'Become an Ad Sponsor',
    color: 'border-[#1A4D8F]',
    highlight: true,
  },
  {
    name: 'Affiliate Partner',
    Icon: FiLink,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    desc: 'Earn commissions by referring new players to WinALot.',
    benefits: ['Unique referral link & tracking', '15% commission on referred sales', 'Monthly payout', 'Dedicated affiliate dashboard'],
    cta: 'Join Affiliate Program',
    color: 'border-gray-200',
    highlight: false,
  },
  {
    name: 'Odds Provider',
    Icon: FiBarChart2,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    desc: 'Power our markets with your odds data and gain massive exposure.',
    benefits: ['API integration support', 'Featured provider badge', 'Co-branded match cards', 'Priority data ingestion'],
    cta: 'Partner as Odds Provider',
    color: 'border-gray-200',
    highlight: false,
  },
];

const partnershipTypes = ['Ad Sponsor', 'Affiliate Partner', 'Odds Provider', 'Other'];

export default function PartnerWithUs() {
  const [form, setForm] = useState({ name: '', company: '', email: '', type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.type) e.type = 'Select a partnership type';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-16 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">Grow With WinALot</h1>
        <p className="text-blue-200 max-w-xl mx-auto text-lg">
          Join the Bettitude ecosystem. Partner with us to reach thousands of passionate football fans.
        </p>
      </div>

      {/* Partnership tiers */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-[#1A1A2E] text-center mb-8">Partnership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map(t => (
            <div key={t.name} className={`bg-white rounded-2xl border-2 shadow-md p-6 relative ${t.color} card-hover`}>
              {t.highlight && (
                <div className="absolute top-4 right-4 bg-[#F5C518] text-[#1A1A2E] text-xs font-black px-2 py-0.5 rounded-full">
                  Most Popular
                </div>
              )}
              <div className={`w-12 h-12 rounded-2xl ${t.iconBg} flex items-center justify-center mb-3`}>
                <t.Icon className={`w-6 h-6 ${t.iconColor}`} />
              </div>
              <h3 className="text-lg font-black text-[#1A1A2E] mb-1">{t.name}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t.desc}</p>
              <ul className="space-y-2 mb-5">
                {t.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-[#22C55E] mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  t.highlight
                    ? 'bg-[#1A4D8F] text-white hover:bg-[#0D2B5E]'
                    : 'border border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section id="contact-form" className="max-w-2xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Get in Touch</h2>
          <p className="text-gray-500 text-sm mb-6">Fill in the form and our partnerships team will reach out within 24 hours.</p>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-bold text-[#1A1A2E] mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm">Our team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                  <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.email ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Partnership Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] ${errors.type ? 'border-red-400' : 'border-gray-200'}`}>
                  <option value="">Select type…</option>
                  {partnershipTypes.map(t => <option key={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)}
                  rows={4} placeholder="Tell us about your proposal…"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F] resize-none ${errors.message ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                <FiSend className="w-4 h-4" />
                {loading ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
