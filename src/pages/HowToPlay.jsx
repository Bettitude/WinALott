import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { faqItems } from '../data/mockData';

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
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-16 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">How to Play</h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          WinALot is simple. Predict the outcome, buy a ticket, and if you're right — enter the draw to win!
        </p>
      </div>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-[#1A1A2E] text-center mb-10">Your 7-Step Guide</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1A4D8F] to-[#F5C518] hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#1A4D8F] text-white font-black flex items-center justify-center z-10 shadow-md">
                  {step.n}
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex-1 card-hover">
                  <h3 className="font-bold text-[#1A1A2E] mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
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
        <h2 className="text-2xl font-black text-[#1A1A2E] text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-semibold text-[#1A1A2E] text-sm pr-4">{item.q}</span>
                {openFaq === i
                  ? <FiChevronUp className="w-4 h-4 text-[#1A4D8F] shrink-0" />
                  : <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-gray-50">
                  <p className="text-sm text-gray-500 leading-relaxed pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F5F7FA] border-t border-gray-200 py-12 px-4 text-center">
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-3">Ready? Start Predicting</h2>
        <p className="text-gray-500 mb-6">Join thousands of players on WinALot today.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/auth/signup"
            className="bg-[#1A4D8F] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm">
            Create Account
          </Link>
          <Link to="/lobby"
            className="border border-[#1A4D8F] text-[#1A4D8F] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">
            Browse Lobby
          </Link>
        </div>
      </section>
    </div>
  );
}
