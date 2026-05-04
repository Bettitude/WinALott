// Per-match detail data: lineups, timeline events, stats, H2H, odds, standings

// ── Helpers ──────────────────────────────────────────────────────────────────
const player = (num, name, pos, rating) => ({ num, name, pos, rating });

// ── Lineups ───────────────────────────────────────────────────────────────────
const defaultLineup = (home, away) => ({
  formation: { home: '4-3-3', away: '4-2-3-1' },
  home: {
    starting: [
      player(1,  home.gk,   'GK', 6.8),
      player(2,  home.rb,   'RB', 7.0),
      player(5,  home.cb1,  'CB', 7.2),
      player(6,  home.cb2,  'CB', 6.9),
      player(3,  home.lb,   'LB', 6.7),
      player(4,  home.dm,   'DM', 7.5),
      player(8,  home.cm1,  'CM', 7.1),
      player(10, home.cm2,  'CM', 7.8),
      player(7,  home.rw,   'RW', 7.4),
      player(11, home.lw,   'LW', 7.6),
      player(9,  home.st,   'ST', 8.1),
    ],
    bench: [home.bench1, home.bench2, home.bench3],
  },
  away: {
    starting: [
      player(1,  away.gk,   'GK', 6.5),
      player(2,  away.rb,   'RB', 6.8),
      player(5,  away.cb1,  'CB', 6.7),
      player(6,  away.cb2,  'CB', 6.6),
      player(3,  away.lb,   'LB', 6.9),
      player(4,  away.dm1,  'DM', 7.0),
      player(8,  away.dm2,  'DM', 6.8),
      player(7,  away.rm,   'AM', 7.2),
      player(10, away.cam,  'AM', 7.5),
      player(11, away.lm,   'AM', 7.1),
      player(9,  away.st,   'ST', 7.3),
    ],
    bench: [away.bench1, away.bench2, away.bench3],
  },
});

// ── Match-specific data map ───────────────────────────────────────────────────
const data = {};

// Match 1 — Man City vs Chelsea
data['1'] = {
  venue: 'Etihad Stadium',
  referee: 'M. Oliver',
  attendance: '53,400',
  round: 'Matchday 33',
  breadcrumb: ['England', 'Premier League', 'Season 2024/25'],
  form: {
    home: ['W', 'W', 'D', 'L', 'W'],
    away: ['D', 'W', 'W', 'L', 'W'],
  },
  events: [
    { min: 23, type: 'goal',   team: 'home', player: 'Haaland',    detail: 'Assist: De Bruyne' },
    { min: 31, type: 'yellow', team: 'away', player: 'Caicedo',    detail: 'Foul on Rodri' },
    { min: 55, type: 'goal',   team: 'away', player: 'Palmer',     detail: 'Assist: Jackson' },
    { min: 67, type: 'goal',   team: 'home', player: 'Foden',      detail: 'Assist: Doku' },
    { min: 78, type: 'red',    team: 'away', player: 'Colwill',    detail: 'Second yellow' },
    { min: 89, type: 'goal',   team: 'home', player: 'Bernardo',   detail: 'Assist: Haaland' },
  ],
  stats: { home: { possession: 62, shots: 18, shotsOT: 8, corners: 7, fouls: 7, yellows: 1, reds: 0, offsides: 2, passes: 612, passAcc: 91, tackles: 14, saves: 4 },
           away: { possession: 38, shots: 9,  shotsOT: 3, corners: 3, fouls: 14, yellows: 2, reds: 1, offsides: 1, passes: 378, passAcc: 82, tackles: 19, saves: 6 } },
  lineup: defaultLineup(
    { gk:'Ederson', rb:'Walker', cb1:'Dias', cb2:'Akanji', lb:'Gvardiol', dm:'Rodri', cm1:'De Bruyne', cm2:'Bernardo', rw:'Doku', lw:'Foden', st:'Haaland', bench1:'Ortega', bench2:'Kovacic', bench3:'Grealish' },
    { gk:'Sanchez', rb:'James',  cb1:'Colwill', cb2:'Fofana', lb:'Cucurella', dm1:'Caicedo', dm2:'Fernandez', rm:'Madueke', cam:'Palmer', lm:'Neto', st:'Jackson', bench1:'Petrovic', bench2:'Gusto', bench3:'Mudryk' }
  ),
  h2h: [
    { date: '2024-11-23', home: 'Man City', score: '3-0', away: 'Chelsea',  winner: 'home' },
    { date: '2024-05-15', home: 'Chelsea',  score: '0-1', away: 'Man City', winner: 'away' },
    { date: '2024-02-17', home: 'Man City', score: '1-0', away: 'Chelsea',  winner: 'home' },
    { date: '2023-11-12', home: 'Chelsea',  score: '4-4', away: 'Man City', winner: 'draw' },
    { date: '2023-05-20', home: 'Man City', score: '1-0', away: 'Chelsea',  winner: 'home' },
    { date: '2022-09-17', home: 'Chelsea',  score: '0-0', away: 'Man City', winner: 'draw' },
    { date: '2022-05-08', home: 'Chelsea',  score: '2-2', away: 'Man City', winner: 'draw' },
  ],
  standings: [
    { pos:1, team:'Liverpool',  p:33, w:22, d:7, l:4,  gf:68, ga:30, gd:'+38', pts:73, highlight:false },
    { pos:2, team:'Arsenal',    p:33, w:21, d:6, l:6,  gf:65, ga:34, gd:'+31', pts:69, highlight:false },
    { pos:3, team:'Man City',   p:33, w:20, d:5, l:8,  gf:62, ga:40, gd:'+22', pts:65, highlight:true  },
    { pos:4, team:'Chelsea',    p:33, w:19, d:8, l:6,  gf:60, ga:42, gd:'+18', pts:65, highlight:true  },
    { pos:5, team:'Tottenham',  p:33, w:16, d:9, l:8,  gf:51, ga:40, gd:'+11', pts:57, highlight:false },
    { pos:6, team:'Newcastle',  p:33, w:15, d:10,l:8,  gf:49, ga:40, gd:'+9',  pts:55, highlight:false },
    { pos:7, team:'Aston Villa',p:33, w:14, d:8, l:11, gf:48, ga:45, gd:'+3',  pts:50, highlight:false },
  ],
  odds: [
    { bookmaker: '1XBET',     home: 2.40, draw: 3.20, away: 2.90 },
    { bookmaker: 'Bet365',    home: 2.35, draw: 3.25, away: 2.95 },
    { bookmaker: 'William H', home: 2.38, draw: 3.10, away: 2.88 },
    { bookmaker: 'Betway',    home: 2.42, draw: 3.15, away: 2.85 },
  ],
  tv: ['Sky Sports Main Event', 'NBC Sports (USA)', 'beIN Sports (MENA)'],
};

// Match 2 — Real Madrid vs Barcelona
data['2'] = {
  venue: 'Santiago Bernabeu',
  referee: 'C. Del Cerro',
  attendance: '81,044',
  round: 'Matchday 31',
  breadcrumb: ['Spain', 'La Liga', 'Season 2024/25'],
  form: {
    home: ['W', 'W', 'W', 'D', 'W'],
    away: ['W', 'L', 'W', 'W', 'D'],
  },
  events: [
    { min: 14, type: 'goal',   team: 'away', player: 'Lewandowski', detail: 'Assist: Yamal' },
    { min: 45, type: 'yellow', team: 'home', player: 'Valverde',    detail: 'Reckless tackle' },
    { min: 62, type: 'goal',   team: 'home', player: 'Vinicius Jr', detail: 'Assist: Bellingham' },
    { min: 71, type: 'goal',   team: 'home', player: 'Bellingham',  detail: 'Assist: Mbappe' },
  ],
  stats: { home: { possession: 48, shots: 14, shotsOT: 6, corners: 5, fouls: 11, yellows: 2, reds: 0, offsides: 3, passes: 492, passAcc: 88, tackles: 17, saves: 3 },
           away: { possession: 52, shots: 12, shotsOT: 4, corners: 6, fouls: 9,  yellows: 1, reds: 0, offsides: 2, passes: 536, passAcc: 90, tackles: 14, saves: 4 } },
  lineup: defaultLineup(
    { gk:'Courtois', rb:'Carvajal', cb1:'Rudiger', cb2:'Militao', lb:'Mendy', dm:'Tchouameni', cm1:'Valverde', cm2:'Bellingham', rw:'Rodrygo', lw:'Vinicius', st:'Mbappe', bench1:'Lunin', bench2:'Camavinga', bench3:'Brahim' },
    { gk:'Ter Stegen', rb:'Kounde', cb1:'Cubarsi', cb2:'Martinez', lb:'Balde', dm1:'Casado', dm2:'Pedri', rm:'Yamal', cam:'Dani Olmo', lm:'Raphinha', st:'Lewandowski', bench1:'Pena', bench2:'Eric Garcia', bench3:'Gavi' }
  ),
  h2h: [
    { date: '2024-10-26', home: 'Barcelona',   score: '4-0', away: 'Real Madrid', winner: 'home' },
    { date: '2024-04-21', home: 'Real Madrid',  score: '3-2', away: 'Barcelona',  winner: 'home' },
    { date: '2023-10-28', home: 'Real Madrid',  score: '2-1', away: 'Barcelona',  winner: 'home' },
    { date: '2023-03-19', home: 'Barcelona',    score: '2-1', away: 'Real Madrid', winner: 'home' },
    { date: '2022-10-16', home: 'Real Madrid',  score: '3-1', away: 'Barcelona',  winner: 'home' },
  ],
  standings: [
    { pos:1, team:'Barcelona',    p:31, w:22, d:5, l:4,  gf:72, ga:28, gd:'+44', pts:71, highlight:true  },
    { pos:2, team:'Real Madrid',  p:31, w:21, d:5, l:5,  gf:68, ga:30, gd:'+38', pts:68, highlight:true  },
    { pos:3, team:'Atletico',     p:31, w:17, d:7, l:7,  gf:54, ga:35, gd:'+19', pts:58, highlight:false },
    { pos:4, team:'Villarreal',   p:31, w:14, d:9, l:8,  gf:49, ga:40, gd:'+9',  pts:51, highlight:false },
    { pos:5, team:'Athletic',     p:31, w:13, d:10,l:8,  gf:44, ga:38, gd:'+6',  pts:49, highlight:false },
  ],
  odds: [
    { bookmaker: '1XBET',     home: 2.10, draw: 3.40, away: 3.20 },
    { bookmaker: 'Bet365',    home: 2.05, draw: 3.45, away: 3.25 },
    { bookmaker: 'William H', home: 2.12, draw: 3.30, away: 3.15 },
    { bookmaker: 'Betway',    home: 2.08, draw: 3.35, away: 3.10 },
  ],
  tv: ['LaLigaTV', 'ESPN (USA)', 'beIN Sports', 'Movistar+'],
};

// Match 4 — PSG vs Marseille (live)
data['4'] = {
  venue: 'Parc des Princes',
  referee: 'F. Letexier',
  attendance: '47,929',
  round: 'Matchday 28',
  breadcrumb: ['France', 'Ligue 1', 'Season 2024/25'],
  form: {
    home: ['W', 'W', 'W', 'W', 'D'],
    away: ['L', 'W', 'D', 'W', 'L'],
  },
  events: [
    { min: 23, type: 'goal',   team: 'home', player: 'Dembele',  detail: 'Assist: Hakimi' },
    { min: 41, type: 'yellow', team: 'away', player: 'Kondogbia', detail: 'Dangerous play' },
    { min: 67, type: 'goal',   team: 'away', player: 'Aubameyang', detail: 'Header from corner' },
  ],
  stats: { home: { possession: 58, shots: 14, shotsOT: 5, corners: 6, fouls: 8, yellows: 1, reds: 0, offsides: 2, passes: 548, passAcc: 89, tackles: 12, saves: 2 },
           away: { possession: 42, shots: 7,  shotsOT: 2, corners: 4, fouls: 12, yellows: 2, reds: 0, offsides: 3, passes: 398, passAcc: 80, tackles: 18, saves: 4 } },
  lineup: defaultLineup(
    { gk:'Donnarumma', rb:'Hakimi', cb1:'Pacho', cb2:'Skriniar', lb:'Hernandez', dm:'Zaire-Emery', cm1:'Vitinha', cm2:'Ruiz', rw:'Dembele', lw:'Barcola', st:'Ramos', bench1:'Safonov', bench2:'Ugarte', bench3:'Kolo Muani' },
    { gk:'Rulli', rb:'Clauss', cb1:'Balerdi', cb2:'Mbemba', lb:'Lodi', dm1:'Kondogbia', dm2:'Veretout', rm:'Harit', cam:'Greenwood', lm:'Luis Henrique', st:'Aubameyang', bench1:'Lopez', bench2:'Sarr', bench3:'Ndiaye' }
  ),
  h2h: [
    { date: '2024-09-22', home: 'Marseille', score: '0-3', away: 'PSG', winner: 'away' },
    { date: '2024-03-31', home: 'PSG',       score: '2-0', away: 'Marseille', winner: 'home' },
    { date: '2023-09-24', home: 'Marseille', score: '0-4', away: 'PSG', winner: 'away' },
    { date: '2023-04-02', home: 'PSG',       score: '2-3', away: 'Marseille', winner: 'away' },
    { date: '2022-10-23', home: 'Marseille', score: '0-0', away: 'PSG', winner: 'draw' },
  ],
  standings: [
    { pos:1, team:'PSG',        p:28, w:22, d:3, l:3,  gf:71, ga:24, gd:'+47', pts:69, highlight:true  },
    { pos:2, team:'Monaco',     p:28, w:17, d:5, l:6,  gf:55, ga:32, gd:'+23', pts:56, highlight:false },
    { pos:3, team:'Marseille',  p:28, w:15, d:6, l:7,  gf:48, ga:36, gd:'+12', pts:51, highlight:true  },
    { pos:4, team:'Lyon',       p:28, w:14, d:6, l:8,  gf:44, ga:38, gd:'+6',  pts:48, highlight:false },
    { pos:5, team:'Lille',      p:28, w:13, d:7, l:8,  gf:42, ga:37, gd:'+5',  pts:46, highlight:false },
  ],
  odds: [
    { bookmaker: '1XBET',     home: 1.60, draw: 3.80, away: 5.50 },
    { bookmaker: 'Bet365',    home: 1.58, draw: 3.75, away: 5.60 },
    { bookmaker: 'William H', home: 1.62, draw: 3.70, away: 5.40 },
    { bookmaker: 'Betway',    home: 1.61, draw: 3.85, away: 5.45 },
  ],
  tv: ['Canal+', 'beIN Sports', 'Sky Sports (UK)'],
};

// Fallback for matches without detailed data — generates plausible generic data
function buildFallback(match) {
  return {
    venue: 'National Stadium',
    referee: 'J. Smith',
    attendance: '42,000',
    round: 'Matchday 29',
    breadcrumb: [match?.league || 'Football', 'Season 2024/25'],
    form: { home: ['W','D','W','L','W'], away: ['W','W','L','D','W'] },
    events: [
      { min: 32, type: 'goal',   team: 'home', player: match?.homeTeam?.name || 'Home', detail: '' },
      { min: 58, type: 'yellow', team: 'away', player: match?.awayTeam?.name || 'Away', detail: '' },
    ],
    stats: {
      home: { possession: 55, shots: 13, shotsOT: 5, corners: 5, fouls: 10, yellows: 1, reds: 0, offsides: 2, passes: 490, passAcc: 87, tackles: 15, saves: 3 },
      away: { possession: 45, shots: 9,  shotsOT: 3, corners: 4, fouls: 12, yellows: 2, reds: 0, offsides: 1, passes: 400, passAcc: 82, tackles: 16, saves: 4 },
    },
    lineup: defaultLineup(
      { gk:'GK', rb:'RB', cb1:'CB', cb2:'CB2', lb:'LB', dm:'DM', cm1:'CM', cm2:'CM2', rw:'RW', lw:'LW', st:'ST', bench1:'Sub1', bench2:'Sub2', bench3:'Sub3' },
      { gk:'GK', rb:'RB', cb1:'CB', cb2:'CB2', lb:'LB', dm1:'DM', dm2:'DM2', rm:'RM', cam:'CAM', lm:'LM', st:'ST', bench1:'Sub1', bench2:'Sub2', bench3:'Sub3' }
    ),
    h2h: [
      { date: '2024-10-12', home: match?.homeTeam?.name || 'Home', score: '2-1', away: match?.awayTeam?.name || 'Away', winner: 'home' },
      { date: '2024-03-08', home: match?.awayTeam?.name || 'Away', score: '1-1', away: match?.homeTeam?.name || 'Home', winner: 'draw' },
      { date: '2023-09-24', home: match?.homeTeam?.name || 'Home', score: '3-0', away: match?.awayTeam?.name || 'Away', winner: 'home' },
      { date: '2023-02-18', home: match?.awayTeam?.name || 'Away', score: '2-0', away: match?.homeTeam?.name || 'Home', winner: 'home' },
      { date: '2022-10-01', home: match?.homeTeam?.name || 'Home', score: '1-2', away: match?.awayTeam?.name || 'Away', winner: 'away' },
    ],
    standings: [
      { pos:1, team: match?.homeTeam?.name || 'Team A', p:31, w:18, d:7, l:6, gf:55, ga:30, gd:'+25', pts:61, highlight:true  },
      { pos:2, team: match?.awayTeam?.name || 'Team B', p:31, w:16, d:8, l:7, gf:50, ga:35, gd:'+15', pts:56, highlight:true  },
      { pos:3, team:'Third Team',  p:31, w:14, d:9, l:8, gf:46, ga:38, gd:'+8',  pts:51, highlight:false },
      { pos:4, team:'Fourth Team', p:31, w:12, d:10,l:9, gf:41, ga:40, gd:'+1',  pts:46, highlight:false },
    ],
    odds: [
      { bookmaker: 'Bet365',    home: 2.10, draw: 3.20, away: 3.40 },
      { bookmaker: 'William H', home: 2.05, draw: 3.25, away: 3.45 },
      { bookmaker: 'Betway',    home: 2.12, draw: 3.15, away: 3.35 },
    ],
    tv: ['Sky Sports', 'ESPN', 'beIN Sports'],
  };
}

export function getMatchDetail(matchId, match) {
  return data[matchId] || buildFallback(match);
}
