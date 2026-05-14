import { useState } from 'react';
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
  { q: 'What payment methods are accepted?', a: 'We accept major debit/credit cards and support payments via Flutterwave for users in Africa.' },
  { q: 'What happens if a match is cancelled?', a: 'If a match is cancelled or postponed before kick-off, all tickets for that match are fully refunded to your account.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">FAQs</h1>
        <p className="text-blue-200 max-w-md mx-auto">Everything you need to know about WinALot.</p>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-3">
        {faqItems.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left">
              <span className="font-semibold text-[#1A1A2E] text-sm pr-4">{item.q}</span>
              {open === i ? <FiChevronUp className="w-4 h-4 text-[#1A4D8F] shrink-0" /> : <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-4 border-t border-gray-50">
                <p className="text-sm text-gray-500 leading-relaxed pt-3">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
