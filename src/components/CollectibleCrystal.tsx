import { useState } from 'react';
import { Check } from 'lucide-react';
import type { CrystalItem, WorldTheme } from '../types/aether';

interface CollectibleCrystalProps {
  crystal: CrystalItem;
  collected: boolean;
  theme: WorldTheme;
  className?: string;
  onCollect: (crystal: CrystalItem) => void;
}

export function CollectibleCrystal({
  crystal,
  collected,
  theme,
  className = '',
  onCollect,
}: CollectibleCrystalProps) {
  const [justCollected, setJustCollected] = useState(false);

  const handleClick = () => {
    if (collected) return;
    setJustCollected(true);
    onCollect(crystal);
    window.setTimeout(() => setJustCollected(false), 700);
  };

  const primaryColor = theme === 'digital' ? '#5CE1E6' : '#FFD27D';
  const facetLight = theme === 'digital' ? '#C7F9FF' : '#FFF6DC';
  const facetDark = theme === 'digital' ? '#2B7FD9' : '#D9843B';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Collection burst shockwave */}
      {justCollected && (
        <span
          aria-hidden="true"
          className="absolute w-14 h-14 rounded-full border-2 pointer-events-none animate-crystal-burst"
          style={{ borderColor: primaryColor }}
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={collected}
        aria-label={
          collected
            ? `${crystal.name} collected`
            : `Collect hidden crystal: ${crystal.name}`
        }
        title={collected ? `${crystal.name} (Collected)` : `Collect ${crystal.name}`}
        className={`group relative min-w-[44px] min-h-[44px] p-2 rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD27D] ${
          collected
            ? 'opacity-45 cursor-default'
            : 'cursor-pointer hover:scale-115 active:scale-95 animate-crystal-bob'
        }`}
      >
        {/* Ambient halo */}
        {!collected && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: `${primaryColor}40` }}
          />
        )}

        {collected ? (
          <span className="relative z-10 w-6 h-6 rounded-full border border-white/25 bg-[#0A1026]/80 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-[#A6D4BE]" />
          </span>
        ) : (
          <svg
            width="30"
            height="38"
            viewBox="0 0 30 38"
            className="relative z-10 drop-shadow-[0_0_12px_rgba(255,210,125,0.65)]"
            aria-hidden="true"
          >
            <polygon points="15,2 26,14 15,36 4,14" fill={facetDark} stroke={facetLight} strokeWidth="1.1" />
            <polygon points="15,2 26,14 15,18" fill={primaryColor} />
            <polygon points="15,2 15,18 4,14" fill={facetLight} opacity="0.9" />
            <polygon points="15,18 26,14 15,36" fill={primaryColor} opacity="0.7" />
          </svg>
        )}
      </button>
    </div>
  );
}
