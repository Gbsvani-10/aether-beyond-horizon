import { useEffect } from 'react';
import { ArrowUp, Sparkles, X } from 'lucide-react';
import type { WorldTheme } from '../types/aether';

interface CinematicEndingModalProps {
  open: boolean;
  theme: WorldTheme;
  discoveriesCount: number;
  totalDiscoveries: number;
  crystalsCount: number;
  totalCrystals: number;
  onEnterSanctuary: () => void;
  onReplayJourney: () => void;
  onClose: () => void;
}

export function CinematicEndingModal({
  open,
  theme,
  discoveriesCount,
  totalDiscoveries,
  crystalsCount,
  totalCrystals,
  onEnterSanctuary,
  onReplayJourney,
  onClose,
}: CinematicEndingModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isDigital = theme === 'digital';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cinematic Journey Finale"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[85] flex items-center justify-center p-4 sm:p-6 bg-[#040612]/95"
    >
      <div
        className={`relative w-full max-w-2xl bg-[#090E23] border rounded-2xl p-6 sm:p-10 text-center shadow-2xl overflow-hidden animate-modal-enter ${
          isDigital ? 'border-[#5CE1E6]/45' : 'border-[#E5A94C]/40'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ending sequence"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-md text-[#B6B0CA] hover:text-white hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celestial Ring Emblem */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-6 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full animate-spin-slow" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke={isDigital ? '#5CE1E6' : '#FFD27D'}
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="16 10"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="38"
              stroke="#A78BFA"
              strokeOpacity="0.65"
              strokeWidth="1.5"
              strokeDasharray="24 8"
              fill="none"
            />
          </svg>
          <Sparkles
            className={`w-7 h-7 absolute ${isDigital ? 'text-[#5CE1E6]' : 'text-[#FFD27D]'}`}
          />
        </div>

        <p
          className={`text-xs tracking-[0.26em] uppercase font-medium ${
            isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'
          }`}
        >
          The Explorer Experience Complete
        </p>

        <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-[#FFF8EC] leading-[1.08] headline-balance">
          ALL HORIZONS AWAKENED
        </h2>

        <p className="mt-4 text-sm sm:text-base text-[#D7D2E5] max-w-lg mx-auto leading-relaxed">
          You have uncovered every hidden relic and reunited all five Aether Crystals across the
          realms. The Astral Sanctuary now stands open in perpetual harmony.
        </p>

        {/* Clean Unboxed Summary Strip */}
        <div className="mt-7 py-4 border-y border-white/10 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#A6A0BC]">Discoveries</p>
            <p
              className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
                isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
              }`}
            >
              {discoveriesCount}/{totalDiscoveries}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#A6A0BC]">Crystals</p>
            <p
              className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
                isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
              }`}
            >
              {crystalsCount}/{totalCrystals}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#A6A0BC]">Realm Mode</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#FFF8EC]">
              {isDigital ? 'Digital' : 'Fantasy'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onEnterSanctuary}
            className={`min-h-[44px] px-6 py-2.5 rounded-lg text-[#080B1A] text-xs font-semibold tracking-wide cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isDigital
                ? 'bg-[#5CE1E6] hover:bg-[#9AF4FF]'
                : 'bg-[#E5A94C] hover:bg-[#FFD27D]'
            }`}
          >
            Enter Astral Sanctuary
          </button>
          <button
            type="button"
            onClick={onReplayJourney}
            className="min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2 rounded-lg border border-white/20 text-xs font-medium text-[#EDE7DA] hover:text-white hover:border-white/40 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Replay from Dawn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
