// Simulated admin-controlled picks — in production, fetched from /api/admin/picks

export const POTD_PICKS = [
  { adminPick: 'Home Win',               market: 'Match Result', marketType: 'result',   maxTickets: 100, ticketsSold: 42 },
  { adminPick: 'Yes – Both Teams Score', market: 'BTTS',         marketType: 'btts',     maxTickets: 100, ticketsSold: 28 },
  { adminPick: 'Over 9.5 Corners',       market: 'Corners',      marketType: 'corners',  maxTickets: 100, ticketsSold: 19 },
];

export const FEATURED_PICKS = [
  { adminPick: 'Home Win',               market: 'Match Result', marketType: 'result',   maxTickets: 100, ticketsSold: 55 },
  { adminPick: 'Over 3.5 Cards',         market: 'Total Cards',  marketType: 'cards',    maxTickets: 100, ticketsSold: 33 },
  { adminPick: 'Yes – Penalty Awarded',  market: 'Penalty',      marketType: 'penalty',  maxTickets: 100, ticketsSold: 17 },
  { adminPick: 'Away Win',               market: 'Match Result', marketType: 'result',   maxTickets: 100, ticketsSold: 44 },
  { adminPick: 'Over 24.5 Total Shots',  market: 'Shots',        marketType: 'shots',    maxTickets: 100, ticketsSold: 22 },
  { adminPick: 'Over 9.5 Corners',       market: 'Corners',      marketType: 'corners',  maxTickets: 100, ticketsSold: 31 },
  { adminPick: 'Draw',                   market: 'Match Result', marketType: 'result',   maxTickets: 100, ticketsSold: 67 },
  { adminPick: 'Under 20.5 Fouls',       market: 'Fouls',        marketType: 'fouls',    maxTickets: 100, ticketsSold: 14 },
  { adminPick: 'Yes – Both Teams Score', market: 'BTTS',         marketType: 'btts',     maxTickets: 100, ticketsSold: 39 },
  { adminPick: 'Over 29.5 Throw Ins',    market: 'Throw Ins',    marketType: 'throwins', maxTickets: 100, ticketsSold: 11 },
];

export function applyPick(match, pick) {
  const rawMarkets = match._raw?.markets || [];
  const mkt = rawMarkets.find(mk => mk.type === pick.marketType) || {};
  const priceCents = mkt.ticket_price || 100;
  return {
    ...match,
    adminPick:   pick.adminPick,
    market:      pick.market,
    marketTag:   pick.marketType,
    maxTickets:  pick.maxTickets,
    ticketsSold: pick.ticketsSold,
    price:       priceCents / 100,
    tier:        mkt.tier || 'silver',
    prizePool:   Math.floor(priceCents * pick.maxTickets * 0.9) / 100,
    fillPercent: Math.round((pick.ticketsSold / pick.maxTickets) * 100),
  };
}
