import { useRef, useState, useEffect, useCallback } from 'react';
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
    openPlayer, closePlayer, togglePlay, setStation, setVolume, toggleMute, setPickerOpen,
  } = useRadio();

  const volRef  = useRef(null);
  const pillRef = useRef(null);

  // null = CSS default (bottom-20 right-4), object = dragged {x, y}
  const [pos,      setPos]      = useState(null);
  const [snapping, setSnapping] = useState(false);
  const dragging  = useRef(false);
  const offset    = useRef({ dx: 0, dy: 0 });

  const snapToEdge = useCallback(() => {
    dragging.current = false;
    setPos(prev => {
      if (!prev || !pillRef.current) return prev;
      const w      = pillRef.current.offsetWidth || 120;
      const snapX  = prev.x + w / 2 < window.innerWidth / 2
        ? 8
        : window.innerWidth - w - 8;
      return { ...prev, x: snapX };
    });
    setSnapping(true);
    setTimeout(() => setSnapping(false), 350);
  }, []);

  const startDrag = useCallback((clientX, clientY) => {
    const rect = pillRef.current?.getBoundingClientRect();
    if (!rect) return;
    offset.current   = { dx: clientX - rect.left, dy: clientY - rect.top };
    dragging.current = true;
    setSnapping(false);
  }, []);

  const moveDrag = useCallback((clientX, clientY) => {
    if (!dragging.current || !pillRef.current) return;
    const w = pillRef.current.offsetWidth  || 120;
    const h = pillRef.current.offsetHeight ||  40;
    const x = Math.max(8, Math.min(clientX - offset.current.dx, window.innerWidth  - w - 8));
    const y = Math.max(8, Math.min(clientY - offset.current.dy, window.innerHeight - h - 8));
    setPos({ x, y });
  }, []);

  useEffect(() => {
    const onMove  = (e) => moveDrag(e.clientX, e.clientY);
    const onTMove = (e) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); };
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseup',    snapToEdge);
    window.addEventListener('touchmove',  onTMove, { passive: false });
    window.addEventListener('touchend',   snapToEdge);
    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseup',    snapToEdge);
      window.removeEventListener('touchmove',  onTMove);
      window.removeEventListener('touchend',   snapToEdge);
    };
  }, [moveDrag, snapToEdge]);

  const handleOpen = () => { setPos(null); openPlayer(); };

  const pillStyle = pos
    ? {
        position:   'fixed',
        left:       pos.x,
        top:        pos.y,
        zIndex:     9999,
        transition: snapping ? 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
      }
    : {};

  const pillBase  = 'flex items-center gap-2 bg-[#0D2B5E] border border-white/10 rounded-full shadow-2xl px-3 py-2 select-none';
  const pillFixed = !pos ? 'fixed bottom-20 right-4 z-[9999]' : '';

  return (
    <>
      {/* ── Mini floating pill — draggable + snap-to-edge ── */}
      {!isOpen && (
        <div
          ref={pillRef}
          style={pillStyle}
          className={`${pillFixed} ${pillBase} ${dragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={(e) => {
            if (e.target.closest('button')) return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.target.closest('button')) return;
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
          }}
        >
          <FiRadio className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
          {isPlaying && <EqBars playing />}
          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <FiPause className="w-3 h-3 text-white" />
              : <FiPlay  className="w-3 h-3 text-white" />}
          </button>
          <button
            onClick={handleOpen}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Open player"
          >
            <FiChevronUp className="w-3 h-3 text-white/50" />
          </button>
        </div>
      )}

      {/* ── Full player bar ── */}
      {isOpen && (
        <>
          {pickerOpen && (
            <div className="fixed inset-0 z-[9998]" onClick={() => setPickerOpen(false)} />
          )}

          <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-[9999] bg-[#0D2B5E] border-t border-white/10 shadow-2xl">
            <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-2.5">

              <FiRadio className="w-4 h-4 text-[#F5C518] shrink-0" />

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                {isPlaying
                  ? <FiPause className="w-3.5 h-3.5 text-white" />
                  : <FiPlay  className="w-3.5 h-3.5 text-white" />}
              </button>

              <EqBars playing={isPlaying} />

              <div className="relative">
                <button
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <span className="text-white text-xs font-bold whitespace-nowrap">{station.name}</span>
                  <span className="text-white/50 text-[10px]">{station.genre}</span>
                  <FiChevronUp className={`w-3 h-3 text-white/50 transition-transform ${pickerOpen ? '' : 'rotate-180'}`} />
                </button>

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

              <div className="flex-1" />

              <div className="hidden sm:flex items-center gap-2">
                <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                  {isMuted
                    ? <FiVolumeX className="w-4 h-4" />
                    : <FiVolume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  ref={volRef}
                  min={0} max={1} step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-20 accent-[#F5C518] cursor-pointer"
                />
              </div>

              <button
                onClick={closePlayer}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 ml-1"
                title="Minimise"
              >
                <FiX className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
