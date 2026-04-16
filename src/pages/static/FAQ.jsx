import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { faqItems } from '../../data/mockData';

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1A4D8F] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-black mb-3">FAQs</h1>
        <p className="text-blue-200 max-w-md mx-auto">Everything you need to know about WinALot.</p>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-3">
        {faqItems.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left">
              <span className="font-semibold text-[#1A1A2E] text-sm pr-4">{item.q}</span>
              {open === i ? <FiChevronUp className="w-4 h-4 text-[#1A4D8F] shrink-0" /> : <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-4 border-t border-gray-50">
                <p className="text-sm text-gray-500 leading-relaxed pt-3">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
