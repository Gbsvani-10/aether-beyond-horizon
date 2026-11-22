import { useState } from 'react';
import type { ChapterId, WorldTheme } from '../types/aether';

interface ExplorerCompanionProps {
  activeChapter: ChapterId;
  scrollProgress: number;
  theme: WorldTheme;
  skipAnimations: boolean;
}

const EXPLORER_NOTES: Record<ChapterId, string> = {
  awakening: 'The ridge warms beneath the rising sun. Look closely along the slopes.',
  kingdom: 'Gravity loosens here—ancient sanctuaries drift between sunlit clouds.',
  forest: 'Follow the fireflies; even the trees carry quiet memories.',
  gate: 'The star-rings hum in resonance. Every discovery brings us closer.',
  horizon: 'Beyond the dawn ridge lies more than sight alone reveals.',
  sanctuary: 'All five shards sing together at the heart of the Aether.',
};

/**
 * Animated Explorer Companion that travels smoothly across the horizon on both mobile and desktop,
 * adapting stance/aura per chapter and theme.
 */
export function ExplorerCompanion({
  activeChapter,
  scrollProgress,
  theme,
  skipAnimations,
}: ExplorerCompanionProps) {
  const [noteOpen, setNoteOpen] = useState(false);

  const isDigital = theme === 'digital';
  const cloakMain = isDigital ? '#152B4D' : '#261D48';
  const cloakTrim = isDigital ? '#5CE1E6' : '#E5A94C';
  const lanternGlow = isDigital ? '#7CE8FF' : '#FFD27D';
  const isFloatingRealm =
    activeChapter === 'kingdom' ||
    activeChapter === 'gate' ||
    activeChapter === 'sanctuary';

  // Clamp travel within [10%, 76%] so explorer never collides with edges or desktop side rail
  const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
  const horizontalPct = 10 + clampedProgress * 66;
  const popoverAlignClass =
    horizontalPct < 30
      ? 'left-0 translate-x-0'
      : horizontalPct > 62
        ? 'right-0 translate-x-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className="fixed bottom-[64px] sm:bottom-[68px] z-30 pointer-events-none transition-[left] duration-150 ease-out"
      style={{ left: `${horizontalPct}%` }}
    >
      <div className="relative flex flex-col items-center">
        {/* Field Note Popover */}
        {noteOpen && (
          <div
            className={`pointer-events-auto absolute bottom-full mb-2 w-52 sm:w-56 rounded-lg bg-[#080D22]/96 border border-white/15 px-3 py-2 text-[11px] text-[#E8E2D5] shadow-xl leading-relaxed animate-toast-enter ${popoverAlignClass}`}
          >
            <span
              className="block text-[10px] uppercase tracking-wider font-medium mb-0.5"
              style={{ color: lanternGlow }}
            >
              Explorer&apos;s Note
            </span>
            {EXPLORER_NOTES[activeChapter]}
          </div>
        )}

        <button
          type="button"
          onClick={() => setNoteOpen((prev) => !prev)}
          onMouseEnter={() => setNoteOpen(true)}
          onMouseLeave={() => setNoteOpen(false)}
          aria-expanded={noteOpen}
          aria-label="Explorer companion field note"
          className={`pointer-events-auto group relative min-w-[44px] min-h-[44px] p-1 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD27D] ${
            skipAnimations
              ? ''
              : isFloatingRealm
                ? 'animate-float-slow'
                : 'animate-explorer-stride'
          }`}
        >
          {/* Subtle grounding or levitation aura */}
          <span
            aria-hidden="true"
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full blur-[3px] opacity-55"
            style={{ backgroundColor: lanternGlow }}
          />

          <svg
            width="36"
            height="42"
            viewBox="0 0 42 48"
            className="relative z-10 w-8 h-9 sm:w-10 sm:h-11 drop-shadow-[0_6px_12px_rgba(4,6,18,0.85)]"
            aria-hidden="true"
          >
            {/* Floating skiff/ring in sky/cosmic chapters */}
            {isFloatingRealm && (
              <ellipse
                cx="21"
                cy="42"
                rx="13"
                ry="3.5"
                fill="none"
                stroke={cloakTrim}
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
            )}

            {/* Flowing scarf */}
            <path
              d="M18,17 Q10,19 6,24 Q12,23 18,21 Z"
              fill={cloakTrim}
              opacity="0.9"
            />

            {/* Traveler cloak body */}
            <path
              d="M21,14 L29,37 L13,37 Z"
              fill={cloakMain}
              stroke={cloakTrim}
              strokeWidth="1.1"
            />

            {/* Hooded head */}
            <circle cx="21" cy="11.5" r="5" fill={cloakMain} stroke={cloakTrim} strokeWidth="1.1" />
            <circle cx="22.5" cy="11.5" r="1.4" fill={lanternGlow} />

            {/* Staff & glowing lantern */}
            <line x1="31" y1="12" x2="31" y2="39" stroke="#C8B696" strokeWidth="1.4" />
            <circle cx="31" cy="11" r="3.2" fill={lanternGlow} />
          </svg>
        </button>
      </div>
    </div>
  );
}
