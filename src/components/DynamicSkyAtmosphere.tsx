import { useMemo } from 'react';
import type { TimePhase, WorldTheme } from '../types/aether';

interface DynamicSkyAtmosphereProps {
  scrollProgress: number;
  theme: WorldTheme;
}

const STARS = Array.from({ length: 48 }, (_, i) => ({
  left: `${(i * 37 + 11) % 96 + 2}%`,
  top: `${(i * 53 + 7) % 72 + 4}%`,
  size: i % 5 === 0 ? 2.4 : i % 2 === 0 ? 1.6 : 1.1,
}));

export function getTimePhaseFromProgress(
  progress: number,
  sanctuaryUnlocked = false,
): TimePhase {
  if (sanctuaryUnlocked && progress > 0.88) return 'Eternity';
  if (progress < 0.18) return 'Sunrise';
  if (progress < 0.42) return 'Daylight';
  if (progress < 0.64) return 'Sunset';
  if (progress < 0.86) return 'Night';
  return 'New Dawn';
}

/**
 * Dynamic atmospheric color wash, starfield, and Digital Universe holographic lattice
 * that shifts smoothly across Sunrise -> Daylight -> Sunset -> Night -> New Dawn.
 */
export function DynamicSkyAtmosphere({ scrollProgress, theme }: DynamicSkyAtmosphereProps) {
  const isDigital = theme === 'digital';

  const { washGradient, starOpacity, horizonGlowOpacity } = useMemo(() => {
    const p = Math.max(0, Math.min(1, scrollProgress));

    let wash = isDigital
      ? 'linear-gradient(180deg, rgba(16,48,110,0.22) 0%, rgba(56,189,248,0.12) 100%)'
      : 'linear-gradient(180deg, rgba(255,190,115,0.06) 0%, rgba(232,122,62,0.08) 100%)';

    if (!isDigital) {
      if (p < 0.22) {
        wash = 'linear-gradient(180deg, rgba(255,186,110,0.06) 0%, rgba(229,138,60,0.09) 100%)';
      } else if (p < 0.46) {
        wash = 'linear-gradient(180deg, rgba(112,168,255,0.09) 0%, rgba(255,214,145,0.07) 100%)';
      } else if (p < 0.66) {
        wash = 'linear-gradient(180deg, rgba(154,96,214,0.08) 0%, rgba(235,122,74,0.09) 100%)';
      } else if (p < 0.88) {
        wash = 'linear-gradient(180deg, rgba(14,18,52,0.18) 0%, rgba(76,48,140,0.12) 100%)';
      } else {
        wash = 'linear-gradient(180deg, rgba(255,208,128,0.1) 0%, rgba(240,148,88,0.12) 100%)';
      }
    } else {
      if (p < 0.35) {
        wash = 'linear-gradient(180deg, rgba(12,35,88,0.28) 0%, rgba(56,189,248,0.14) 100%)';
      } else if (p < 0.72) {
        wash = 'linear-gradient(180deg, rgba(16,28,72,0.28) 0%, rgba(139,92,246,0.14) 100%)';
      } else {
        wash = 'linear-gradient(180deg, rgba(8,22,56,0.25) 0%, rgba(92,225,230,0.14) 100%)';
      }
    }

    let stars = isDigital ? 0.35 : 0.08;
    if (p > 0.45 && p <= 0.78) {
      stars = (isDigital ? 0.35 : 0.08) + ((p - 0.45) / 0.33) * 0.6;
    } else if (p > 0.78) {
      stars = Math.max(isDigital ? 0.35 : 0.12, 0.86 - ((p - 0.78) / 0.22) * 0.65);
    }

    const horizonGlow = p < 0.25 || p > 0.82 ? 0.22 : 0.1;

    return {
      washGradient: wash,
      starOpacity: Math.min(1, stars),
      horizonGlowOpacity: horizonGlow,
    };
  }, [scrollProgress, isDigital]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[15] pointer-events-none overflow-hidden transition-opacity duration-500"
    >
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: washGradient }}
      />

      {/* Digital Universe subtle horizon telemetry lattice */}
      {isDigital && (
        <div
          className="absolute inset-x-0 bottom-0 h-[32vh] opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(92,225,230,0.22) 1px, transparent 1px), linear-gradient(to top, rgba(92,225,230,0.22) 1px, transparent 1px)',
            backgroundSize: '48px 36px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          }}
        />
      )}

      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: starOpacity }}
      >
        {STARS.map((star, idx) => (
          <span
            key={idx}
            className="absolute rounded-full"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: isDigital ? '#B3F4FF' : '#F7F1FF',
              opacity: idx % 3 === 0 ? 0.9 : 0.6,
            }}
          />
        ))}
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 h-[35vh] transition-opacity duration-700 ${
          isDigital
            ? 'bg-gradient-to-t from-[#38BDF8]/18 to-transparent'
            : 'bg-gradient-to-t from-[#E5A94C]/18 to-transparent'
        }`}
        style={{ opacity: horizonGlowOpacity }}
      />
    </div>
  );
}
