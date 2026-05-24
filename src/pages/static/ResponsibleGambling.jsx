import { useState } from 'react';
import { FiShield, FiPhoneCall, FiExternalLink, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { matchApi } from '../../api/matchApi';

const tips = [
  'Set a budget before you play and stick to it.',
  "Never chase losses — take a break if things aren't going your way.",
  'Keep track of how much time you spend on the platform.',
  'Playing should be fun, not a way to solve financial problems.',
  'Talk to someone you trust if you feel your play is becoming a problem.',
  'Use our self-exclusion tool if you need to take a break.',
];

const resources = [
  { name: 'GamCare',                          url: 'https://www.gamcare.org.uk',          desc: 'Free support for anyone affected by gambling problems.' },
  { name: 'BeGambleAware',                    url: 'https://www.begambleaware.org',        desc: 'Confidential information, advice and support.' },
  { name: 'Gamblers Anonymous',               url: 'https://www.gamblersanonymous.org',   desc: '12-step fellowship for people with gambling problems.' },
  { name: 'Gambling Help Online (Australia)', url: 'https://www.gamblinghelponline.org.au', desc: 'Call 1800 858 858 — free 24/7 support in Australia.' },
];

const DURATIONS = [
  { value: '1m',   label: '1 Month' },
  { value: '3m',   label: '3 Months' },
  { value: '6m',   label: '6 Months' },
  { value: 'perm', label: 'Permanently' },
];

function SelfExclusionForm() {
  const [duration, setDuration]   = useState('');
  const [reason, setReason]       = useState('');
  const [confirm, setConfirm]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!duration) { setError('Please select an exclusion period.'); return; }
    if (!confirm)  { setError('Please confirm you understand this action.'); return; }
    setError('');
    setLoading(true);
    try {
      await matchApi.requestSelfExclusion({ duration, reason });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Request failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FiCheck className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E] mb-2">Self-Exclusion Requested</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Your request has been received. Your account will be restricted for the selected period.
          You will receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
          Exclusion Period
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DURATIONS.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                duration === d.value
                  ? 'bg-[#1A4D8F] text-white border-[#1A4D8F]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="Tell us why you'd like to take a break..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/30 focus:border-[#1A4D8F]"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirm}
          onChange={e => setConfirm(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#1A4D8F] shrink-0"
        />
        <span className="text-sm text-gray-600 leading-relaxed">
          I understand that self-exclusion will restrict my access to WinALot for the selected period,
          and I will not be able to reverse this during the exclusion window.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          <FiAlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !duration || !confirm}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting…' : 'Request Self-Exclusion'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        You can also contact our support team at{' '}
        <a href="mailto:support@winalott.com" className="text-[#1A4D8F] hover:underline font-semibold">
          support@winalott.com
        </a>
      </p>
    </form>
  );
}

export default function ResponsibleGambling() {
  return (
    <div>
      <div className="bg-[#1A4D8F] py-14 px-4 text-white text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 rounded-full p-4">
            <FiShield className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-3">Responsible Gambling</h1>
        <p className="text-blue-200 max-w-xl mx-auto">
          WinALot is committed to providing a safe and responsible environment. Gambling should always be a form of entertainment.
        </p>
        <div className="inline-flex items-center bg-white text-[#1A4D8F] font-black text-lg px-4 py-2 rounded-xl mt-4">
          18+
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-4">Tips for Safe Play</h2>
          <ul className="space-y-3">
            {tips.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1A4D8F] font-bold flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-2">Self-Exclusion</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            If you feel you need a break from WinALot, use the form below to request a self-exclusion period.
            Self-exclusion can be set for 1 month, 3 months, 6 months, or permanently.
          </p>
          <SelfExclusionForm />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-4">Support Resources</h2>
          <div className="space-y-3">
            {resources.map(r => (
              <div key={r.name} className="flex items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <FiPhoneCall className="w-3.5 h-3.5 text-[#1A4D8F]" />
                    <p className="font-semibold text-sm text-[#1A1A2E]">{r.name}</p>
                  </div>
                  <p className="text-xs text-gray-400">{r.desc}</p>
                </div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#1A4D8F] hover:text-[#0D2B5E] shrink-0">
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
