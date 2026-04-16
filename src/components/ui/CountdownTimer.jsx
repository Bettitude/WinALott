import { useState, useEffect } from 'react';

function pad(n) { return String(n).padStart(2, '0'); }

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setExpired(true); return; }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) {
    return (
      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
        Starting Soon
      </span>
    );
  }

  const blocks = [
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEC', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {blocks.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="bg-[#1A4D8F] text-white font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center leading-none">
              {pad(value)}
            </div>
            <span className="text-gray-400 text-xs mt-0.5 font-medium">{label}</span>
          </div>
          {i < blocks.length - 1 && <span className="text-[#1A4D8F] font-black text-xl pb-4">:</span>}
        </div>
      ))}
    </div>
  );
}
