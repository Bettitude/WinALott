import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const faqItems = [
  { q: 'What is WinALot?', a: 'WinALot is a football sweepstakes and prediction platform by Bettitude Inc. You buy tickets for specific football markets, and if your prediction matches the admin pick, you enter a random draw for prize money.' },
  { q: 'How much does a ticket cost?', a: 'Standard tickets cost $0.99 each. We also offer free BTGiveaway tickets periodically at no cost.' },
  { q: 'How are winners selected?', a: "All users whose prediction matches the admin's pick are entered into a random draw. Winners are selected randomly from this pool, ensuring fair play for everyone." },
  { q: 'What markets can I predict on?', a: 'We offer a wide range of markets including Corners, Total Goals, Total Cards, BTTS, Shots on Target, Fouls, Throw Ins, Penalties, and Goal Scorers.' },
  { q: 'When do draws take place?', a: 'Draws happen automatically after the match result is confirmed, typically within 2 hours of the final whistle.' },
  { q: 'How do I claim my winnings?', a: 'Winnings are credited to your WinALot account. You can request a withdrawal from your dashboard. Processing takes 1-3 business days.' },
  { q: 'What is the BTGiveaway?', a: 'BTGiveaway is our free-to-play tier. Selected matches are available with free tickets — no purchase required. Everyone gets a shot at winning.' },
  { q: 'Is there an age restriction?', a: 'Yes. You must be 18 years or older to participate on WinALot. We take responsible gambling seriously.' },
  { q: 'Can I add multiple tickets to my cart?', a: 'Yes! You can add tickets for multiple matches to your cart and check out in a single transaction.' },
  { q: 'What payment methods are accepted?', a: 'We accept payments via PayPal, Stripe, and bank transfer for users in Australia.' },
  { q: 'What happens if a match is cancelled?', a: 'If a match is cancelled or postponed before kick-off, all tickets for that match are fully refunded to your account.' },
];

const steps = [
  { n: 1, title: 'Create Your Account', desc: 'Sign up for free on WinALot. Just your name, email and you\'re in.' },
  { n: 2, title: 'Browse the Lobby', desc: 'Explore all active prediction markets. Filter by league, market type, or upcoming kickoff time.' },
  { n: 3, title: 'Choose Your Prediction', desc: 'Each match has an admin prediction. Decide: do you Agree (YES) or Disagree (NO)?' },
  { n: 4, title: 'Buy Your Ticket', desc: 'Tickets cost just $0.99. Free tickets are also available through BTGiveaway events.' },
  { n: 5, title: 'Watch & Wait', desc: 'Sit back and follow the match. Our platform tracks all results in real time.' },
  { n: 6, title: 'Match the Prediction', desc: 'If the final result matches the admin\'s pick AND your pick, you enter the prize draw.' },
  { n: 7, title: 'Win the Prize!', desc: 'Winners are randomly selected from all correct predictors. Claim your prize from your dashboard!' },
];

export default function HowToPlay() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      {/* Hero */}
      <div className="relative py-20 px-4 text-white text-center overflow-hidden min-h-[240px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0D2B5E]/72" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-3">How to Play</h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            WinALot is simple. Predict the outcome, buy a ticket, and if you're right — enter the draw to win!
          </p>
        </div>
      </div>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white text-center mb-10">Your 7-Step Guide</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1A4D8F] to-[#F5C518] hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#1A4D8F] text-white font-black flex items-center justify-center z-10 shadow-md">
                  {step.n}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 flex-1 card-hover">
                  <h3 className="font-bold text-[#1A1A2E] dark:text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticket tiers explainer */}
      <section className="bg-[#1A4D8F] py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-2">Ticket Pricing</h2>
          <p className="text-blue-200 text-sm mb-6">Clear, simple, fair.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Standard Ticket', price: '$0.99', badge: 'Per Match', color: 'bg-white', textColor: 'text-[#1A4D8F]' },
              { label: 'BTGiveaway Ticket', price: 'FREE', badge: 'Selected Matches', color: 'bg-[#F5C518]', textColor: 'text-[#1A1A2E]' },
            ].map(t => (
              <div key={t.label} className={`${t.color} rounded-2xl p-5 shadow-lg`}>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.badge}</span>
                <h3 className={`text-xl font-black ${t.textColor} mt-1`}>{t.label}</h3>
                <p className={`text-3xl font-black ${t.textColor} mt-2`}>{t.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-semibold text-[#1A1A2E] dark:text-white text-sm pr-4">{item.q}</span>
                {openFaq === i
                  ? <FiChevronUp className="w-4 h-4 text-[#1A4D8F] shrink-0" />
                  : <FiChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-gray-50 dark:border-slate-700">
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F5F7FA] dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 py-12 px-4 text-center">
        <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-3">Ready? Start Predicting</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">Join thousands of players on WinALot today.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth/signup"
            className="bg-[#1A4D8F] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
            Create Account
          </Link>
          <Link to="/lobby"
            className="border border-[#1A4D8F] text-[#1A4D8F] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
            Browse Lobby
          </Link>
        </div>
      </section>
    </div>
  );
}
