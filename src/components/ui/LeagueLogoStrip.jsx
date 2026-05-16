import { useState } from 'react';

// ─── League data for each row ─────────────────────────────────────────────────
const row1 = [
  { name: 'Premier League',    url: 'https://media.api-sports.io/football/leagues/39.png' },
  { name: 'MLS',               url: 'https://media.api-sports.io/football/leagues/253.png' },
  { name: 'Copa Libertadores', url: 'https://media.api-sports.io/football/leagues/13.png' },
  { name: 'World Cup',         url: 'https://media.api-sports.io/football/leagues/1.png' },
  { name: 'AFCON',             url: 'https://media.api-sports.io/football/leagues/6.png' },
  { name: 'Europa League',     url: 'https://media.api-sports.io/football/leagues/3.png' },
  { name: 'CAF CL',            url: null },
  { name: 'La Liga',           url: 'https://media.api-sports.io/football/leagues/140.png' },
  { name: 'Serie A',           url: 'https://media.api-sports.io/football/leagues/135.png' },
  { name: 'FA Cup',            url: 'https://media.api-sports.io/football/leagues/45.png' },
];

const row2 = [
  { name: 'Champions League',  url: 'https://media.api-sports.io/football/leagues/2.png' },
  { name: 'Bundesliga',        url: 'https://media.api-sports.io/football/leagues/78.png' },
  { name: 'Copa America',      url: 'https://media.api-sports.io/football/leagues/9.png' },
  { name: 'Euro 2024',         url: 'https://media.api-sports.io/football/leagues/4.png' },
  { name: 'Ligue 1',           url: 'https://media.api-sports.io/football/leagues/61.png' },
  { name: 'Super Lig',         url: 'https://media.api-sports.io/football/leagues/203.png' },
  { name: 'CONMEBOL',          url: null },
  { name: 'Asian Cup',         url: 'https://media.api-sports.io/football/leagues/7.png' },
  { name: 'FA Cup',            url: 'https://media.api-sports.io/football/leagues/45.png' },
  { name: 'Eredivisie',        url: 'https://media.api-sports.io/football/leagues/88.png' },
];

const row3 = [
  { name: 'FA Cup',            url: 'https://media.api-sports.io/football/leagues/45.png' },
  { name: 'Serie A',           url: 'https://media.api-sports.io/football/leagues/135.png' },
  { name: 'Asian Cup',         url: 'https://media.api-sports.io/football/leagues/7.png' },
  { name: 'UEFA Euro',         url: 'https://media.api-sports.io/football/leagues/4.png' },
  { name: 'Olympics',          url: null },
  { name: 'Champions League',  url: 'https://media.api-sports.io/football/leagues/2.png' },
  { name: 'Ligue 1',           url: 'https://media.api-sports.io/football/leagues/61.png' },
  { name: 'La Liga',           url: 'https://media.api-sports.io/football/leagues/140.png' },
  { name: 'Copa del Rey',      url: 'https://media.api-sports.io/football/leagues/143.png' },
  { name: 'Bundesliga',        url: 'https://media.api-sports.io/football/leagues/78.png' },
];

// ─── Single logo tile ─────────────────────────────────────────────────────────
function LogoItem({ name, url }) {
  const [imgError, setImgError] = useState(false);
  // Build initials from first letter of each word, max 2 chars
  const abbr = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      title={name}
      className="w-16 h-16 rounded-xl bg-[#F3F4F6] dark:bg-slate-700 flex items-center justify-center mx-3 shrink-0 shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 cursor-pointer"
    >
      {!imgError && url ? (
        <img
          src={url}
          alt={name}
          className="w-10 h-10 object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-[#0D2B5E] dark:text-slate-200 font-black text-sm select-none">{abbr}</span>
      )}
    </div>
  );
}

// ─── One scrolling row ────────────────────────────────────────────────────────
function ScrollRow({ logos, direction, speed, paused }) {
  const doubled = [...logos, ...logos];
  const animName = direction === 'left' ? 'scrollLeft' : 'scrollRight';

  return (
    <div className="flex py-1" style={{
      animation: `${animName} ${speed}s linear infinite`,
      animationPlayState: paused ? 'paused' : 'running',
    }}>
      {doubled.map((logo, i) => (
        <LogoItem key={`${logo.name}-${i}`} name={logo.name} url={logo.url} />
      ))}
    </div>
  );
}

// ─── Section component ────────────────────────────────────────────────────────
export default function LeagueLogoStrip() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="bg-white dark:bg-slate-900 py-16 px-4">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#0D2B5E] dark:text-white">Diverse League Coverage</h2>
        <p className="text-[#1A4D8F] dark:text-blue-400 text-sm mt-1">A wide variety of leagues for every fan</p>
      </div>

      {/* Strip container */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left fade mask */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
        {/* Right fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

        {/* Row 1 — left, 35s */}
        <ScrollRow logos={row1} direction="left"  speed={35} paused={paused} />

        {/* Row 2 — right, 45s */}
        <div className="mt-4">
          <ScrollRow logos={row2} direction="right" speed={45} paused={paused} />
        </div>

        {/* Row 3 — left, 40s */}
        <div className="mt-4">
          <ScrollRow logos={row3} direction="left"  speed={40} paused={paused} />
        </div>
      </div>
    </section>
  );
}
