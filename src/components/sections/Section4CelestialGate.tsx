import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { ParallaxLayer } from '../ParallaxLayer';
import { MagneticButton } from '../MagneticButton';
import { CollectibleCrystal } from '../CollectibleCrystal';
import {
  AETHER_CRYSTALS,
  type ChapterId,
  type CrystalItem,
  type WorldTheme,
} from '../../types/aether';

gsap.registerPlugin(ScrollTrigger);

interface Section4CelestialGateProps {
  theme: WorldTheme;
  collectedCrystals: string[];
  onCollectCrystal: (crystal: CrystalItem) => void;
  onPortalTravel: (from: ChapterId, to: ChapterId, label: string) => void;
}

export function Section4CelestialGate({
  theme,
  collectedCrystals,
  onCollectCrystal,
  onPortalTravel,
}: Section4CelestialGateProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const portalWrapRef = useRef<HTMLDivElement>(null);
  const portalCoreRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [gateAwakened, setGateAwakened] = useState(false);

  const isDigital = theme === 'digital';
  const cosmosCrystal = AETHER_CRYSTALS[3];

  useEffect(() => {
    const section = sectionRef.current;
    const portal = portalWrapRef.current;
    const core = portalCoreRef.current;
    const heading = headingRef.current;
    if (!section || !portal || !core || !heading) return;

    const settleVisible = () => {
      gsap.set(portal, { opacity: 1, scale: 1 });
      gsap.set(core, { opacity: 0.9, scale: 1 });
      gsap.set(heading.children, { opacity: 1, y: 0 });
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
          portal,
          { scale: 0.65, opacity: 0.25 },
          {
            scale: 1.04,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'center center',
              scrub: 0.8,
            },
          },
        );

        gsap.fromTo(
          core,
          { opacity: 0.15, scale: 0.5 },
          {
            opacity: 0.95,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 65%',
              end: 'center center',
              scrub: 0.8,
            },
          },
        );

        gsap.fromTo(
          heading.children,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }, section);
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
      id="gate"
      ref={sectionRef}
      aria-labelledby="gate-heading"
      data-parallax-section="gate"
      className="relative min-h-[115vh] w-full overflow-hidden flex flex-col items-center justify-between pt-20 pb-24 sm:py-24 bg-[#050614]"
    >
      {/* Layer 0: Lazy-loaded Cosmic Nebula & Distant Galaxy Backdrop */}
      <ParallaxLayer
        speed={0.12}
        mouseFactor={5}
        zIndex={1}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <div
          className={`relative w-full h-full bg-gradient-to-b ${
            isDigital
              ? 'from-[#04091A] via-[#0B1F4A] to-[#050A1F]'
              : 'from-[#050614] via-[#1B123B] to-[#08091E]'
          }`}
        >
          <img
            src="/src/assets/images/bg_celestial_cosmos_1795336493195.jpg"
            alt="Deep cosmic nebula and spiral galaxy bathed in violet and golden stardust"
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center opacity-80 transition-[filter] duration-700 ${
              isDigital ? 'hue-rotate-[175deg] saturate-110' : ''
            }`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#050614]/85 via-transparent to-[#080B1F]/90"
          />
        </div>
      </ParallaxLayer>

      {/* Layer 1: Stars & Ringed Celestial Planets */}
      <ParallaxLayer
        speed={0.22}
        mouseFactor={10}
        zIndex={2}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full">
          <div className="absolute right-[8%] sm:right-[14%] top-[14%] w-[110px] sm:w-[155px] opacity-85">
            <svg viewBox="0 0 180 140" className="w-full h-auto" aria-hidden="true">
              <defs>
                <radialGradient id="planet-grad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor={isDigital ? '#7CE8FF' : '#F5C487'} />
                  <stop offset="55%" stopColor={isDigital ? '#2563EB' : '#6D4B9E'} />
                  <stop offset="100%" stopColor="#140E2C" />
                </radialGradient>
              </defs>
              <ellipse
                cx="90"
                cy="70"
                rx="78"
                ry="18"
                transform="rotate(-18 90 70)"
                stroke={isDigital ? '#5CE1E6' : '#D8B6FF'}
                strokeOpacity="0.45"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="90" cy="70" r="36" fill="url(#planet-grad)" />
            </svg>
          </div>

          <div className="absolute left-[8%] sm:left-[14%] top-[20%] w-[56px] sm:w-[86px] opacity-75">
            <svg viewBox="0 0 100 100" className="w-full h-auto" aria-hidden="true">
              <circle cx="50" cy="50" r="28" fill="#E8D7FF" opacity="0.22" />
              <path
                d="M55,22 A28,28 0 1,0 78,66 A22,22 0 1,1 55,22 Z"
                fill={isDigital ? '#9BF4FF' : '#FBE5B8'}
              />
            </svg>
          </div>
        </div>
      </ParallaxLayer>

      {/* Layer 2.5: Collectible Crystal 4 (Astral Tear) kept unobscured above foreground rocks & below header */}
      <ParallaxLayer
        speed={0.28}
        mouseFactor={12}
        zIndex={12}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full">
          <div className="pointer-events-auto absolute left-[6%] sm:left-[15%] top-[44%] sm:top-[35%]">
            <CollectibleCrystal
              crystal={cosmosCrystal}
              collected={collectedCrystals.includes(cosmosCrystal.id)}
              theme={theme}
              onCollect={onCollectCrystal}
            />
          </div>
        </div>
      </ParallaxLayer>

      {/* Top Narrative Title */}
      <div ref={headingRef} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p
          className={`text-xs tracking-[0.26em] uppercase mb-3 font-medium ${
            isDigital ? 'text-[#7CE8FF]' : 'text-[#C9B3F5]'
          }`}
        >
          Chapter IV{' '}
          <span
            aria-hidden="true"
            className={`mx-2 ${isDigital ? 'text-[#5CE1E6]/60' : 'text-[#E5A94C]/60'}`}
          >
            ·
          </span>{' '}
          The Celestial Gate
        </p>
        <h2
          id="gate-heading"
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-wide text-[#FAF5FF] leading-[1.06] headline-balance"
        >
          THRESHOLD OF THE STARS
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#D3CBE8] max-w-xl mx-auto leading-relaxed">
          Beyond the final canopy, ancient monoliths orbit a luminous rift—bridging earthly
          memory with uncharted cosmic expanse.
        </p>
      </div>

      {/* Layer 2: Giant Scroll-Revealed Celestial Gate Portal */}
      <ParallaxLayer
        speed={0.42}
        mouseFactor={18}
        zIndex={5}
        className="relative my-8 sm:my-10 flex items-center justify-center w-full"
      >
        <div
          ref={portalWrapRef}
          onMouseEnter={() => setGateAwakened(true)}
          onMouseLeave={() => setGateAwakened(false)}
          className="relative w-[290px] h-[290px] sm:w-[420px] sm:h-[420px] lg:w-[470px] lg:h-[470px] flex items-center justify-center"
        >
          <div
            ref={portalCoreRef}
            className={`absolute inset-[18%] rounded-full bg-radial transition-all duration-500 ${
              isDigital
                ? 'from-[#E6FCFF] via-[#5CE1E6]/70 to-[#2563EB]/0'
                : 'from-[#FFF7DF] via-[#E5A94C]/70 to-[#6A3EC8]/0'
            } ${gateAwakened ? 'brightness-125 scale-105' : ''}`}
          />

          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full animate-spin-slow"
            aria-hidden="true"
          >
            <circle
              cx="200"
              cy="200"
              r="182"
              stroke={isDigital ? '#7CE8FF' : '#C9A8FF'}
              strokeOpacity="0.38"
              strokeWidth="1.5"
              strokeDasharray="10 14"
              fill="none"
            />
            <circle
              cx="200"
              cy="200"
              r="164"
              stroke={isDigital ? '#5CE1E6' : '#FFD27D'}
              strokeOpacity="0.65"
              strokeWidth="2.5"
              strokeDasharray="48 18 12 18"
              fill="none"
            />
          </svg>

          <svg
            viewBox="0 0 400 400"
            className="absolute inset-[8%] w-[84%] h-[84%] animate-spin-reverse-slow"
            aria-hidden="true"
          >
            <circle
              cx="200"
              cy="200"
              r="152"
              stroke={isDigital ? '#B8F6FF' : '#FFE4A8'}
              strokeOpacity="0.7"
              strokeWidth="2"
              strokeDasharray="24 10 4 10"
              fill="none"
            />
            <polygon
              points="200,32 345,284 55,284"
              stroke={isDigital ? '#38BDF8' : '#B48CFF'}
              strokeOpacity="0.38"
              strokeWidth="1.2"
              fill="none"
            />
            <polygon
              points="200,368 345,116 55,116"
              stroke={isDigital ? '#5CE1E6' : '#FFD27D'}
              strokeOpacity="0.38"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>

          <MagneticButton>
            <button
              type="button"
              onClick={() => onPortalTravel('gate', 'horizon', 'EMERGING AT THE FINAL HORIZON')}
              className={`relative z-10 w-[170px] h-[170px] sm:w-[225px] sm:h-[225px] rounded-full border bg-[#120D29]/60 hover:bg-[#1E1542]/80 flex flex-col items-center justify-center text-center px-4 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 group ${
                isDigital
                  ? 'border-[#5CE1E6]/50 focus-visible:ring-[#5CE1E6]'
                  : 'border-[#FFD27D]/45 focus-visible:ring-[#FFD27D]'
              }`}
            >
              <span
                className={`font-display text-lg sm:text-2xl tracking-[0.14em] text-[#FFF7E8] transition-colors ${
                  isDigital ? 'group-hover:text-[#7CE8FF]' : 'group-hover:text-[#FFD27D]'
                }`}
              >
                ENTER THE RIFT
              </span>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase ${
                  isDigital ? 'text-[#9FEFFF]' : 'text-[#E5C68D]'
                }`}
              >
                <span>Step Beyond</span>
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </span>
            </button>
          </MagneticButton>
        </div>
      </ParallaxLayer>

      {/* Layer 3: Foreground Floating Obsidian Rocks */}
      <ParallaxLayer
        speed={0.82}
        mouseFactor={30}
        zIndex={7}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 180 150"
            className="absolute left-[4%] bottom-[16%] w-[120px] sm:w-[190px] opacity-95"
            aria-hidden="true"
          >
            <path d="M18,55 L75,20 L145,58 L122,125 L48,136 Z" fill="#060714" />
          </svg>
          <svg
            viewBox="0 0 180 150"
            className="absolute right-[5%] bottom-[22%] w-[105px] sm:w-[170px] opacity-95"
            aria-hidden="true"
          >
            <path d="M25,45 L95,18 L155,62 L135,120 L55,128 Z" fill="#060714" />
          </svg>
        </div>
      </ParallaxLayer>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 z-10 bg-gradient-to-t from-[#0A0E24] to-transparent pointer-events-none"
      />
    </section>
  );
}
