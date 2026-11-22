import type { WorldTheme } from '../types/aether';

interface PortalTransitionOverlayProps {
  active: boolean;
  label: string;
  theme?: WorldTheme;
}

/**
 * Cinematic radial zoom & fade overlay rendered briefly when traversing an interactive portal.
 */
export function PortalTransitionOverlay({
  active,
  label,
  theme = 'fantasy',
}: PortalTransitionOverlayProps) {
  const isDigital = theme === 'digital';

  return (
    <div
      aria-hidden={!active}
      className={`fixed inset-0 z-[70] pointer-events-none flex items-center justify-center transition-all duration-500 ease-out ${
        active ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
      }`}
    >
      <div
        className={`absolute inset-0 bg-radial ${
          isDigital
            ? 'from-[#5CE1E6]/35 via-[#13295E]/92 to-[#040713]/98'
            : 'from-[#FFD27D]/35 via-[#2E1E59]/90 to-[#050814]/98'
        }`}
      />
      <div className="relative z-10 text-center px-6">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full border flex items-center justify-center transition-transform duration-500 ${
            active ? 'scale-100' : 'scale-75'
          } ${isDigital ? 'border-[#5CE1E6]/65' : 'border-[#FFD27D]/60'}`}
        >
          <div
            className={`w-7 h-7 rounded-full ${
              isDigital
                ? 'bg-[#5CE1E6]/85 shadow-[0_0_32px_rgba(92,225,230,0.9)]'
                : 'bg-[#FFD27D]/80 shadow-[0_0_32px_rgba(255,210,125,0.9)]'
            }`}
          />
        </div>
        <p className="font-display text-xl sm:text-3xl tracking-[0.22em] text-[#FFF8EC]">
          {label}
        </p>
      </div>
    </div>
  );
}
