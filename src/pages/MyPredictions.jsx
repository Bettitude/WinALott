import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFlag, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw,
  FiGift, FiChevronRight, FiList,
} from 'react-icons/fi';
import { matchApi } from '../api/matchApi';

function isFinishedStatus(status) { return status === 'settled'; }

function StatusBadge({ entry }) {
  if (entry.status === 'open') {
    return <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2 py-0.5 rounded-full"><FiClock className="w-3 h-3" />Open</span>;
  }
  if (entry.status === 'closed') {
    return <span className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2 py-0.5 rounded-full"><FiClock className="w-3 h-3" />Awaiting result</span>;
  }
  const won = entry.correct_option === entry.option_key;
  return won
    ? <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2 py-0.5 rounded-full"><FiCheckCircle className="w-3 h-3" />Correct</span>
    : <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded-full"><FiXCircle className="w-3 h-3" />Wrong</span>;
}

export default function MyPredictions() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all'); // all | open | settled

  const load = () => {
    setLoading(true);
    matchApi.getMyFreeEntries()
      .then(res => setEntries(res.data?.data?.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter(e => {
    if (filter === 'open')    return e.status !== 'settled';
    if (filter === 'settled') return e.status === 'settled';
    return true;
  });

  const prizeLabel = e => e.prize_type === 'cash' ? `$${e.prize_usd} cash` : (e.prize_description || 'merch');
  const pickLabel  = e => e.options?.find(o => o.key === e.option_key)?.label || e.option_key;
  const correctLabel = e => e.options?.find(o => o.key === e.correct_option)?.label;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E] dark:text-white flex items-center gap-2">
            <FiFlag className="w-5 h-5 text-[#1A4D8F]" /> My Predictions
          </h1>
          <p className="text-sm text-gray-400 dark:text-slate-400 mt-1">Every free World Cup prediction you've made, in one place.</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" title="Refresh">
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[['all', 'All'], ['open', 'Open / Pending'], ['settled', 'Settled']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === v ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <FiList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold mb-3">No predictions yet</p>
          <Link to="/worldcup" className="inline-flex items-center gap-1.5 text-[#1A4D8F] dark:text-blue-400 font-semibold text-sm hover:underline">
            Browse World Cup matches <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <Link
              key={e.fixture_id}
              to={`/worldcup/match/${e.fixture_id}`}
              className="block bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#1A1A2E] dark:text-white">{e.home_team} vs {e.away_team}</span>
                <StatusBadge entry={e} />
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-400 mb-2">{e.question}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A4D8F] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg">
                  Your pick: {pickLabel(e)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
                  <FiGift className="w-3 h-3 text-[#F5C518]" /> Win {prizeLabel(e)}
                </span>
              </div>
              {isFinishedStatus(e.status) && e.correct_option && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-2">
                  Correct answer: <span className="font-semibold text-gray-600 dark:text-slate-300">{correctLabel(e)}</span>
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
