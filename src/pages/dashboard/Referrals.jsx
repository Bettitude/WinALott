import { useState } from 'react';
import { FiUsers, FiGift, FiCopy, FiCheck, FiShare2, FiCheckCircle, FiClock,
         FiMail, FiSend, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const STATUS_STYLE = {
  active:  { label: 'Active',  text: 'text-green-700',  bg: 'bg-green-50 dark:bg-green-950/40'  },
  pending: { label: 'Pending', text: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
};

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#1A4D8F] text-white flex items-center justify-center text-sm font-black shrink-0">
        {number}
      </div>
      <div>
        <p className="font-bold text-[#1A1A2E] dark:text-slate-200 text-sm">{title}</p>
        <p className="text-gray-400 dark:text-slate-500 text-sm mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

export default function Referrals() {
  const { user }  = useAuth();
  const [copied, setCopied] = useState(false);
  const [email, setEmail]   = useState('');
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [emailError, setEmailError] = useState('');

  const refCode = user?.username ? `${user.username.toUpperCase()}-REF` : 'YOUR-REF';
  const refLink = `https://winalott.com/auth/signup?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join WinALot!',
        text: 'Use my referral link to join WinALot and we both get $0.50 when you buy your first ticket!',
        url: refLink,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (sentEmails.includes(trimmed)) {
      setEmailError('Invite already sent to this email.');
      return;
    }
    setEmailError('');
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSentEmails(prev => [...prev, trimmed]);
    setEmail('');
    setSending(false);
  };

  const stats = [
    { label: 'Total Referrals',  value: 0,       icon: FiUsers,       color: 'text-[#1A4D8F]',  bg: 'bg-blue-50 dark:bg-blue-950/40',   border: 'border-l-[#1A4D8F]' },
    { label: 'Active Referrals', value: 0,       icon: FiCheckCircle, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/40',  border: 'border-l-green-400' },
    { label: 'Total Earned',     value: '$0.00', icon: FiGift,        color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/40', border: 'border-l-yellow-400' },
    { label: 'Pending Bonus',    value: '$0.00', icon: FiClock,       color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-l-orange-400' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-slate-100">Referral Program</h1>
        <p className="text-gray-400 dark:text-slate-500 text-sm">Invite friends, earn $0.50 for every friend who buys their first ticket</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 border-l-4 ${s.border}`}>
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link card */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] rounded-2xl p-5 text-white mb-5 relative overflow-hidden">
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

      {/* Email invite box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <FiMail className="w-4 h-4 text-[#1A4D8F]" />
          <h2 className="font-bold text-[#1A1A2E] dark:text-slate-200 text-sm">Invite by Email</h2>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
          Enter a friend's email and we'll send them a personalised invitation with your referral link.
        </p>

        <form onSubmit={handleSendInvite} className="flex gap-2">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); }}
              placeholder="friend@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-[#1A1A2E] dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/40 focus:border-[#1A4D8F] transition-colors"
            />
            {emailError && <p className="text-xs text-red-500 mt-1 pl-1">{emailError}</p>}
          </div>
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="flex items-center gap-2 bg-[#1A4D8F] hover:bg-[#0D2B5E] disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSend className="w-4 h-4" />
            )}
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>

        {/* Sent invites list */}
        {sentEmails.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide font-semibold">Invites sent this session</p>
            {sentEmails.map(addr => (
              <div key={addr} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
                <FiCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="truncate">{addr}</span>
                <span className="ml-auto text-[10px] text-green-600 dark:text-green-400 font-bold shrink-0">Sent</span>
              </div>
            ))}
          </div>
        )}

        {/* Preview of what the invite looks like */}
        <details className="mt-4">
          <summary className="text-xs text-gray-400 dark:text-slate-500 cursor-pointer hover:text-[#1A4D8F] dark:hover:text-blue-400 transition-colors select-none">
            Preview invite email
          </summary>
          <div className="mt-3 border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden text-sm">
            <div className="bg-[#0D2B5E] px-4 py-3 text-white text-xs font-bold">
              bWinALOTT — You've been invited
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-4 space-y-2 text-gray-700 dark:text-slate-300 text-xs leading-relaxed">
              <p>Hey there,</p>
              <p>
                <strong>{user?.username || 'A friend'}</strong> is inviting you to join <strong>bWinALOTT</strong> —
                the free sweepstakes platform where you predict football results to win real prizes.
              </p>
              <p>Use their referral link to sign up and both of you get <strong>$0.50</strong> when you purchase your first ticket:</p>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 font-mono text-[#1A4D8F] dark:text-blue-400 break-all">
                {refLink}
              </div>
              <p className="flex items-center gap-1 text-[#1A4D8F] dark:text-blue-400 font-bold">
                Sign up now <FiArrowRight className="w-3 h-3" />
              </p>
            </div>
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-bold text-[#1A1A2E] dark:text-slate-200 mb-4 flex items-center gap-2">
            <FiGift className="w-4 h-4 text-[#F5C518]" /> How It Works
          </h2>
          <div className="space-y-4">
            <Step number="1" title="Share Your Link"   desc="Copy your referral link or send an email invite to friends." />
            <Step number="2" title="Friend Signs Up"   desc="Your friend registers using your link. No purchase required yet." />
            <Step number="3" title="They Buy a Ticket" desc="When your friend buys their first ticket, both of you get $0.50 credited to your wallets." />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <h2 className="font-bold text-[#1A1A2E] dark:text-slate-200 mb-4">Referral Terms</h2>
          <ul className="space-y-2.5">
            {[
              'Earn $0.50 per referral when they purchase their first ticket.',
              'Referral bonus is credited within 24 hours of the qualifying purchase.',
              'Self-referrals (using your own link) are not allowed.',
              'There is no cap — refer as many friends as you like.',
              'Bonuses are added to your WinALot wallet balance.',
              'WinALot reserves the right to review suspicious referral activity.',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-slate-400">
                <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Referral history placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-[#1A1A2E] dark:text-slate-200">Referral History</h2>
        </div>
        <div className="text-center py-12">
          <FiUsers className="w-9 h-9 text-gray-200 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-gray-400 dark:text-slate-500 text-sm">No referrals yet</p>
          <p className="text-gray-300 dark:text-slate-600 text-xs mt-1">Share your link to get started</p>
        </div>
      </div>
    </div>
  );
}
