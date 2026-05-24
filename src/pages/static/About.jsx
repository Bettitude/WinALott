export default function About() {
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">About WinALot</h1>
        <p className="text-blue-200 max-w-lg mx-auto">Part of the Bettitude ecosystem — Australia's leading football sweepstakes platform.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-3">Our Story</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            WinALot was born from a simple idea: make football sweepstakes accessible, fair, and thrilling for every fan.
            Founded by Bettitude Inc. in 2017, we've grown from a small sports analytics blog into a comprehensive prediction and sweepstakes platform with thousands of active players.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-3">The Bettitude Ecosystem</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            WinALot is part of a family of products built to serve the football-obsessed fan:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Bettitude.com — Sports betting intelligence','BettiSports Blog — Football news & analysis','Probetpicks — Premium prediction tipsters','WinALot — Football sweepstakes platform'].map(p => (
              <div key={p} className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl p-3">
                <span className="w-1.5 h-1.5 bg-[#1A4D8F] rounded-full mt-1.5 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-[#1A1A2E] mb-3">Our Mission</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            To democratise football predictions and give every fan — regardless of budget — a fair shot at winning.
            We believe entertainment and fairness can coexist. That's why winners are always selected randomly from the correct predictors pool, not by the highest spender.
          </p>
        </div>
      </div>
    </div>
  );
}
