import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown, Compass } from 'lucide-react';
import { ParallaxLayer } from '../ParallaxLayer';
import { MagneticButton } from '../MagneticButton';
import { CollectibleCrystal } from '../CollectibleCrystal';
import {
  AETHER_CRYSTALS,
  type ChapterId,
  type CrystalItem,
  type WorldTheme,
} from '../../types/aether';

interface Section1AwakeningProps {
  theme: WorldTheme;
  discoveredIds: string[];
  collectedCrystals: string[];
  onExploreClick: () => void;
  onDiscover: (id: string) => void;
  onCollectCrystal: (crystal: CrystalItem) => void;
  onPortalTravel: (from: ChapterId, to: ChapterId, label: string) => void;
}

export function Section1Awakening({
  theme,
  discoveredIds,
  collectedCrystals,
  onExploreClick,
  onDiscover,
  onCollectCrystal,
  onPortalTravel,
}: Section1AwakeningProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const sundialFound = discoveredIds.includes('sundial-stone');
  const dawnCrystal = AETHER_CRYSTALS[0];
  const isDigital = theme === 'digital';

  useEffect(() => {
    const el = titleGroupRef.current;
    if (!el) return;

    const checkReduced = () =>
      document.documentElement.classList.contains('skip-animations') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (checkReduced()) {
      gsap.set(el.children, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.children,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.14,
          ease: 'power3.out',
          delay: 0.12,
        },
      );
    }, el);

    const onMotionChange = () => {
      if (checkReduced()) {
        ctx.revert();
        gsap.set(el.children, { opacity: 1, y: 0 });
      }
    };
    window.addEventListener('aether-motion-change', onMotionChange);

    return () => {
      window.removeEventListener('aether-motion-change', onMotionChange);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="awakening"
      ref={sectionRef}
      aria-labelledby="awakening-heading"
      data-parallax-section="awakening"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-16 pb-28 sm:py-0 bg-[#060916]"
    >
      {/* Layer 0: Generated Sky Backdrop */}
      <ParallaxLayer
        speed={0.08}
        mouseFactor={4}
        zIndex={1}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <div className="relative w-full h-full bg-gradient-to-b from-[#070B1E] via-[#261B47] to-[#D9843B]">
          <img
            src="/src/assets/images/bg_awakening_sky_1795336493260.jpg"
            alt="Twilight navy sky breaking into golden dawn above distant mountain valleys"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center transition-all duration-700 ${
              isDigital ? 'opacity-65 hue-rotate-[175deg] saturate-110' : 'opacity-85'
            }`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#060916]/65 via-[#181338]/25 to-[#060916]/90"
          />
        </div>
      </ParallaxLayer>

      {/* Layer 1: Huge Glowing Horizon Sun */}
      <ParallaxLayer
        speed={0.12}
        mouseFactor={7}
        zIndex={2}
        className="absolute inset-x-0 top-[24%] sm:top-[20%] flex justify-center pointer-events-none"
      >
        <div className="relative flex items-center justify-center animate-sun-breathe">
          <div
            className={`w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] rounded-full blur-2xl ${
              isDigital
                ? 'bg-radial from-[#5CE1E6]/40 via-[#3B82F6]/15 to-transparent'
                : 'bg-radial from-[#FFD27D]/35 via-[#E87A3E]/12 to-transparent'
            }`}
          />
          <div
            className={`absolute w-[180px] h-[180px] sm:w-[270px] sm:h-[270px] rounded-full ${
              isDigital
                ? 'bg-radial from-[#E6FBFF] via-[#5CE1E6]/85 to-transparent shadow-[0_0_120px_rgba(92,225,230,0.55)]'
                : 'bg-radial from-[#FFF5D6] via-[#FFC56B]/85 to-[#E58A3C]/0 shadow-[0_0_120px_rgba(255,205,112,0.55)]'
            }`}
          />
        </div>
      </ParallaxLayer>

      {/* Layer 2: Distant Mountain Range + Crystal #1 */}
      <ParallaxLayer
        speed={0.16}
        mouseFactor={9}
        zIndex={3}
        className="absolute inset-x-0 bottom-[16%] sm:bottom-[14%] h-[42vh] pointer-events-none"
      >
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 1440 420"
            preserveAspectRatio="none"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="awk-mtn-far" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDigital ? '#1F3A6E' : '#3B2963'} stopOpacity="0.88" />
                <stop offset="100%" stopColor="#141838" stopOpacity="0.98" />
              </linearGradient>
            </defs>
            <path
              d="M0,290 L110,220 L235,255 L380,145 L510,210 L650,120 L795,195 L930,130 L1085,205 L1220,140 L1345,198 L1440,165 L1440,420 L0,420 Z"
              fill="url(#awk-mtn-far)"
            />
          </svg>

          {/* Collectible Crystal #1: Dawnfire Shard */}
          <CollectibleCrystal
            crystal={dawnCrystal}
            collected={collectedCrystals.includes(dawnCrystal.id)}
            theme={theme}
            onCollect={onCollectCrystal}
            className="pointer-events-auto absolute left-[6%] sm:left-[12%] top-[18%] sm:top-[34%]"
          />
        </div>
      </ParallaxLayer>

      {/* Layer 3: Drifting Volumetric Clouds & Birds */}
      <ParallaxLayer
        speed={0.30}
        mouseFactor={14}
        zIndex={4}
        className="absolute inset-x-0 top-[28%] h-[38vh] pointer-events-none"
      >
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 600 180"
            className="absolute -left-16 top-6 w-[55vw] max-w-[620px] opacity-45 animate-cloud-right"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="awk-cloud-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDigital ? '#7CE8FF' : '#F5BA7A'} stopOpacity="0.55" />
                <stop offset="100%" stopColor="#2B1C4C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M20,140 Q90,70 180,105 Q250,40 350,85 Q440,55 520,115 Q570,125 585,155 L15,155 Z"
              fill="url(#awk-cloud-1)"
            />
          </svg>

          <svg
            viewBox="0 0 600 180"
            className="absolute -right-12 top-14 w-[52vw] max-w-[580px] opacity-40 animate-cloud-left"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="awk-cloud-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDigital ? '#A78BFA' : '#E6B2FF'} stopOpacity="0.38" />
                <stop offset="100%" stopColor="#14193B" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M30,145 Q120,85 215,110 Q310,45 415,92 Q495,70 570,130 L25,155 Z"
              fill="url(#awk-cloud-2)"
            />
          </svg>

          <div className="absolute left-[28%] sm:left-[38%] top-[18%] animate-bird">
            <svg width="150" height="60" viewBox="0 0 150 60" fill="none" aria-hidden="true">
              <path d="M14,26 Q22,18 28,24 Q34,18 42,26" stroke="#16112C" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M58,16 Q64,10 69,15 Q74,10 80,16" stroke="#16112C" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M96,34 Q101,29 105,33 Q109,29 114,34" stroke="#16112C" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M126,20 Q130,16 133,19 Q136,16 140,20" stroke="#16112C" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </ParallaxLayer>

      {/* Layer 4: Midground Mountain Ridges + Hidden Discovery #1 */}
      <ParallaxLayer
        speed={0.42}
        mouseFactor={18}
        zIndex={5}
        className="absolute inset-x-0 bottom-[6%] h-[36vh] pointer-events-none"
      >
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 1440 360"
            preserveAspectRatio="none"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="awk-mtn-mid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDigital ? '#122552' : '#1D1942'} />
                <stop offset="100%" stopColor="#090D21" />
              </linearGradient>
            </defs>
            <path
              d="M0,180 L160,115 L310,195 L490,95 L635,175 L820,120 L990,195 L1175,85 L1330,160 L1440,125 L1440,360 L0,360 Z"
              fill="url(#awk-mtn-mid)"
            />
          </svg>

          {/* Hidden Discovery #1: Chronos Sundial Stone */}
          <button
            type="button"
            onClick={() => onDiscover('sundial-stone')}
            aria-label="Inspect Chronos Sundial hidden discovery"
            className="pointer-events-auto absolute right-[8%] sm:right-[16%] bottom-[52%] sm:bottom-[38%] group min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD27D]"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                sundialFound
                  ? 'bg-[#FFD27D]/30 scale-125'
                  : 'bg-[#E5A94C]/15 group-hover:bg-[#FFD27D]/35 group-hover:scale-125'
              } blur-sm`}
            />
            <svg width="38" height="38" viewBox="0 0 40 40" className="relative z-10">
              <circle
                cx="20"
                cy="20"
                r="14"
                stroke={sundialFound ? '#FFF5D6' : isDigital ? '#5CE1E6' : '#E5A94C'}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                fill="#14112C"
                className={sundialFound ? 'animate-spin-slow' : ''}
              />
              <polygon points="20,9 23,21 20,25 17,21" fill={isDigital ? '#7CE8FF' : '#FFD27D'} />
            </svg>
          </button>
        </div>
      </ParallaxLayer>

      {/* Layer 5: Foreground Rocks & Grass Silhouettes */}
      <ParallaxLayer
        speed={0.82}
        mouseFactor={30}
        zIndex={7}
        className="absolute inset-x-0 -bottom-[8%] h-[28vh] pointer-events-none"
      >
        <div className="relative w-full h-full">
          <svg viewBox="0 0 1440 280" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            <path
              d="M0,145 L85,115 L195,158 L295,130 L420,195 L620,210 L860,205 L1035,148 L1165,120 L1295,155 L1390,95 L1440,120 L1440,280 L0,280 Z"
              fill="#050712"
            />
          </svg>
          <svg
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            className="absolute bottom-[32%] inset-x-0 w-full h-[14vh] animate-grass"
            aria-hidden="true"
          >
            <path
              d="M40,160 Q48,80 65,45 Q55,95 58,160 M72,160 Q85,75 104,35 Q90,95 92,160 M115,160 Q118,95 135,58 Q128,110 132,160 M175,160 Q186,105 202,75 Q194,115 196,160 M1210,160 Q1196,88 1178,52 Q1192,102 1190,160 M1255,160 Q1242,78 1222,38 Q1240,95 1242,160 M1310,160 Q1302,95 1288,62 Q1300,115 1300,160 M1365,160 Q1358,74 1340,32 Q1356,92 1354,160"
              fill="#050712"
            />
          </svg>
        </div>
      </ParallaxLayer>

      {/* Hero Editorial Overlay */}
      <div
        ref={titleGroupRef}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center -mt-6 sm:-mt-16"
      >
        <p
          className={`text-xs sm:text-sm tracking-[0.26em] uppercase mb-4 font-medium ${
            isDigital ? 'text-[#7CE8FF]' : 'text-[#E8C58E]'
          }`}
        >
          Chapter I <span aria-hidden="true" className="mx-2 opacity-60">·</span> The Awakening
        </p>

        <h1
          id="awakening-heading"
          className="font-display text-6xl sm:text-8xl lg:text-[7.5rem] font-semibold tracking-[0.18em] text-[#FFF8EC] leading-[0.95] drop-shadow-[0_6px_32px_rgba(6,9,22,0.75)] headline-balance"
        >
          AETHER
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-[#EAE2D3] font-normal max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_16px_rgba(6,9,22,0.8)]">
          Every Journey Begins Beyond the Horizon.
        </p>

        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton>
            <button
              type="button"
              onClick={onExploreClick}
              className={`group min-h-[44px] px-6 py-2.5 flex flex-col items-center gap-1.5 text-xs tracking-[0.22em] uppercase hover:text-[#FFF8EC] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-md ${
                isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
              }`}
            >
              <span>Begin the Ascent</span>
              <span className="animate-scroll-cue inline-flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`w-[1px] h-5 bg-gradient-to-b from-transparent ${
                    isDigital ? 'to-[#5CE1E6]' : 'to-[#FFD27D]'
                  }`}
                />
                <ChevronDown
                  className={`w-4 h-4 -mt-1 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#FFD27D]'}`}
                />
              </span>
            </button>
          </MagneticButton>
        </div>
      </div>

      {/* Interactive Portal #1: Ascension Rift to The Floating Kingdom */}
      <div className="absolute bottom-[74px] sm:bottom-9 z-20 flex justify-center w-full px-4 sm:px-6">
        <MagneticButton>
          <button
            type="button"
            onClick={() => onPortalTravel('awakening', 'kingdom', 'ASCENDING TO THE FLOATING KINGDOM')}
            className={`min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2.5 rounded-full bg-[#111536]/92 border text-[11px] sm:text-xs tracking-[0.15em] uppercase hover:text-white transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
              isDigital
                ? 'border-[#5CE1E6]/55 hover:border-[#9AF4FF] text-[#C7F9FF] focus-visible:ring-[#5CE1E6] shadow-[0_0_24px_rgba(92,225,230,0.24)]'
                : 'border-[#E5A94C]/55 hover:border-[#FFD27D] text-[#FFE7B8] focus-visible:ring-[#FFD27D] shadow-[0_0_24px_rgba(229,169,76,0.22)]'
            }`}
          >
            <Compass className={`w-4 h-4 shrink-0 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#FFD27D]'}`} />
            <span>Ascension Portal · Enter Sky Realm</span>
          </button>
        </MagneticButton>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-28 z-10 bg-gradient-to-t from-[#080D24] to-transparent pointer-events-none"
      />
    </section>
  );
}
