import apiClient from './apiClient';

export const liveApi = {
  // Fixtures
  getTodayFixtures:   ()                          => apiClient.get('/live/fixtures/today'),
  getLiveFixtures:    ()                          => apiClient.get('/live/fixtures/live'),
  getUpcomingFixtures:()                          => apiClient.get('/live/fixtures/upcoming'),
  getFixtureById:     (id)                        => apiClient.get(`/live/fixtures/${id}`),
  getFixturesByLeague:(leagueId, season)          => apiClient.get(`/live/fixtures/league/${leagueId}`, { params: { season } }),

  // Match detail
  getMatchStats:      (id)                        => apiClient.get(`/live/match/${id}/stats`),
  getMatchLineups:    (id)                        => apiClient.get(`/live/match/${id}/lineups`),
  getMatchEvents:     (id)                        => apiClient.get(`/live/match/${id}/events`),
  getMatchOdds:       (id, homeTeam, awayTeam)    => apiClient.get(`/live/match/${id}/odds`, { params: { homeTeam, awayTeam } }),
  getPlayerRatings:   (id, teamId)                => apiClient.get(`/live/match/${id}/ratings`, { params: { teamId } }),

  // H2H
  getH2H: (team1Id, team2Id, team1Name, team2Name, leagueId) =>
    apiClient.get('/live/h2h', { params: { team1Id, team2Id, team1Name, team2Name, leagueId } }),

  // Standings
  getStandings:       (leagueId, season)          => apiClient.get(`/live/standings/${leagueId}`, { params: { season } }),
  getTopLeagues:      ()                          => apiClient.get('/live/leagues/top'),
  getAllLeagues:       ()                          => apiClient.get('/live/leagues'),

  // Teams (TheSportsDB — no secret key needed)
  searchTeam:         (name)                      => apiClient.get('/live/team/search', { params: { name } }),
  getTeamStats:       (id, leagueId)              => apiClient.get(`/live/team/${id}/stats`, { params: { leagueId } }),
  getTeamSquad:       (id)                        => apiClient.get(`/live/team/${id}/squad`),

  // Odds
  getLiveOdds:        ()                          => apiClient.get('/live/odds/live'),

  // News
  getNews:            (limit = 10)                => apiClient.get('/live/news', { params: { limit } }),
  getNewsForTeam:     (team)                      => apiClient.get('/live/news/team', { params: { team } }),

  // Radio
  getRadioStream:     ()                          => apiClient.get('/live/radio/stream'),

  // Ticker (Supabase — active match list + ticket counts)
  getTicker:          ()                          => apiClient.get('/live/ticker'),
};
