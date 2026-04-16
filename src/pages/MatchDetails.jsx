import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiShoppingCart, FiUsers, FiDollarSign, FiInfo } from 'react-icons/fi';
import CountdownTimer from '../components/ui/CountdownTimer';
import TeamAvatar from '../components/ui/TeamAvatar';
import { mockMatches } from '../data/mockData';
import { useCart } from '../hooks/useCart';

const tabs = ['Match Info', 'Stats', 'Line-ups', 'Standings', 'H2H', 'Odds/TV'];

const StatBar = ({ label, home, away }) => {
  const total = home + away || 1;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="font-semibold text-[#1A4D8F]">{home}</span>
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-600">{away}</span>
      </div>
      <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
        <div className="bg-[#1A4D8F] transition-all" style={{ width: `${(home / total) * 100}%` }} />
        <div className="bg-gray-300 flex-1" />
      </div>
    </div>
  );
};

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const match = mockMatches.find(m => m.id === matchId);
  const [pick, setPick] = useState(null);
  const [activeTab, setActiveTab] = useState('Match Info');
  const [addedCart, setAddedCart] = useState(false);

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-lg mb-4">Match not found</p>
        <button onClick={() => navigate('/lobby')} className="bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
          Back to Lobby
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      cartId: `${match.id}-${Date.now()}`,
      matchId: match.id,
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      market: match.market,
      pick: pick ? `${match.adminPick} (${pick})` : `${match.adminPick} (${match.adminPickValue})`,
      price: match.price,
    });
    setAddedCart(true);
    setTimeout(() => setAddedCart(false), 2000);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(21, 45, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Match Header */}
      <div className="bg-[#0D2B5E] rounded-2xl p-6 text-white mb-6">
        <p className="text-center text-xs text-blue-300 mb-4 uppercase tracking-widest font-medium">{match.league}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar short={match.homeTeam.short} size="xl" />
            <p className="font-bold text-sm text-center">{match.homeTeam.name}</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            {match.status === 'live' ? (
              <>
                <div className="flex items-center gap-1 bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-bold">{match.minute}</span>
                </div>
                <span className="text-4xl font-black">{match.score?.home} – {match.score?.away}</span>
              </>
            ) : (
              <>
                <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {match.date}
                </span>
                <div className="my-2">
                  <CountdownTimer targetDate={`${match.date}T${match.time}:00`} />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar short={match.awayTeam.short} size="xl" />
            <p className="font-bold text-sm text-center">{match.awayTeam.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
            <h3 className="font-bold text-[#1A1A2E] mb-4">Make Your Prediction</h3>

            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 mb-0.5">Admin Predicts:</p>
              <p className="font-bold text-[#1A4D8F]">{match.adminPick}</p>
              <p className="text-xs text-gray-400 mt-0.5">{match.market} Market</p>
            </div>

            <p className="text-sm text-gray-600 mb-3 font-medium">Do you agree with the admin?</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => setPick('YES')}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  pick === 'YES'
                    ? 'bg-[#1A4D8F] text-white border-[#1A4D8F] shadow-md'
                    : 'border-gray-200 text-gray-600 hover:border-[#1A4D8F] hover:text-[#1A4D8F]'
                }`}
              >
                {pick === 'YES' && <FiCheck className="w-4 h-4 inline mr-1" />}
                YES — Agree
              </button>
              <button
                onClick={() => setPick('NO')}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  pick === 'NO'
                    ? 'bg-gray-700 text-white border-gray-700 shadow-md'
                    : 'border-gray-200 text-gray-600 hover:border-gray-500 hover:text-gray-700'
                }`}
              >
                {pick === 'NO' && <FiCheck className="w-4 h-4 inline mr-1" />}
                NO — Disagree
              </button>
            </div>

            <div className="space-y-2 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><FiDollarSign className="w-3 h-3" /> Entry Fee</span>
                <span className="font-bold text-[#1A4D8F]">
                  {match.price === 0 ? 'FREE' : `$${match.price.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><FiUsers className="w-3 h-3" /> Max Winners</span>
                <span className="font-bold text-gray-700">{match.maxWinners}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><FiInfo className="w-3 h-3" /> Prize Pool</span>
                <span className="font-bold text-[#22C55E]">${match.prizePool.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={!pick}
                onClick={handleAddToCart}
                className="w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl hover:bg-[#0D2B5E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {match.price === 0 ? 'Enter Free' : 'Buy Ticket'}
              </button>
              <button
                disabled={!pick}
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 border rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  addedCart
                    ? 'bg-green-50 text-green-600 border-green-300'
                    : 'border-[#1A4D8F] text-[#1A4D8F] hover:bg-blue-50'
                }`}
              >
                <FiShoppingCart className="w-4 h-4" />
                {addedCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            {/* Tab nav */}
            <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === t
                      ? 'border-[#1A4D8F] text-[#1A4D8F]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'Match Info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-400">Date:</span> <span className="font-medium ml-1">{match.date}</span></div>
                    <div><span className="text-gray-400">Time:</span> <span className="font-medium ml-1">{match.time}</span></div>
                    <div><span className="text-gray-400">Venue:</span> <span className="font-medium ml-1">Etihad Stadium</span></div>
                    <div><span className="text-gray-400">Referee:</span> <span className="font-medium ml-1">M. Oliver</span></div>
                    <div><span className="text-gray-400">Competition:</span> <span className="font-medium ml-1">{match.league}</span></div>
                    <div><span className="text-gray-400">Round:</span> <span className="font-medium ml-1">Matchday 33</span></div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">Recent Form</h4>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{match.homeTeam.name}</p>
                        <div className="flex gap-1">
                          {['W','W','D','L','W'].map((r,i) => (
                            <span key={i} className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center text-white ${r==='W'?'bg-green-500':r==='D'?'bg-yellow-400':' bg-red-500'}`}>{r}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{match.awayTeam.name}</p>
                        <div className="flex gap-1">
                          {['D','W','W','W','L'].map((r,i) => (
                            <span key={i} className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center text-white ${r==='W'?'bg-green-500':r==='D'?'bg-yellow-400':' bg-red-500'}`}>{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Stats' && (
                <div>
                  <h4 className="font-semibold text-sm text-[#1A1A2E] mb-4">Match Statistics</h4>
                  <StatBar label="Possession %" home={58} away={42} />
                  <StatBar label="Shots on Target" home={7} away={4} />
                  <StatBar label="Total Shots" home={14} away={9} />
                  <StatBar label="Corners" home={6} away={3} />
                  <StatBar label="Fouls" home={8} away={12} />
                  <StatBar label="Yellow Cards" home={1} away={2} />
                  <StatBar label="Offsides" home={2} away={1} />
                </div>
              )}

              {activeTab === 'Line-ups' && (
                <div className="text-center py-8">
                  <div className="bg-green-100 rounded-2xl p-6">
                    <p className="text-green-700 font-semibold text-sm">Line-ups will be available 1 hour before kick-off</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-left">
                      {[[match.homeTeam.name, ['GK: Ederson','RB: Walker','CB: Dias','CB: Akanji','LB: Gvardiol','CM: Rodri','CM: De Bruyne','RM: Bernardo','AM: Foden','SS: Doku','ST: Haaland']],
                        [match.awayTeam.name, ['GK: Sanchez','RB: James','CB: Colwill','CB: Fofana','LB: Cucurella','CM: Caicedo','CM: Fernandez','RM: Madueke','AM: Palmer','SS: Neto','ST: Jackson']]].map(([team, players]) => (
                        <div key={team}>
                          <p className="font-bold text-xs text-[#1A4D8F] mb-2">{team}</p>
                          {players.map((p,i) => (
                            <p key={i} className="text-xs text-gray-600 py-0.5 border-b border-gray-50">{p}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Standings' && (
                <div>
                  <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">{match.league} Table</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-100">
                          <th className="text-left py-2 pr-2 font-medium w-6">#</th>
                          <th className="text-left py-2 font-medium">Team</th>
                          <th className="py-2 font-medium text-center">P</th>
                          <th className="py-2 font-medium text-center">W</th>
                          <th className="py-2 font-medium text-center">D</th>
                          <th className="py-2 font-medium text-center">L</th>
                          <th className="py-2 font-medium text-center">GD</th>
                          <th className="py-2 font-medium text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[{pos:1,team:'Liverpool',p:33,w:22,d:7,l:4,gd:'+38',pts:73},{pos:2,team:'Arsenal',p:33,w:21,d:6,l:6,gd:'+31',pts:69},{pos:3,team:'Man City',p:33,w:20,d:5,l:8,gd:'+22',pts:65},{pos:4,team:'Chelsea',p:33,w:19,d:8,l:6,gd:'+18',pts:65},{pos:5,team:'Spurs',p:33,w:16,d:9,l:8,gd:'+11',pts:57}].map(row => (
                          <tr key={row.pos} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 pr-2 text-gray-400">{row.pos}</td>
                            <td className="py-2 font-medium text-gray-700">{row.team}</td>
                            <td className="py-2 text-center text-gray-500">{row.p}</td>
                            <td className="py-2 text-center text-gray-500">{row.w}</td>
                            <td className="py-2 text-center text-gray-500">{row.d}</td>
                            <td className="py-2 text-center text-gray-500">{row.l}</td>
                            <td className="py-2 text-center text-gray-500">{row.gd}</td>
                            <td className="py-2 text-center font-bold text-[#1A4D8F]">{row.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'H2H' && (
                <div>
                  <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">Last 5 Meetings</h4>
                  <div className="space-y-2">
                    {[['2024-11-23','Man City','3-0','Chelsea'],['2024-05-15','Chelsea','0-1','Man City'],['2024-02-17','Man City','1-0','Chelsea'],['2023-11-12','Chelsea','4-4','Man City'],['2023-05-20','Chelsea','0-1','Man City']].map(([date,h,score,a],i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                        <span className="text-gray-400 text-xs w-20">{date}</span>
                        <span className="font-medium text-gray-700 text-right flex-1">{h}</span>
                        <span className="font-black text-[#1A4D8F] px-3 bg-blue-50 rounded-lg mx-2">{score}</span>
                        <span className="font-medium text-gray-700 flex-1">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Odds/TV' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">Match Result Odds</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[['Home Win','2.10'],['Draw','3.40'],['Away Win','3.75']].map(([label,odd]) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-400 mb-1">{label}</p>
                          <p className="font-black text-[#1A4D8F]">{odd}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#1A1A2E] mb-3">Where to Watch</h4>
                    <div className="space-y-2 text-sm">
                      {['Sky Sports Main Event','BT Sport 1','NBC Sports (USA)','beIN Sports (MENA)'].map(ch => (
                        <div key={ch} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
                          <span className="w-2 h-2 bg-[#22C55E] rounded-full" />
                          <span className="text-gray-600">{ch}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
