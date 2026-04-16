import { FiShield, FiPhoneCall, FiExternalLink } from 'react-icons/fi';

const tips = [
  'Set a budget before you play and stick to it.',
  'Never chase losses — take a break if things aren\'t going your way.',
  'Keep track of how much time you spend on the platform.',
  'Playing should be fun, not a way to solve financial problems.',
  'Talk to someone you trust if you feel your play is becoming a problem.',
  'Use our self-exclusion tool if you need to take a break.',
];

const resources = [
  { name: 'GamCare', url: '#', desc: 'Free support for anyone affected by gambling problems.' },
  { name: 'BeGambleAware', url: '#', desc: 'Confidential information, advice and support.' },
  { name: 'Gamblers Anonymous', url: '#', desc: '12-step fellowship for people with gambling problems.' },
  { name: 'National Problem Gambling Helpline', url: '#', desc: 'Call 1-800-522-4700 (US) 24/7.' },
];

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
                <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1A4D8F] font-bold flex items-center justify-center text-xs shrink-0">{i+1}</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-4">Self-Exclusion</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            If you feel you need a break from WinALot, you can request a self-exclusion period from your dashboard or by contacting our support team. Self-exclusion can be set for 1 month, 3 months, 6 months, or permanently.
          </p>
          <button className="bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
            Request Self-Exclusion
          </button>
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
                <a href={r.url} className="text-[#1A4D8F] hover:text-[#0D2B5E] shrink-0">
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
