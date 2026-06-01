// Convert Supabase match row + its markets array to the MatchCard-compatible shape
export function normalizeMatch(match) {
  const markets = match.markets || [];
  const market  = markets.find(m => m.status === 'active') || markets[0] || {};

  const dateObj  = match.match_date ? new Date(match.match_date) : null;
  const validDate = dateObj && !isNaN(dateObj.getTime());
  const date     = validDate ? dateObj.toISOString().slice(0, 10) : '';
  const time     = validDate ? dateObj.toISOString().slice(11, 16) : '';

  const priceCents = market.ticket_price || 0;
  const maxTickets = market.max_tickets  || 0;
  const prizePool  = Math.floor(priceCents * maxTickets * 0.9) / 100;

  const statusMap = { active: 'active', live: 'live', finished: 'finished', draft: 'upcoming' };

  // Parse auto_options if stored as string
  let autoOptions = market.auto_options;
  if (typeof autoOptions === 'string') {
    try { autoOptions = JSON.parse(autoOptions); } catch { autoOptions = null; }
  }

  return {
    id:         match.id,
    homeTeam: {
      name:  match.team_home || '',
      short: (match.team_home || '???').slice(0, 3).toUpperCase(),
      logo:  match.home_logo || match.team_home_logo || null,
    },
    awayTeam: {
      name:  match.team_away || '',
      short: (match.team_away || '???').slice(0, 3).toUpperCase(),
      logo:  match.away_logo || match.team_away_logo || null,
    },
    league:         match.league     || '',
    date,
    time,
    market:         market.name      || '',
    marketTag:      market.type      || '',
    adminPick:      market.admin_pick || market.correct_prediction || '',
    predictionType: market.prediction_type || 'market_pick',
    autoOptions:    autoOptions || null,
    price:          priceCents / 100,
    maxWinners:     market.max_winners || 5,
    prizePool,
    tier:           market.tier      || 'silver',
    fillPercent:    market.fill_percent || 0,
    status:         statusMap[match.status] || 'upcoming',
    score:          (match.score?.home != null || match.score?.away != null) ? match.score : null,
    minute:         match.minute     || null,
    apiFootballId:  match.api_football_id || null,
    // keep originals for detail pages
    _raw: match,
  };
}

// Convert Supabase ticket row to dashboard-compatible shape
export function normalizeTicket(t) {
  const market  = t.markets || {};
  const match   = market.matches || {};
  const matchTitle = match.title || `${match.team_home || ''} vs ${match.team_away || ''}`;
  const dateObj = t.created_at ? new Date(t.created_at) : null;

  // status: active → pending (UI calls active tickets "pending" in display)
  const statusMap = { active: 'pending', won: 'won', lost: 'lost', voided: 'voided' };

  return {
    id:          t.id,
    ticketNumber: t.ticket_number || '',
    match:       matchTitle,
    market:      market.name     || '',
    myPick:      t.user_prediction || '',
    adminPick:   market.correct_prediction || '—',
    entryFee:    (t.amount_paid  || 0) / 100,
    prize:       (t.prize_amount || 0) / 100,
    status:      statusMap[t.status] || t.status,
    date:        dateObj ? dateObj.toLocaleDateString() : '',
    _raw:        t,
  };
}

// Convert Supabase transaction row to wallet-compatible shape
export function normalizeTransaction(tx) {
  const dateObj = tx.created_at ? new Date(tx.created_at) : null;
  return {
    id:          tx.id,
    type:        tx.type,
    amount:      tx.amount,        // already in cents, sign indicates direction
    description: tx.description || tx.type,
    reference:   tx.reference || tx.id,
    status:      tx.status,
    date:        dateObj ? dateObj.toLocaleDateString() : '',
    _raw:        tx,
  };
}

// Convert market row to StakeModal tier-option shape
export function normalizeMarketToTier(market) {
  const priceCents = market.ticket_price || 0;
  const maxTickets = market.max_tickets  || 0;
  return {
    marketId:    market.id,
    tier:        market.tier        || 'silver',
    price:       priceCents / 100,
    maxWinners:  market.max_winners || 5,
    prizePool:   Math.floor(priceCents * maxTickets * 0.9) / 100,
    stakers:     market.stakers     || 0,
    fillPercent: market.fill_percent || 0,
    name:        market.name        || '',
  };
}

// Convert API-Football fixture to lightweight ticker/live-indicator shape
export function normalizeFixture(fixture) {
  const f = fixture.fixture || {};
  const t = fixture.teams   || {};
  const g = fixture.goals   || {};
  const l = fixture.league  || {};

  const statusShort = f.status?.short || 'NS';
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT'].includes(statusShort);

  return {
    id:       String(f.id),
    homeTeam: { name: t.home?.name || '', logo: t.home?.logo || '', id: t.home?.id },
    awayTeam: { name: t.away?.name || '', logo: t.away?.logo || '', id: t.away?.id },
    score:    { home: g.home ?? null, away: g.away ?? null },
    minute:   f.status?.elapsed ? `${f.status.elapsed}'` : null,
    isLive,
    league:   l.name || '',
    leagueLogo: l.logo || '',
    status:   isLive ? 'live' : statusShort === 'FT' ? 'finished' : 'upcoming',
    date:     f.date ? new Date(f.date).toISOString().slice(0, 10) : '',
    time:     f.date ? new Date(f.date).toTimeString().slice(0, 5) : '',
  };
}
