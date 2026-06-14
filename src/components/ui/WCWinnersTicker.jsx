import { useState, useEffect } from 'react';
import { FiAward } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const MOCK_TICKER = [
  { username: 'mike23',    prize_usd: 10,  prize_type: 'cash',  home_team: 'Mexico',    away_team: 'South Africa' },
  { username: 'james99',   prize_usd: null, prize_type: 'merch', prize_description: 'WC Jersey', home_team: 'USA', away_team: 'Jamaica' },
  { username: 'sarah',     prize_usd: 15,  prize_type: 'cash',  home_team: 'Brazil',    away_team: 'Venezuela'   },
  { username: 'emma05',    prize_usd: 10,  prize_type: 'cash',  home_team: 'Argentina', away_team: 'Peru'        },
  { username: 'chris',     prize_usd: 20,  prize_type: 'cash',  home_team: 'France',    away_team: 'Belgium'     },
  { username: 'tom',       prize_usd: null, prize_type: 'merch', prize_description: 'Signed Ball', home_team: 'Germany', away_team: 'Spain' },
  { username: 'olivia',    prize_usd: 10,  prize_type: 'cash',  home_team: 'Portugal',  away_team: 'Morocco'     },
  { username: 'jack11',    prize_usd: 25,  prize_type: 'cash',  home_team: 'England',   away_team: 'Netherlands' },
  { username: 'amy',       prize_usd: 10,  prize_type: 'cash',  home_team: 'Mexico',    away_team: 'South Africa' },
  { username: 'liam',      prize_usd: 15,  prize_type: 'cash',  home_team: 'USA',       away_team: 'Jamaica'     },
  { username: 'sophie',    prize_usd: null, prize_type: 'merch', prize_description: 'WC Cap', home_team: 'Brazil', away_team: 'Venezuela' },
  { username: 'harry',     prize_usd: 10,  prize_type: 'cash',  home_team: 'France',    away_team: 'Belgium'     },
  { username: 'ben',       prize_usd: 20,  prize_type: 'cash',  home_team: 'Germany',   away_team: 'Spain'       },
  { username: 'zoe',       prize_usd: 10,  prize_type: 'cash',  home_team: 'Portugal',  away_team: 'Morocco'     },
  { username: 'ryan07',    prize_usd: 15,  prize_type: 'cash',  home_team: 'England',   away_team: 'Netherlands' },
  { username: 'charlotte', prize_usd: null, prize_type: 'merch', prize_description: 'WC Jersey', home_team: 'Argentina', away_team: 'Peru' },
];

export default function WCWinnersTicker() {
  const [items, setItems] = useState(MOCK_TICKER);

  useEffect(() => {
    fetch(`${API_BASE}/worldcup/ticker?limit=40`)
      .then(r => r.json())
      .then(d => { if (d.data?.length >= 4) setItems(d.data); })
      .catch(() => {});
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="bg-[#F5C518]/10 border-y border-[#F5C518]/20 h-10 flex items-center overflow-hidden shrink-0">
      {/* Label pill */}
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-[#F5C518]/20 h-full bg-[#F5C518]/10">
        <FiAward className="w-3.5 h-3.5 text-[#F5C518]" />
        <span className="text-[#F5C518] text-[11px] font-black uppercase tracking-wider whitespace-nowrap">Winners</span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden">
        <div className="wc-marquee-inner">
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="text-white/80 font-bold text-xs">{item.username}</span>
              {item.prize_type === 'cash' && item.prize_usd != null
                ? <span className="text-[#F5C518] font-black text-xs ml-1">+${Number(item.prize_usd).toFixed(2)}</span>
                : <span className="text-purple-300 font-black text-xs ml-1">{item.prize_description || 'Merch'}</span>
              }
              <span className="text-white/30 text-xs mx-2">·</span>
              <span className="text-white/50 text-xs">{item.home_team} vs {item.away_team}</span>
              <span className="mx-5 text-white/15 select-none">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
