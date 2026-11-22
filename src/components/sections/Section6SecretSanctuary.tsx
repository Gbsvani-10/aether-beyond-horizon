import { useState } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import { ParallaxLayer } from '../ParallaxLayer';
import { MagneticButton } from '../MagneticButton';
import { AETHER_CRYSTALS, type WorldTheme } from '../../types/aether';

interface Section6SecretSanctuaryProps {
  theme: WorldTheme;
  allCompleted: boolean;
  onResonate: (freq: number) => void;
  onOpenEnding: () => void;
  onBackToTop: () => void;
}

/**
 * Secret 6th Environment unlocked when all 5 Aether Crystals are collected.
 */
export function Section6SecretSanctuary({
  theme,
  allCompleted,
  onResonate,
  onOpenEnding,
  onBackToTop,
}: Section6SecretSanctuaryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const isDigital = theme === 'digital';
  const activeCrystal = AETHER_CRYSTALS[selectedIdx] ?? AETHER_CRYSTALS[0];
  const freqs = [523.25, 587.33, 659.25, 783.99, 880.0];

  return (
    <section
      id="sanctuary"
      aria-labelledby="sanctuary-heading"
      data-parallax-section="sanctuary"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-24 pb-28 sm:py-24 px-6 bg-gradient-to-b from-[#060814] via-[#140F33] to-[#050712]"
    >
      {/* Background Cosmic Lattice */}
      <ParallaxLayer
        speed={0.14}
        mouseFactor={6}
        zIndex={1}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className={`w-[540px] h-[540px] rounded-full blur-3xl opacity-30 ${
              isDigital
                ? 'bg-radial from-[#5CE1E6]/45 via-[#3B82F6]/20 to-transparent'
                : 'bg-radial from-[#FFD27D]/45 via-[#8B5CF6]/20 to-transparent'
            }`}
          />
        </div>
      </ParallaxLayer>

      {/* Midground Floating Harmonic Altar */}
      <ParallaxLayer
        speed={0.38}
        mouseFactor={14}
        zIndex={4}
        className="relative z-10 max-w-4xl w-full text-center"
      >
        <p
          className={`text-xs tracking-[0.26em] uppercase mb-3 font-medium ${
            isDigital ? 'text-[#7CE8FF]' : 'text-[#E8C58E]'
          }`}
        >
          Secret Realm VI{' '}
          <span
            aria-hidden="true"
            className={`mx-2 ${isDigital ? 'text-[#5CE1E6]/60' : 'text-[#E5A94C]/60'}`}
          >
            ·
          </span>{' '}
          Unlocked
        </p>
        <h2
          id="sanctuary-heading"
          className="font-display text-4xl sm:text-6xl font-semibold tracking-wide text-[#FFF8EC] headline-balance"
        >
          THE ASTRAL SANCTUARY
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#D7D2E5] max-w-xl mx-auto leading-relaxed">
          All five Aether Crystals have converged here above the horizon. Touch any orbiting shard
          to sound its harmonic resonance.
        </p>

        {/* Orbiting 5-Crystal Harmonic Pedestal */}
        <div
          role="group"
          aria-label="Aether crystal harmonic altar"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {AETHER_CRYSTALS.map((crystal, idx) => {
            const active = selectedIdx === idx;
            return (
              <button
                key={crystal.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedIdx(idx);
                  onResonate(freqs[idx]);
                }}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                  isDigital ? 'focus-visible:ring-[#5CE1E6]' : 'focus-visible:ring-[#FFD27D]'
                } ${
                  active
                    ? isDigital
                      ? 'bg-[#5CE1E6]/20 border-[#5CE1E6] text-[#C7F9FF]'
                      : 'bg-[#E5A94C]/20 border-[#FFD27D] text-[#FFD27D]'
                    : 'bg-[#0C122B]/85 border-white/15 text-[#C8C3D8] hover:text-white'
                }`}
              >
                {crystal.name}
              </button>
            );
          })}
        </div>

        <div className="mt-6 max-w-lg mx-auto bg-[#090F26]/92 border border-white/15 rounded-xl p-5">
          <div
            className={`flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-medium ${
              isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeCrystal.name}</span>
          </div>
          <p className="mt-2 text-sm text-[#D6D0E4] leading-relaxed">{activeCrystal.lore}</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {allCompleted && (
            <MagneticButton>
              <button
                type="button"
                onClick={onOpenEnding}
                className={`min-h-[46px] px-6 py-3 rounded-lg text-[#080B1A] text-xs font-semibold tracking-wide cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF8EC] ${
                  isDigital
                    ? 'bg-[#5CE1E6] hover:bg-[#9AF4FF]'
                    : 'bg-[#E5A94C] hover:bg-[#FFD27D]'
                }`}
              >
                View Cinematic Finale
              </button>
            </MagneticButton>
          )}
          <button
            type="button"
            onClick={onBackToTop}
            className={`min-h-[46px] px-5 py-3 inline-flex items-center gap-2 rounded-lg border border-white/20 text-xs font-medium text-[#E5DFD2] hover:text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 ${
              isDigital ? 'focus-visible:ring-[#5CE1E6]' : 'focus-visible:ring-[#E5A94C]'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
            <span>Return to Dawn</span>
          </button>
        </div>
      </ParallaxLayer>
    </section>
  );
}
