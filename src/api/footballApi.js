import axios from 'axios';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/football`,
  timeout: 15000,
});

export const footballApi = {
  // Fixtures
  getLive:       ()                     => client.get('/fixtures/live'),
  getToday:      ()                     => client.get('/fixtures/today'),
  getUpcoming:   (next)                 => client.get('/fixtures/upcoming', { params: { next } }),
  getById:       (id)                   => client.get(`/fixtures/${id}`),
  getByLeague:   (leagueId, season)     => client.get(`/fixtures/league/${leagueId}`, { params: { season } }),

  // Match detail
  getStats:      (id)                   => client.get(`/match/${id}/stats`),
  getLineups:    (id)                   => client.get(`/match/${id}/lineups`),
  getEvents:     (id)                   => client.get(`/match/${id}/events`),
  getOdds:       (id)                   => client.get(`/match/${id}/odds`),
  getRatings:    (id, teamId)           => client.get(`/match/${id}/ratings`, { params: { teamId } }),

  // H2H
  getH2H:        (team1, team2)         => client.get('/h2h', { params: { team1, team2 } }),

  // Standings & Leagues
  getStandings:  (leagueId, season)     => client.get(`/standings/${leagueId}`, { params: { season } }),
  getLeagues:    ()                     => client.get('/leagues'),
  getTopLeagues: ()                     => client.get('/leagues/top'),

  // Teams
  searchTeam:    (name)                 => client.get('/team/search', { params: { name } }),
  getTeam:       (id)                   => client.get(`/team/${id}`),
  getTeamStats:  (id, leagueId, season) => client.get(`/team/${id}/stats`, { params: { leagueId, season } }),
  getSquad:      (id)                   => client.get(`/team/${id}/squad`),

  // Players
  getPlayer:     (id, season)           => client.get(`/player/${id}`, { params: { season } }),

  // Radio
  getRadio:      ()                     => client.get('/radio'),
};
