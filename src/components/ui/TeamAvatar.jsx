import { useState } from 'react';

const teamColors = {
  'MCI': { bg: '#1A4D8F', text: '#fff' },
  'CHE': { bg: '#034694', text: '#fff' },
  'RMA': { bg: '#FEBE10', text: '#1A1A2E' },
  'FCB': { bg: '#A50034', text: '#fff' },
  'BAY': { bg: '#DC052D', text: '#fff' },
  'BVB': { bg: '#F5C518', text: '#1A1A2E' },
  'PSG': { bg: '#003087', text: '#fff' },
  'OM':  { bg: '#00A0E3', text: '#fff' },
  'JUV': { bg: '#1A1A2E', text: '#fff' },
  'INT': { bg: '#0068A8', text: '#fff' },
  'ARS': { bg: '#EF0107', text: '#fff' },
  'LIV': { bg: '#C8102E', text: '#fff' },
  'ATM': { bg: '#CB3524', text: '#fff' },
  'SEV': { bg: '#C41E3A', text: '#fff' },
  'TOT': { bg: '#132257', text: '#fff' },
  'MUN': { bg: '#DA020E', text: '#fff' },
  'ACM': { bg: '#FB090B', text: '#fff' },
  'NAP': { bg: '#008CC1', text: '#fff' },
  'CEL': { bg: '#22C55E', text: '#fff' },
  'RAN': { bg: '#1B458F', text: '#fff' },
  'AJX': { bg: '#C8102E', text: '#fff' },
  'PSV': { bg: '#F5072A', text: '#fff' },
  'POR': { bg: '#003B79', text: '#fff' },
  'BEN': { bg: '#D4101E', text: '#fff' },
  'LEI': { bg: '#003090', text: '#fff' },
  'WOL': { bg: '#FDB913', text: '#1A1A2E' },
  'BUR': { bg: '#6C1D45', text: '#fff' },
  'SUN': { bg: '#EB0A1E', text: '#fff' },
  'MID': { bg: '#D71920', text: '#fff' },
  'SHW': { bg: '#003082', text: '#fff' },
};

const defaultColor = { bg: '#1A4D8F', text: '#fff' };

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-16 h-16 text-base',
};

const imgSizes = { sm: 28, md: 34, lg: 48, xl: 56 };

export default function TeamAvatar({ short, logo, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const color = teamColors[short] || defaultColor;
  const label = (short || '??').slice(0, 3);

  const baseClass = `${sizeClasses[size]} rounded-full flex items-center justify-center font-black shrink-0 border-2 border-gray-100 bg-white overflow-hidden`;

  if (logo && !imgError) {
    return (
      <div className={baseClass}>
        <img
          src={logo}
          alt={short}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-black shrink-0 border-2 border-white/20`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {label}
    </div>
  );
}
