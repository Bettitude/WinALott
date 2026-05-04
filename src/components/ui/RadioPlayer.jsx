import { useRef } from 'react';
import {
  FiRadio, FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiX, FiChevronUp, FiMusic,
} from 'react-icons/fi';
import { useRadio, STATIONS } from '../../context/RadioContext';

function EqBars({ playing }) {
  return (
    <div className="flex items-end gap-[2px] h-4 shrink-0">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-[3px] rounded-sm bg-[#F5C518] origin-bottom ${
            playing ? 'animate-eq' : 'opacity-30'
          }`}
          style={{ animationDelay: `${i * 0.12}s`, height: playing ? undefined : '4px' }}
        />
      ))}
    </div>
  );
}

export default function RadioPlayer() {
  const {
    isOpen, isPlaying, station, volume, isMuted, pickerOpen,
    closePlayer, togglePlay, setStation, setVolume, toggleMute, setPickerOpen,
  } = useRadio();

  const volRef = useRef(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop for station picker */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setPickerOpen(false)}
        />
      )}

      <div className="fixed bottom-0 inset-x-0 z-[9999] bg-[#0D2B5E] border-t border-white/10 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-2.5">

          {/* Radio icon */}
          <FiRadio className="w-4 h-4 text-[#F5C518] shrink-0" />

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
          >
            {isPlaying
              ? <FiPause className="w-3.5 h-3.5 text-white" />
              : <FiPlay  className="w-3.5 h-3.5 text-white" />}
          </button>

          {/* Eq bars */}
          <EqBars playing={isPlaying} />

          {/* Station name — clickable to open picker */}
          <div className="relative">
            <button
              onClick={() => setPickerOpen(!pickerOpen)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className="text-white text-xs font-bold whitespace-nowrap">{station.name}</span>
              <span className="text-white/50 text-[10px]">{station.genre}</span>
              <FiChevronUp className={`w-3 h-3 text-white/50 transition-transform ${pickerOpen ? '' : 'rotate-180'}`} />
            </button>

            {/* Station picker popup */}
            {pickerOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#0D2B5E] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[9999]">
                {STATIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStation(s)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/10 transition-colors ${
                      station.id === s.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <FiMusic className="w-3 h-3 text-[#F5C518] shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold">{s.name}</p>
                      <p className="text-white/40 text-[10px]">{s.genre}</p>
                    </div>
                    {station.id === s.id && isPlaying && <EqBars playing={true} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
              {isMuted
                ? <FiVolumeX className="w-4 h-4" />
                : <FiVolume2 className="w-4 h-4" />}
            </button>
            <input
              ref={volRef}
              type="range"
              min={0} max={1} step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-20 accent-[#F5C518] cursor-pointer"
            />
          </div>

          {/* Close */}
          <button
            onClick={closePlayer}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 ml-1"
          >
            <FiX className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>
      </div>
    </>
  );
}
