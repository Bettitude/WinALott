import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { FiAward, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiShare2, FiCopy, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { dashboardTickets } from '../data/mockData';

const STATUS_CONFIG = {
  won: {
    label:  'Won',
    icon:   FiAward,
    text:   'text-green-700',
    bg:     'bg-green-50',
    border: 'border-green-200',
    bar:    'bg-green-400',
  },
  lost: {
    label:  'Lost',
    icon:   FiXCircle,
    text:   'text-red-600',
    bg:     'bg-red-50',
    border: 'border-red-200',
    bar:    'bg-red-400',
  },
  pending: {
    label:  'Pending',
    icon:   FiClock,
    text:   'text-yellow-700',
    bg:     'bg-yellow-50',
    border: 'border-yellow-200',
    bar:    'bg-yellow-400',
  },
};

// Simple barcode-like visual
function FakeBarcode() {
  const bars = Array.from({ length: 40 }, (_, i) => {
    const widths = [1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2];
    return widths[i % widths.length];
  });
  return (
    <div className="flex items-end gap-0.5 h-12 px-2 py-1">
      {bars.map((w, i) => (
        <div key={i} className="bg-[#1A1A2E]" style={{ width: `${w * 2}px`, height: `${60 + ((i * 7) % 40)}%` }} />
      ))}
    </div>
  );
}

export default function TicketDetail() {
  const { ticketNumber } = useParams();
  const [copied, setCopied] = useState(false);

  // Find ticket by number OR id from mock data
  const ticket = dashboardTickets.find(
    t => t.id === ticketNumber || ('WAL-20250415-' + t.id.slice(-5)) === ticketNumber
  ) || dashboardTickets[0]; // fallback to first for demo

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const ticketNum = ticketNumber || `WAL-20250415-00014`;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `WinALot Ticket ${ticketNum}`, url: window.location.href }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link to="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1A4D8F] transition-colors mb-6">
        <FiArrowLeft className="w-4 h-4" /> Back to My Tickets
      </Link>

      {/* Ticket card */}
      <div className={`bg-white rounded-2xl border-2 ${status.border} shadow-lg overflow-hidden mb-4`}>
        {/* Status bar */}
        <div className={`h-1.5 ${status.bar}`} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-dashed border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[#F5C518] text-xl font-black">b</span>
                <span className="text-[#0D2B5E] font-black">WinAL</span>
                <span className="text-[#F5C518] font-black">OTT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" />
              </div>
              <p className="text-xs text-gray-400">Prediction Ticket</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.border} border`}>
              <StatusIcon className={`w-3.5 h-3.5 ${status.text}`} />
              <span className={`text-xs font-black ${status.text}`}>{status.label}</span>
            </div>
          </div>
        </div>

        {/* Match details */}
        <div className="px-6 py-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Match</p>
          <p className="font-black text-[#1A1A2E] text-lg leading-tight mb-4">{ticket.match}</p>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Market</p>
              <span className="inline-block bg-blue-50 text-[#1A4D8F] px-2.5 py-1 rounded-lg text-xs font-bold">{ticket.market}</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Entry Fee</p>
              <p className="font-black text-[#1A4D8F]">${ticket.entryFee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">My Prediction</p>
              <p className="font-bold text-[#1A1A2E] text-sm">{ticket.myPick}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Admin Pick</p>
              <p className="font-bold text-[#1A1A2E] text-sm">{ticket.adminPick}</p>
            </div>
          </div>

          {/* Prize */}
          {ticket.prize > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Prize Won</p>
                <p className="text-2xl font-black text-green-700">${ticket.prize.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FiCalendar className="w-3.5 h-3.5" />
            <span>{ticket.date}</span>
          </div>
        </div>

        {/* Separator + barcode */}
        <div className="border-t border-dashed border-gray-200 mx-4" />
        <div className="flex flex-col items-center py-4 px-6">
          <FakeBarcode />
          <p className="font-mono text-xs text-gray-400 tracking-widest mt-1">{ticketNum}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1A4D8F] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0D2B5E] transition-colors">
          <FiShare2 className="w-4 h-4" /> Share Ticket
        </button>
        <button onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:border-[#1A4D8F] hover:text-[#1A4D8F] transition-colors">
          {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Verify CTA */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <FiCheckCircle className="w-4 h-4 text-[#1A4D8F] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#1A1A2E]">Provably Fair</p>
          <p className="text-xs text-gray-500 mt-0.5">All WinALot draws are cryptographically verifiable.</p>
          <Link to="/verify" className="text-xs text-[#1A4D8F] font-semibold hover:underline mt-1 inline-block">
            Verify this draw →
          </Link>
        </div>
      </div>
    </div>
  );
}
