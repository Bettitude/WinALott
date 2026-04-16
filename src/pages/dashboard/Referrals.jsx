import { useState } from 'react';
import { FiUsers, FiGift, FiCopy, FiCheck, FiShare2, FiCheckCircle, FiClock } from 'react-icons/fi';
import { referralData } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';

const STATUS_STYLE = {
  active:  { label: 'Active',  text: 'text-green-700',  bg: 'bg-green-50'  },
  pending: { label: 'Pending', text: 'text-yellow-700', bg: 'bg-yellow-50' },
};

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#1A4D8F] text-white flex items-center justify-center text-sm font-black shrink-0">
        {number}
      </div>
      <div>
        <p className="font-bold text-[#1A1A2E] text-sm">{title}</p>
        <p className="text-gray-400 text-sm mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const data       = referralData;
  const refCode    = user?.username ? `${user.username.toUpperCase()}-REF` : data.code;
  const refLink    = `https://winalott.com/auth/signup?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join WinALot!',
        text: `Use my referral link to join WinALot and we both get $0.50 when you buy your first ticket!`,
        url: refLink,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const stats = [
    { label: 'Total Referrals',  value: data.totalReferrals,  icon: FiUsers,  color: 'text-[#1A4D8F]', bg: 'bg-blue-50',   border: 'border-l-[#1A4D8F]' },
    { label: 'Active Referrals', value: data.activeReferrals, icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-l-green-400' },
    { label: 'Total Earned',     value: `$${(data.totalEarned / 100).toFixed(2)}`,  icon: FiGift, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-l-yellow-400' },
    { label: 'Pending Bonus',    value: `$${(data.pendingEarned / 100).toFixed(2)}`, icon: FiClock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-l-orange-400' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1A1A2E]">Referral Program</h1>
        <p className="text-gray-400 text-sm">Invite friends, earn $0.50 for every friend who buys their first ticket</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 border-l-4 ${s.border}`}>
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link card */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-5 text-white mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/5 rounded-full" />
        <div className="absolute -right-0 -bottom-6 w-20 h-20 bg-[#F5C518]/10 rounded-full" />
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Your Referral Code</p>
        <p className="text-2xl font-black tracking-widest mb-4">{refCode}</p>

        <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <p className="text-xs text-white/80 font-mono flex-1 truncate">{refLink}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F5C518] text-[#1A1A2E] font-black py-2.5 rounded-xl text-sm hover:brightness-110 transition-all">
            {copied ? <><FiCheck className="w-4 h-4" />Copied!</> : <><FiCopy className="w-4 h-4" />Copy Link</>}
          </button>
          <button onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-white/20 transition-all">
            <FiShare2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <FiGift className="w-4 h-4 text-[#F5C518]" /> How It Works
          </h2>
          <div className="space-y-4">
            <Step number="1" title="Share Your Link"    desc="Copy your referral link and share it with friends on WhatsApp, Twitter, or anywhere." />
            <Step number="2" title="Friend Signs Up"    desc="Your friend registers using your link. No purchase required yet." />
            <Step number="3" title="They Buy a Ticket"  desc="When your friend buys their first ticket, both of you get $0.50 credited to your wallets." />
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold text-[#1A1A2E] mb-4">Referral Terms</h2>
          <ul className="space-y-2.5">
            {[
              'Earn $0.50 per referral when they purchase their first ticket.',
              'Referral bonus is credited within 24 hours of the qualifying purchase.',
              'Self-referrals (using your own link) are not allowed.',
              'There is no cap — refer as many friends as you like.',
              'Bonuses are added to your WinALot wallet balance.',
              'WinALot reserves the right to review suspicious referral activity.',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Referral history */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1A1A2E]">Referral History</h2>
        </div>

        {data.history.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-9 h-9 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No referrals yet</p>
            <p className="text-gray-300 text-xs mt-1">Share your link to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-400 font-medium">
                  <th className="text-left px-5 py-3">Username</th>
                  <th className="text-left py-3">Joined</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-right py-3 pr-5">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map(r => {
                  const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                  return (
                    <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1A4D8F]/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#1A4D8F]">{r.username.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#1A1A2E]">{r.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-xs text-gray-400">{r.joinedDate}</td>
                      <td className="py-3.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3.5 pr-5 text-right">
                        <span className={`text-xs font-black ${r.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                          {r.status === 'active' ? `+$${(r.bonus / 100).toFixed(2)}` : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
