import { FiTarget, FiShield, FiTrendingUp, FiAward, FiStar } from 'react-icons/fi';

const points = [
  {
    icon: FiTarget,
    title: 'Multiple Markets',
    desc: 'Predict on corners, goals, cards, and more. Dozens of markets available every matchday.',
  },
  {
    icon: FiShield,
    title: 'Fair Play',
    desc: 'Random selection from pool of winners ensures everyone has an equal chance to win.',
  },
  {
    icon: FiTrendingUp,
    title: 'Bigger Pools',
    desc: 'More predictions, more chances to WinALot! The more players, the bigger the prize.',
  },
];

export default function WhyWinALot() {
  return (
    <section className="bg-[#1A4D8F] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Points */}
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
              Why <span className="text-[#F5C518]">WinALot?</span>
            </h2>

            <div className="relative">
              {points.map((point, i) => (
                <div key={i} className="flex gap-5 mb-8 last:mb-0 relative">
                  {/* Vertical line connector */}
                  {i < points.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-full bg-white/20" />
                  )}

                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#F5C518] flex items-center justify-center z-10">
                    <point.icon className="w-5 h-5 text-[#1A1A2E]" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{point.title}</h3>
                    <p className="text-blue-200 text-sm leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="flex justify-center">
            <div className="bg-[#F5C518] rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 text-center">
                {/* Trophy icon circle */}
                <div className="w-28 h-28 rounded-full bg-[#1A4D8F] border-4 border-white shadow-lg flex items-center justify-center mx-auto mb-4">
                  <FiAward className="w-14 h-14 text-[#F5C518]" />
                </div>
                <h3 className="text-2xl font-black text-[#1A1A2E] mb-2">You Could Be Next!</h3>
                <p className="text-sm text-[#1A1A2E]/80 font-medium mb-5">
                  Join thousands of winners who predict and win every week.
                </p>
                {/* Mini stat pills */}
                <div className="flex justify-center gap-2 mb-5">
                  {['12K+ Players', '500+ Winners', '$0.99 Entry'].map(stat => (
                    <span key={stat} className="text-xs bg-white/40 text-[#1A1A2E] font-bold px-2.5 py-1 rounded-full">
                      {stat}
                    </span>
                  ))}
                </div>
                <div className="bg-[#1A4D8F] text-white font-bold py-2.5 px-6 rounded-xl text-sm inline-flex items-center gap-2">
                  <FiStar className="w-3.5 h-3.5 text-[#F5C518]" />
                  Take a Side. Win the Pride.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
