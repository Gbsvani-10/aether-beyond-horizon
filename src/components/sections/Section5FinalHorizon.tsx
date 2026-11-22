import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUp, Sparkles } from 'lucide-react';
import { ParallaxLayer } from '../ParallaxLayer';
import { MagneticButton } from '../MagneticButton';
import { CollectibleCrystal } from '../CollectibleCrystal';
import { AETHER_CRYSTALS, type CrystalItem, type WorldTheme } from '../../types/aether';

gsap.registerPlugin(ScrollTrigger);

interface Section5FinalHorizonProps {
  theme: WorldTheme;
  collectedCrystals: string[];
  sanctuaryUnlocked: boolean;
  onCollectCrystal: (crystal: CrystalItem) => void;
  onEnterSanctuary: () => void;
  onExploreAgain: () => void;
}

export function Section5FinalHorizon({
  theme,
  collectedCrystals,
  sanctuaryUnlocked,
  onCollectCrystal,
  onEnterSanctuary,
  onExploreAgain,
}: Section5FinalHorizonProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isDigital = theme === 'digital';
  const horizonCrystal = AETHER_CRYSTALS[4];

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const settleVisible = () => {
      gsap.set(el.children, { opacity: 1, y: 0 });
    };

    const prefersReduced =
      document.documentElement.classList.contains('skip-animations') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ctx: gsap.Context | null = null;
    if (prefersReduced) {
      settleVisible();
    } else {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }, el);
    }

    const onMotionChange = () => {
      if (document.documentElement.classList.contains('skip-animations')) {
        ctx?.revert();
        ctx = null;
        settleVisible();
      }
    };
    window.addEventListener('aether-motion-change', onMotionChange);

    return () => {
      window.removeEventListener('aether-motion-change', onMotionChange);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="horizon"
      aria-labelledby="horizon-heading"
      data-parallax-section="horizon"
      className="relative min-h-[110vh] w-full overflow-hidden flex flex-col justify-between bg-[#0A0E24]"
    >
      {/* Layer 0: Lazy-loaded Final Dawn Backdrop */}
      <ParallaxLayer
        speed={0.10}
        mouseFactor={5}
        zIndex={1}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <div
          className={`relative w-full h-full bg-gradient-to-b ${
            isDigital
              ? 'from-[#060C22] via-[#133563] to-[#38BDF8]'
              : 'from-[#0A0E24] via-[#3A2754] to-[#E69D4F]'
          }`}
        >
          <img
            src="/src/assets/images/bg_final_horizon_1795336493369.jpg"
            alt="Golden sunrise glowing above tranquil clouds and indigo twilight sky"
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center opacity-85 transition-[filter] duration-700 ${
              isDigital ? 'hue-rotate-[170deg] saturate-110' : ''
            }`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#0A0E24]/85 via-[#18163A]/35 to-[#060814]/95"
          />
        </div>
      </ParallaxLayer>

      {/* Layer 1: Radiant Dawn Sun Rising Over Horizon */}
      <ParallaxLayer
        speed={0.14}
        mouseFactor={7}
        zIndex={2}
        className="absolute inset-x-0 top-[26%] flex justify-center pointer-events-none"
      >
        <div className="relative flex items-center justify-center animate-sun-breathe">
          <div
            className={`w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] rounded-full bg-radial blur-2xl ${
              isDigital
                ? 'from-[#8DF2FF]/40 via-[#38BDF8]/15 to-transparent'
                : 'from-[#FFE6A3]/40 via-[#EE9A4B]/15 to-transparent'
            }`}
          />
          <div
            className={`absolute w-[160px] h-[160px] sm:w-[230px] sm:h-[230px] rounded-full bg-radial ${
              isDigital
                ? 'from-[#EBFCFF] via-[#5CE1E6]/85 to-transparent'
                : 'from-[#FFF9E6] via-[#FFD27D]/85 to-transparent'
            }`}
          />
        </div>
      </ParallaxLayer>

      {/* Layer 2: Distant Mountain Range */}
      <ParallaxLayer
        speed={0.18}
        mouseFactor={10}
        zIndex={3}
        className="absolute inset-x-0 bottom-[28%] h-[34vh] pointer-events-none"
      >
        <svg viewBox="0 0 1440 360" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="hor-mtn-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDigital ? '#244A7A' : '#4F386E'} stopOpacity="0.82" />
              <stop offset="100%" stopColor="#19193D" stopOpacity="0.98" />
            </linearGradient>
          </defs>
          <path
            d="M0,250 L140,175 L290,220 L460,125 L620,190 L765,115 L940,195 L1100,130 L1275,200 L1440,150 L1440,360 L0,360 Z"
            fill="url(#hor-mtn-far)"
          />
        </svg>
      </ParallaxLayer>

      {/* Layer 3: Midground Mountain Ridges */}
      <ParallaxLayer
        speed={0.40}
        mouseFactor={18}
        zIndex={4}
        className="absolute inset-x-0 bottom-[22%] h-[30vh] pointer-events-none"
      >
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
          <path
            d="M0,190 L195,120 L380,195 L570,105 L755,180 L945,115 L1145,190 L1335,110 L1440,155 L1440,320 L0,320 Z"
            fill="#131430"
          />
        </svg>
      </ParallaxLayer>

      {/* Layer 4: Foreground Horizon Promontory */}
      <ParallaxLayer
        speed={0.76}
        mouseFactor={26}
        zIndex={5}
        className="absolute inset-x-0 bottom-[16%] h-[22vh] pointer-events-none"
      >
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
          <path
            d="M0,130 L165,92 L355,148 L640,175 L940,168 L1190,115 L1360,90 L1440,125 L1440,220 L0,220 Z"
            fill="#060814"
          />
        </svg>
      </ParallaxLayer>

      {/* Collectible Crystal 5: Aurora Core resting along the upper horizon ridge on mobile and cliff ridge on desktop */}
      <ParallaxLayer
        speed={0.76}
        mouseFactor={26}
        zIndex={12}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full">
          <div className="pointer-events-auto absolute right-[8%] sm:right-[14%] top-[41%] sm:top-auto sm:bottom-[30%]">
            <CollectibleCrystal
              crystal={horizonCrystal}
              collected={collectedCrystals.includes(horizonCrystal.id)}
              theme={theme}
              onCollect={onCollectCrystal}
            />
          </div>
        </div>
      </ParallaxLayer>

      {/* Main Headline & CTAs */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-4xl mx-auto px-6 pt-28 sm:pt-32 pb-10 text-center"
      >
        <p
          className={`text-xs tracking-[0.26em] uppercase mb-4 font-medium ${
            isDigital ? 'text-[#7CE8FF]' : 'text-[#E8C58E]'
          }`}
        >
          Chapter V{' '}
          <span
            aria-hidden="true"
            className={`mx-2 ${isDigital ? 'text-[#5CE1E6]/60' : 'text-[#E5A94C]/60'}`}
          >
            ·
          </span>{' '}
          The Final Horizon
        </p>

        <h2
          id="horizon-heading"
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-wide text-[#FFF8EC] leading-[1.06] drop-shadow-[0_4px_24px_rgba(6,8,20,0.75)] headline-balance"
        >
          THE HORIZON IS ONLY THE BEGINNING.
        </h2>

        <p className="mt-5 text-base sm:text-xl text-[#EAE2D3] max-w-2xl mx-auto leading-relaxed">
          Imagine further. Explore deeper. Create beyond limits.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton>
            <button
              type="button"
              onClick={onExploreAgain}
              className={`min-h-[48px] px-7 py-3.5 inline-flex items-center gap-2.5 text-[#080B1A] font-semibold text-sm tracking-wide rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF8EC] ${
                isDigital
                  ? 'bg-[#5CE1E6] hover:bg-[#9AF4FF] shadow-[0_8px_28px_rgba(92,225,230,0.3)]'
                  : 'bg-[#E5A94C] hover:bg-[#FFD27D] shadow-[0_8px_28px_rgba(229,169,76,0.3)]'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
              <span>Explore Again</span>
            </button>
          </MagneticButton>

          {sanctuaryUnlocked && (
            <MagneticButton>
              <button
                type="button"
                onClick={onEnterSanctuary}
                className={`min-h-[48px] px-6 py-3.5 inline-flex items-center gap-2 bg-[#141036]/85 hover:bg-[#1E174E] border text-[#FFF8EC] font-medium text-sm tracking-wide rounded-lg transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                  isDigital
                    ? 'border-[#5CE1E6]/55 focus-visible:ring-[#5CE1E6]'
                    : 'border-[#FFD27D]/55 focus-visible:ring-[#FFD27D]'
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#FFD27D]'}`}
                />
                <span>Enter Astral Sanctuary</span>
              </button>
            </MagneticButton>
          )}
        </div>
      </div>

      {/* Project Credits & Quiet Footer */}
      <footer
        aria-label="Aether project credits"
        className="relative z-10 bg-[#060814]/95 border-t border-white/10 px-6 pt-10 pb-24 sm:pb-10"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-white/10">
            <div>
              <h3
                className={`text-xs tracking-[0.2em] uppercase font-medium ${
                  isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'
                }`}
              >
                Spatial Choreography
              </h3>
              <p className="mt-2 text-sm text-[#D6D0E4] leading-relaxed">
                Multi-speed scroll parallax calibrated across background, middle, and foreground
                depth planes with damped pointer motion.
              </p>
            </div>
            <div>
              <h3
                className={`text-xs tracking-[0.2em] uppercase font-medium ${
                  isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'
                }`}
              >
                Visual Craft
              </h3>
              <p className="mt-2 text-sm text-[#D6D0E4] leading-relaxed">
                Layered vector landscapes, lazy-loaded 3D PBR artifacts, custom particle shaders,
                and dynamic time-of-day lighting.
              </p>
            </div>
            <div>
              <h3
                className={`text-xs tracking-[0.2em] uppercase font-medium ${
                  isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'
                }`}
              >
                Interactive Audio
              </h3>
              <p className="mt-2 text-sm text-[#D6D0E4] leading-relaxed">
                Procedural Web Audio ambient drone and harmonic chimes responsive to scroll depth,
                portals, and hidden discoveries.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9C96B2]">
            <div className="flex items-center gap-3">
              <span className="font-display text-base tracking-[0.2em] text-[#F4EFE6] font-semibold">
                AETHER
              </span>
              <span aria-hidden="true">·</span>
              <span>Beyond the Horizon</span>
            </div>
            <p>Crafted for the Techfest Creative Web Development Challenge</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
