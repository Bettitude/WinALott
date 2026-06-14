import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiGift, FiCheck, FiX, FiArrowRight, FiClock, FiAward,
  FiUser, FiTag, FiCalendar, FiLogIn, FiZap, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { matchApi } from '../api/matchApi';

// ─── Mock admin-configured giveaways ────────────────────────────────────────
// In production these come from GET /api/giveaways
const MOCK_GIVEAWAYS = [
  {
    id: 'g1',
    title: 'Arsenal vs Chelsea',
    league: 'Premier League',
    homeTeam: 'Arsenal', homeId: 42,
    awayTeam: 'Chelsea',  awayId: 49,
    matchDate: 'Today, 20:00',
    prizeType: 'walp',
    prizeDescription: '500 WALP (≈ $500 total)',
    prizePerWinner: 250,
    winnerCount: 2,
    entriesSoFar: 142,
    correctPoolSize: 67,
    closesAt: Date.now() + 2 * 60 * 60 * 1000,   // 2h from now
    status: 'open',
    questions: [
      { id: 'g1q1', text: 'How many Premier League titles has Arsenal won?', options: ['10','13','15','3'], correct: 'b', timeLimit: 20 },
      { id: 'g1q2', text: 'Which stadium do Arsenal play their home games at?', options: ['Stamford Bridge','Old Trafford','Emirates Stadium','Anfield'], correct: 'c', timeLimit: 20 },
      { id: 'g1q3', text: 'Who scored the most goals in the 2023/24 Arsenal season?', options: ['Saka','Havertz','Martinelli','Odegaard'], correct: 'b', timeLimit: 20 },
      { id: 'g1q4', text: "What colour is Chelsea's home kit?", options: ['Red','Blue','White','Yellow'], correct: 'b', timeLimit: 15 },
      { id: 'g1q5', text: "In which year did Arsenal win the \"Invincibles\" unbeaten league season?", options: ['2002','2003','2004','2005'], correct: 'c', timeLimit: 20 },
    ],
  },
  {
    id: 'g2',
    title: 'Real Madrid vs Barcelona',
    league: 'La Liga — El Clasico',
    homeTeam: 'Real Madrid', homeId: 541,
    awayTeam: 'Barcelona',   awayId: 529,
    matchDate: 'Tomorrow, 21:00',
    prizeType: 'physical',
    prizeDescription: 'Official signed Real Madrid jersey',
    prizePerWinner: 0,
    winnerCount: 1,
    entriesSoFar: 89,
    correctPoolSize: 43,
    closesAt: Date.now() + 18 * 60 * 60 * 1000,  // 18h from now
    status: 'open',
    questions: [
      { id: 'g2q1', text: "How many Ballon d'Or awards has Lionel Messi won?", options: ['6','7','8','9'], correct: 'c', timeLimit: 25 },
      { id: 'g2q2', text: 'Which club did Ronaldo join after leaving Real Madrid in 2018?', options: ['PSG','Man United','Juventus','Inter Miami'], correct: 'c', timeLimit: 20 },
      { id: 'g2q3', text: 'In which city is the Santiago Bernabéu stadium located?', options: ['Barcelona','Madrid','Seville','Valencia'], correct: 'b', timeLimit: 20 },
    ],
  },
  {
    id: 'g3',
    title: 'Man City vs Liverpool',
    league: 'Premier League',
    homeTeam: 'Man City',  homeId: 50,
    awayTeam: 'Liverpool', awayId: 40,
    matchDate: 'Sat, 31 May, 17:30',
    prizeType: 'walp',
    prizeDescription: '200 WALP each (3 winners)',
    prizePerWinner: 200,
    winnerCount: 3,
    entriesSoFar: 201,
    correctPoolSize: 28,
    closesAt: Date.now() + 72 * 60 * 60 * 1000,  // 3 days
    status: 'open',
    questions: [
      { id: 'g3q1', text: 'How many times has Liverpool won the UEFA Champions League?', options: ['4','5','6','7'], correct: 'c', timeLimit: 20 },
      { id: 'g3q2', text: "Who is Man City's all-time top scorer?", options: ['Kun Agüero','Erling Haaland','Carlos Tevez','Gabriel Jesus'], correct: 'a', timeLimit: 20 },
      { id: 'g3q3', text: 'In what year did Man City first win the Premier League?', options: ['2010','2011','2012','2013'], correct: 'c', timeLimit: 20 },
      { id: 'g3q4', text: "Which Liverpool manager led the club to their 6th Champions League title?", options: ['Rafa Benitez','Jurgen Klopp','Kenny Dalglish','Bob Paisley'], correct: 'b', timeLimit: 20 },
    ],
  },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ─── Countdown hook ──────────────────────────────────────────────────────────
function useCountdownMs(targetMs) {
  const [ms, setMs] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function TeamLogo({ id, name, size = 36 }) {
  const [err, setErr] = useState(false);
  if (!id || err) {
    return (
      <div style={{ width: size, height: size }}
        className="rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-black text-gray-400 shrink-0">
        {name?.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img src={`https://media.api-sports.io/football/teams/${id}.png`} alt={name}
      style={{ width: size, height: size }}
      className="object-contain shrink-0" onError={() => setErr(true)} />
  );
}

// ─── Giveaway Card ───────────────────────────────────────────────────────────
function GiveawayCard({ g, onTakeQuiz, entry }) {
  const closes = useCountdownMs(g.closesAt);
  const fill   = Math.round((g.entriesSoFar / 300) * 100); // 300 max for display

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden card-hover flex flex-col">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-[#0D2B5E] to-[#1A4D8F] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FiGift className="w-3.5 h-3.5 text-[#F5C518]" />
          <span className="text-[10px] font-black text-white uppercase tracking-wide">WAL Giveaway</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          FREE ENTRY
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Teams */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <TeamLogo id={g.homeId} name={g.homeTeam} size={40} />
            <p className="text-xs font-bold text-[#1A1A2E] text-center leading-tight truncate w-full">{g.homeTeam}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">VS</span>
            <span className="text-[9px] text-gray-400 text-center leading-tight">{g.matchDate}</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <TeamLogo id={g.awayId} name={g.awayTeam} size={40} />
            <p className="text-xs font-bold text-[#1A1A2E] text-center leading-tight truncate w-full">{g.awayTeam}</p>
          </div>
        </div>

        {/* League */}
        <p className="text-[10px] text-gray-400 text-center mb-3">{g.league}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-[#1A4D8F]">{g.questions.length}</p>
            <p className="text-[9px] text-gray-400 leading-tight">Questions</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-[#1A4D8F]">{g.winnerCount}</p>
            <p className="text-[9px] text-gray-400 leading-tight">Winners</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-[#1A4D8F]">{g.entriesSoFar}</p>
            <p className="text-[9px] text-gray-400 leading-tight">Entries</p>
          </div>
        </div>

        {/* Prize */}
        <div className="flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl px-3 py-2 mb-3">
          <FiAward className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
          <p className="text-xs font-bold text-[#1A1A2E]">{g.prizeDescription}</p>
        </div>

        {/* Closes in */}
        <div className="flex items-center gap-1.5 mb-3">
          <FiClock className="w-3 h-3 text-orange-400 shrink-0" />
          <span className="text-[10px] text-orange-500 font-bold">Closes in {closes}</span>
        </div>

        {/* CTA */}
        {entry ? (
          <div className={`w-full py-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5 ${
            entry.allCorrect
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {entry.allCorrect
              ? <><FiCheck className="w-3.5 h-3.5" /> {entry.correct}/{entry.total} correct — In the pool!</>
              : <><FiX className="w-3.5 h-3.5" /> {entry.correct}/{entry.total} correct — Better luck next time</>
            }
          </div>
        ) : (
          <button
            onClick={() => onTakeQuiz(g)}
            className="w-full bg-[#F5C518] text-[#1A1A2E] font-black py-2.5 rounded-xl text-xs hover:brightness-105 transition-all flex items-center justify-center gap-1.5 mt-auto"
          >
            <FiZap className="w-3.5 h-3.5" /> Take Quiz Now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Quiz Modal ──────────────────────────────────────────────────────────────
function QuizModal({ g, onClose, onComplete }) {
  const [phase, setPhase]       = useState('intro');   // intro | question | result
  const [qIdx, setQIdx]         = useState(0);
  const [selected, setSelected] = useState(null);      // 'a'|'b'|'c'|'d'
  const [answers, setAnswers]   = useState([]);         // [{correct, selected}]
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef                = useRef(null);

  const currentQ = g.questions[qIdx];
  const totalQ   = g.questions.length;

  // Start timer for current question
  useEffect(() => {
    if (phase !== 'question') return;
    setTimeLeft(currentQ.timeLimit);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-advance: mark as wrong if nothing selected
          advanceQuestion(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, phase]);

  const advanceQuestion = (chosenOption) => {
    clearInterval(timerRef.current);
    const isCorrect = chosenOption === currentQ.correct;
    const updatedAnswers = [...answers, { correct: isCorrect, selected: chosenOption }];
    setAnswers(updatedAnswers);
    setSelected(null);

    if (qIdx + 1 < totalQ) {
      setQIdx(q => q + 1);
    } else {
      const correctCount = updatedAnswers.filter(a => a.correct).length;
      const allCorrect   = correctCount === totalQ;
      setPhase('result');
      onComplete(g.id, { total: totalQ, correct: correctCount, allCorrect, answers: updatedAnswers });
    }
  };

  const handleNext = () => {
    if (!selected) return;
    advanceQuestion(selected);
  };

  const timerPct = Math.round((timeLeft / currentQ?.timeLimit) * 100);
  const timerDanger = timeLeft <= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* ── INTRO ──────────────────────────────────────── */}
        {phase === 'intro' && (
          <>
            <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] px-5 pt-5 pb-4 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiGift className="w-5 h-5 text-[#F5C518]" />
                  <span className="text-sm font-black">WAL Giveaway</span>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <FiX className="w-4 h-4 text-blue-300" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="flex flex-col items-center gap-1">
                  <TeamLogo id={g.homeId} name={g.homeTeam} size={40} />
                  <span className="text-xs font-bold text-white text-center">{g.homeTeam}</span>
                </div>
                <span className="text-blue-300 font-black text-sm">VS</span>
                <div className="flex flex-col items-center gap-1">
                  <TeamLogo id={g.awayId} name={g.awayTeam} size={40} />
                  <span className="text-xs font-bold text-white text-center">{g.awayTeam}</span>
                </div>
              </div>
              <p className="text-center text-blue-300 text-xs">{g.league} · {g.matchDate}</p>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="flex items-center justify-around mb-5">
                <div className="text-center">
                  <p className="text-xl font-black text-[#1A4D8F]">{totalQ}</p>
                  <p className="text-[10px] text-gray-400">Questions</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-xl font-black text-[#1A4D8F]">{g.questions[0]?.timeLimit}s</p>
                  <p className="text-[10px] text-gray-400">Per question</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-xl font-black text-[#1A4D8F]">{g.winnerCount}</p>
                  <p className="text-[10px] text-gray-400">Winner{g.winnerCount > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl px-3 py-2.5 mb-4">
                <FiAward className="w-4 h-4 text-[#F5C518] shrink-0" />
                <p className="text-xs font-bold text-[#1A1A2E]">Prize: {g.prizeDescription}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-5 space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1">Rules</p>
                {[
                  'Answer all questions correctly to enter the winner pool',
                  'Each question has a countdown — answer before time runs out',
                  'You cannot go back to a previous question',
                  'Winners are randomly selected from the correct pool after the quiz closes',
                  'One entry per user per giveaway — completely free',
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <FiCheck className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600">{r}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPhase('question')}
                className="w-full bg-[#1A4D8F] text-white font-black py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors text-sm"
              >
                Start Quiz
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-2">100% free · No payment required</p>
            </div>
          </>
        )}

        {/* ── QUESTION ───────────────────────────────────── */}
        {phase === 'question' && (
          <>
            {/* Progress + timer bar */}
            <div className="px-5 pt-4 pb-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-500">
                  Question {qIdx + 1} <span className="text-gray-300">/ {totalQ}</span>
                </span>
                <span className={`text-xs font-black tabular-nums ${timerDanger ? 'text-red-500' : 'text-[#1A4D8F]'}`}>
                  <FiClock className="inline w-3 h-3 mr-0.5 -mt-0.5" />{timeLeft}s
                </span>
              </div>
              {/* Question progress dots */}
              <div className="flex gap-1 mb-3">
                {g.questions.map((_, i) => (
                  <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                    i < qIdx ? 'bg-green-400' : i === qIdx ? 'bg-[#1A4D8F]' : 'bg-gray-100'
                  }`} />
                ))}
              </div>
              {/* Timer bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${timerDanger ? 'bg-red-500' : 'bg-[#1A4D8F]'}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>

            <div className="px-5 pb-5 overflow-y-auto flex-1">
              <p className="text-sm font-black text-[#1A1A2E] mb-4 leading-snug">{currentQ.text}</p>

              <div className="space-y-2.5 mb-5">
                {currentQ.options.map((opt, i) => {
                  const optKey = ['a','b','c','d'][i];
                  const isSelected = selected === optKey;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(optKey)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm text-left font-medium ${
                        isSelected
                          ? 'border-[#1A4D8F] bg-blue-50 text-[#1A4D8F]'
                          : 'border-gray-200 text-gray-700 hover:border-[#1A4D8F]/40 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {OPTION_LABELS[i]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={!selected}
                className="w-full bg-[#F5C518] text-[#1A1A2E] font-black py-3 rounded-xl hover:brightness-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {qIdx + 1 < totalQ ? <>Next Question <FiArrowRight className="w-4 h-4" /></> : 'Submit Answers'}
              </button>
            </div>
          </>
        )}

        {/* ── RESULT ─────────────────────────────────────── */}
        {phase === 'result' && (() => {
          const correctCount = answers.filter(a => a.correct).length;
          const allCorrect   = correctCount === totalQ;
          return (
            <div className="p-6 text-center flex flex-col items-center">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <FiX className="w-4 h-4 text-gray-400" />
              </button>

              {allCorrect ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mb-4">
                    <FiCheck className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A2E] mb-1">All Correct!</h3>
                  <p className="text-3xl font-black text-green-600 mb-1">{correctCount} / {totalQ}</p>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    You're now in the winner pool for <strong>{g.prizeDescription}</strong>.
                    {' '}The draw happens after the quiz closes — we'll notify you if you win.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-5 text-xs text-green-700 font-medium">
                    {g.correctPoolSize + 1} people in the correct pool · {g.winnerCount} winner{g.winnerCount > 1 ? 's' : ''} will be picked
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mb-4">
                    <FiX className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A2E] mb-1">Not quite!</h3>
                  <p className="text-3xl font-black text-red-500 mb-1">{correctCount} / {totalQ}</p>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    You needed all {totalQ} correct to enter the winner pool. Better luck in the next giveaway!
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-5 text-xs text-red-600 font-medium">
                    All {totalQ} answers must be correct to enter the draw
                  </div>
                </>
              )}

              {/* Answer review */}
              <div className="w-full space-y-1.5 mb-5">
                {answers.map((a, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                    a.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {a.correct
                      ? <FiCheck className="w-3.5 h-3.5 shrink-0" />
                      : <FiX className="w-3.5 h-3.5 shrink-0" />
                    }
                    <span className="font-medium">Q{i + 1}</span>
                    <span className="truncate flex-1 text-left">{g.questions[i].text.slice(0, 40)}…</span>
                    <span className="font-black">
                      {a.selected ? OPTION_LABELS[['a','b','c','d'].indexOf(a.selected)] : '—'}
                    </span>
                  </div>
                ))}
              </div>

              <button onClick={onClose}
                className="w-full border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                {allCorrect ? 'View My Giveaways' : 'See More Giveaways'}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function LoginPrompt({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#1A4D8F]/10 flex items-center justify-center mx-auto mb-4">
          <FiLogIn className="w-7 h-7 text-[#1A4D8F]" />
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E] mb-2">Login Required</h3>
        <p className="text-sm text-gray-500 mb-5">You need a free WinALot account to take the quiz. Sign up — it's quick and free.</p>
        <div className="space-y-2">
          <Link to="/auth/signup" className="block w-full bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
            Create Free Account
          </Link>
          <Link to="/auth/login" className="block w-full border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function WALGiveaway() {
  const { isAuthenticated, user } = useAuth();
  const [winners, setWinners]     = useState([]);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [activeGiveaway, setActiveGiveaway] = useState(null);
  const [showLogin, setShowLogin]           = useState(false);

  const storageKey = `wal_giveaway_entries_${user?.id || 'guest'}`;
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    matchApi.getGiveawayWinners(12)
      .then(res => setWinners(res.data?.data?.winners || res.data?.winners || []))
      .catch(() => setWinners([]))
      .finally(() => setWinnersLoading(false));
  }, []);

  const handleTakeQuiz = (g) => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    setActiveGiveaway(g);
  };

  const handleComplete = (giveawayId, result) => {
    const updated = { ...entries, [giveawayId]: result };
    setEntries(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  };

  return (
    <div className="relative">

      {/* ── Coming Soon overlay ───────────────────────────────────────────── */}
      <div className="fixed inset-0 z-40 bg-white/75 dark:bg-slate-900/80 backdrop-blur-[3px] flex items-center justify-center px-4 pt-16 pb-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0D2B5E] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <FiGift className="w-8 h-8 text-[#F5C518]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/40 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
            <span className="text-[11px] font-black text-[#b89300] uppercase tracking-wide">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-black text-[#1A1A2E] dark:text-white mb-3 leading-tight">
            WAL Giveaway<br />Launching Soon
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            Answer the quiz, get all correct, and win real prizes — boots, cash, jerseys and more.
            <br /><br />
            In the meantime — play our <strong className="text-[#1A1A2E] dark:text-white">free World Cup 2026 predictions</strong> and win real cash prizes.
          </p>
          <Link
            to="/worldcup"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1A4D8F] text-white font-black px-6 py-3.5 rounded-xl hover:bg-[#0D2B5E] transition-colors shadow-md text-sm"
          >
            Play World Cup 2026 — Free
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-4">
            Free to enter &nbsp;·&nbsp; Cash prizes &nbsp;·&nbsp; Real match predictions
          </p>
        </div>
      </div>

      {/* ── WAL Giveaway content (non-interactive behind overlay) ─────────── */}
      <div className="pointer-events-none select-none opacity-40">
    <div>
      {/* Hero */}
      <div className="relative py-20 px-4 text-center overflow-hidden min-h-[260px] flex items-center justify-center">
        <img src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1920&q=80&auto=format&fit=crop"
          alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1A1A2E]/70" />
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-[#F5C518]/20 border border-[#F5C518]/40 rounded-full p-4">
              <FiGift className="w-10 h-10 text-[#F5C518]" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            100% FREE — NO PAYMENT REQUIRED
          </div>
          <h1 className="text-4xl font-black text-white mb-3">WAL Giveaway</h1>
          <p className="text-blue-200 text-lg font-medium max-w-lg mx-auto">
            Answer the quiz. Get all correct. Win real prizes — boots, cash, jerseys &amp; more.
          </p>
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-[#1A1A2E] text-center mb-8">How WAL Giveaway Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { n: '01', title: 'Pick a Giveaway', desc: 'Choose any open giveaway below. All entries are free.' },
            { n: '02', title: 'Take the Quiz', desc: 'Answer all questions within the countdown timer. Each question has its own timer.' },
            { n: '03', title: 'Enter the Pool', desc: 'Get ALL answers right to enter the winner pool. Wrong answers mean no entry.' },
            { n: '04', title: 'Win Prizes', desc: 'Admin randomly picks winners from the correct pool after the quiz closes. Winners are notified immediately.' },
          ].map(s => (
            <div key={s.n} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center card-hover">
              <div className="w-12 h-12 rounded-full bg-[#F5C518] text-[#1A1A2E] font-black text-lg flex items-center justify-center mx-auto mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-[#1A1A2E] mb-2 text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active giveaways */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#1A1A2E]">Open Giveaways</h2>
            <p className="text-sm text-gray-400 mt-0.5">Get all answers right to enter the prize draw</p>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            FREE ENTRY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_GIVEAWAYS.map(g => (
            <GiveawayCard
              key={g.id}
              g={g}
              onTakeQuiz={handleTakeQuiz}
              entry={entries[g.id] || null}
            />
          ))}
        </div>
      </section>

      {/* Past winners */}
      <section className="bg-[#0D2B5E] py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5C518]/20 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-[#F5C518]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Giveaway Winners</h2>
                <p className="text-blue-300 text-sm">Real winners from past WAL Giveaway draws</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Updated after each draw
            </span>
          </div>

          {winnersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-24 animate-pulse" />)}
            </div>
          ) : winners.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center">
              <FiGift className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-semibold">No giveaway winners yet</p>
              <p className="text-white/30 text-sm mt-1">Be the first — take a quiz above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {winners.map((w, i) => (
                <div key={w.id || i}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
                  <div className="h-1 bg-gradient-to-r from-[#F5C518] to-[#1A4D8F]" />
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F5C518]/20 border border-[#F5C518]/30 flex items-center justify-center shrink-0">
                      <FiUser className="w-5 h-5 text-[#F5C518]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-white text-sm truncate">{w.username || 'Anonymous'}</span>
                        <span className="font-black text-[#F5C518] text-sm shrink-0">{w.prize ? `+$${Number(w.prize).toFixed(2)}` : 'Prize Won'}</span>
                      </div>
                      <p className="text-xs text-blue-300 truncate mb-1.5">{w.match || w.market || '—'}</p>
                      <div className="flex items-center gap-2">
                        {w.date && <span className="text-[10px] text-white/40 flex items-center gap-1"><FiCalendar className="w-2.5 h-2.5" />{w.date}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {winners.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/winners" className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                View All Winners <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Entry rules */}
      <section className="max-w-2xl mx-auto px-4 pt-12 pb-14">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-[#1A1A2E] mb-4">Entry Rules</h3>
          <ul className="space-y-3">
            {[
              'No purchase required — WAL Giveaway is completely free.',
              'Must have a verified WinALot account to enter.',
              'One quiz attempt per user per giveaway event.',
              'You must answer ALL questions correctly to enter the winner pool.',
              'Winners are randomly selected from the correct pool after quiz closes.',
              'Must be 18 years or older to participate.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modals */}
      {activeGiveaway && (
        <QuizModal
          g={activeGiveaway}
          onClose={() => setActiveGiveaway(null)}
          onComplete={handleComplete}
        />
      )}
      {showLogin && <LoginPrompt onClose={() => setShowLogin(false)} />}
    </div>
      </div>{/* end pointer-events-none */}
    </div>
  );
}
