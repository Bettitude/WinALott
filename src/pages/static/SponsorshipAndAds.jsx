import { FiBarChart2, FiUsers, FiMonitor, FiCheck } from 'react-icons/fi';

const placements = [
  { name: 'Homepage Hero Banner', size: '1200 × 300', impressions: '50K+/day', price: 'from $299/week' },
  { name: 'Lobby Sidebar', size: '300 × 600', impressions: '30K+/day', price: 'from $149/week' },
  { name: 'Match Card Sponsor', size: 'Integrated card', impressions: '25K+/day', price: 'from $199/week' },
  { name: 'Email Newsletter', size: '600 × 200', impressions: '15K/send', price: 'from $99/send' },
];

export default function SponsorshipAndAds() {
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">Sponsorship & Ads</h1>
        <p className="text-blue-200 max-w-xl mx-auto">Reach thousands of passionate football fans on WinALot.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FiUsers, label: 'Monthly Users', value: '120K+' },
            { icon: FiBarChart2, label: 'Page Views/Month', value: '1.2M+' },
            { icon: FiMonitor, label: 'Avg. Session', value: '8 min' },
            { icon: FiUsers, label: 'Countries', value: '40+' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <s.icon className="w-4 h-4 text-[#1A4D8F]" />
              </div>
              <p className="text-xl font-black text-[#1A1A2E]">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Placement options */}
        <div>
          <h2 className="text-xl font-black text-[#1A1A2E] mb-4">Ad Placements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map(p => (
              <div key={p.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 card-hover">
                <h3 className="font-bold text-[#1A1A2E] mb-1">{p.name}</h3>
                <div className="space-y-1 text-xs text-gray-500 mt-2">
                  {[['Size', p.size],['Avg. Impressions', p.impressions],['Price', p.price]].map(([k,v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-semibold text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-[#1A4D8F] rounded-2xl p-6 text-white">
          <h2 className="text-xl font-black mb-4">Why Advertise With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Highly engaged football audience','Targeting by league or market type','Detailed weekly performance reports','Flexible budgets from $99/week','Friendly & responsive team','Fast campaign setup — live within 24 hours'].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-blue-100">
                <FiCheck className="w-4 h-4 text-[#F5C518] shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-4 text-sm">Ready to get your brand in front of football fans?</p>
          <a href="/partner-with-us"
            className="bg-[#1A4D8F] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
            Contact Our Ad Team
          </a>
        </div>
      </div>
    </div>
  );
}
