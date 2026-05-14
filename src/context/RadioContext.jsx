import { createContext, useContext, useRef, useState, useCallback } from 'react';

export const STATIONS = [
  { id: 1, name: 'WinALott Vibes',    genre: 'Match Day Hype', url: 'https://radio.sternhost.com:8430/radio.mp3' },
  { id: 2, name: 'TalkSPORT',         genre: 'Sports Talk',    url: 'https://stream.talksport.com/ts-extra-aac-64' },
  { id: 3, name: 'BBC Radio 5 Live',  genre: 'Sports News',    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_five_live' },
  { id: 4, name: 'Chill Beats',       genre: 'Lo-fi / Chill',  url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' },
];

const RadioContext = createContext(null);

export function RadioProvider({ children }) {
  const audioRef = useRef(null);
  const [isOpen,    setIsOpen]    = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [station,   setStationState] = useState(STATIONS[0]);
  const [volume,    setVolumeState]  = useState(0.7);
  const [isMuted,   setIsMuted]      = useState(false);
  const [pickerOpen, setPickerOpen]  = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    return audioRef.current;
  }, []);

  const play = useCallback((src) => {
    const audio = getAudio();
    if (src && audio.src !== src) {
      audio.src = src;
      audio.load();
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [getAudio]);

  const pause = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    setIsPlaying(false);
  }, [getAudio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play(station.url);
    }
  }, [isPlaying, pause, play, station.url]);

  const setStation = useCallback((s) => {
    setStationState(s);
    setPickerOpen(false);
    play(s.url);
  }, [play]);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    const audio = getAudio();
    audio.volume = v;
    if (v > 0) setIsMuted(false);
  }, [getAudio]);

  const toggleMute = useCallback(() => {
    const audio = getAudio();
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
  }, [isMuted, getAudio]);

  const openPlayer = useCallback(() => setIsOpen(true), []);
  const closePlayer = useCallback(() => setIsOpen(false), []);

  return (
    <RadioContext.Provider value={{
      isOpen, isPlaying, station, volume, isMuted, pickerOpen,
      STATIONS,
      openPlayer, closePlayer, togglePlay, setStation, setVolume, toggleMute,
      setPickerOpen,
    }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used inside RadioProvider');
  return ctx;
}
