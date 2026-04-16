import { useState } from 'react';
import { FiBell, FiAward, FiPlusCircle, FiDollarSign, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { mockNotifications } from '../../data/mockData';

const typeIcon = {
  win: FiAward,
  new_match: FiPlusCircle,
  payout: FiDollarSign,
  system: FiSettings,
};
const typeColor = {
  win: 'bg-yellow-50 text-yellow-600',
  new_match: 'bg-blue-50 text-[#1A4D8F]',
  payout: 'bg-green-50 text-green-600',
  system: 'bg-gray-50 text-gray-500',
};

export default function Notifications() {
  const [notifs, setNotifs] = useState(mockNotifications);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-[#1A4D8F] font-medium hover:underline">
            <FiCheckCircle className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FiBell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No notifications yet</p>
          <p className="text-gray-300 text-sm">We'll notify you of wins, draws, and updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map(n => {
            const Icon = typeIcon[n.type] || FiBell;
            return (
              <div key={n.id}
                onClick={() => markRead(n.id)}
                className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md ${
                  !n.read ? 'border-[#1A4D8F]/30 bg-blue-50/30' : 'border-gray-200'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor[n.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold ${!n.read ? 'text-[#1A1A2E]' : 'text-gray-600'}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 bg-[#1A4D8F] rounded-full mt-1 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1.5">{n.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
