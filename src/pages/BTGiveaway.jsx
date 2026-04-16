import { Link } from 'react-router-dom';
import { FiGift, FiCheck } from 'react-icons/fi';
import MatchCard from '../components/ui/MatchCard';
import CountdownTimer from '../components/ui/CountdownTimer';
import { giveawayMatches } from '../data/mockData';

const rules = [
  'No purchase required — BTGiveaway tickets are completely free.',
  'Must have a verified WinALot account to enter.',
  'One free ticket per user per giveaway event.',
  'Your prediction must match the admin\'s pick to enter the draw.',
  'Winners are randomly selected from all correct predictors.',
  'Must be 18 years or older to participate.',
];

const nextDraw = new Date();
nextDraw.setDate(nextDraw.getDate() + 2);
nextDraw.setHours(22, 0, 0);

export default function BTGiveaway() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#F5C518] to-[#e0ad0e] py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-[#1A4D8F]" />
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-[#0D2B5E]" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white/30 rounded-full p-4">
              <FiGift className="w-10 h-10 text-[#1A1A2E]" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-[#1A1A2E] mb-3">BT Giveaway</h1>
          <p className="text-[#1A1A2E]/80 text-lg font-medium max-w-lg mx-auto">
            Your Free Shot at Big Prizes — No Purchase Needed
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-[#1A1A2E] text-center mb-8">How BTGiveaway Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { n: '01', title: 'Pick a Giveaway Match', desc: 'Browse the BTGiveaway matches below — marked with a FREE badge.' },
            { n: '02', title: 'Make Your Prediction', desc: 'Agree or disagree with the admin\'s prediction. No payment required!' },
            { n: '03', title: 'Enter the Draw', desc: 'If your prediction is correct, you\'re automatically entered in the prize draw.' },
          ].map(s => (
            <div key={s.n} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center card-hover">
              <div className="w-12 h-12 rounded-full bg-[#F5C518] text-[#1A1A2E] font-black text-lg flex items-center justify-center mx-auto mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-[#1A1A2E] mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next draw countdown */}
      <section className="bg-[#1A4D8F] py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-blue-200 text-sm font-medium mb-2">Next Giveaway Draw In</p>
          <div className="flex justify-center">
            <CountdownTimer targetDate={nextDraw.toISOString()} />
          </div>
          <p className="text-blue-300 text-xs mt-3">Winners selected automatically after match result</p>
        </div>
      </section>

      {/* Active giveaway matches */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-6">Active Giveaway Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveawayMatches.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
        {giveawayMatches.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <FiGift className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No active giveaway matches right now.</p>
            <p className="text-gray-300 text-sm">Check back soon!</p>
          </div>
        )}
      </section>

      {/* Entry rules */}
      <section className="max-w-2xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A2E] mb-4">Entry Rules</h3>
          <ul className="space-y-3">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
