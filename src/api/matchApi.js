import apiClient from './apiClient';

export const matchApi = {
  // Public match/market endpoints
  getMatches:       (params)             => apiClient.get('/matches', { params }),
  getMatchById:     (id)                 => apiClient.get(`/matches/${id}`),
  getLiveMatches:   ()                   => apiClient.get('/matches/live'),

  // Markets
  getMarkets:       (params)             => apiClient.get('/markets', { params }),
  getMarketById:    (id)                 => apiClient.get(`/markets/${id}`),

  // Tickets (auth required)
  purchaseTicket:   (marketId, prediction) =>
    apiClient.post('/tickets', { market_id: marketId, user_prediction: prediction }),
  getMyTickets:     (params)             => apiClient.get('/tickets', { params }),
  getTicketByNumber:(number)             => apiClient.get(`/tickets/by-number/${number}`),

  // Draws
  verifyDraw:       (drawId)             => apiClient.get(`/draws/verify/${drawId}`),

  // Wallet / Transactions (auth required)
  getWalletBalance: ()                   => apiClient.get('/users/me'),
  getMyTransactions:(params)             => apiClient.get('/transactions', { params }),
  initDeposit:      (amount, provider, redirectUrl) =>
    apiClient.post('/transactions/deposit/init', { amount, provider, redirect_url: redirectUrl }),
  verifyDeposit:    (params)             => apiClient.post('/transactions/deposit/verify', params),
  withdraw:         (data)               => apiClient.post('/transactions/withdraw', data),

  // Public winners feed
  getWinners:         (limit = 20)         => apiClient.get('/tickets/winners', { params: { limit } }),
  getGiveawayWinners: (limit = 12)         => apiClient.get('/tickets/winners', { params: { limit, tier: 'free' } }),

  // Public leaderboard
  getLeaderboard:   (period = 'weekly')  => apiClient.get('/users/leaderboard', { params: { period } }),

  // Notifications (auth required)
  getNotifications: (params)             => apiClient.get('/notifications', { params }),
  markNotifRead:    (id)                 => apiClient.put(`/notifications/${id}/read`),
  markAllNotifsRead:()                   => apiClient.put('/notifications/read-all'),

  // Team history (via API-Football proxy)
  getTeamHistory:   (teamSlug)           => apiClient.get(`/live/team/${teamSlug}/history`),
  getH2H:           (homeId, awayId)     => apiClient.get('/live/h2h', { params: { home: homeId, away: awayId } }),

  // Profile
  updateProfile:    (data)               => apiClient.put('/users/me', data),
};
