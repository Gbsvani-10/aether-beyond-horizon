import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Compass } from 'lucide-react';
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

const Interactive3DArtifact = lazy(() => import('../Interactive3DArtifact'));

interface IslandLore {
  id: string;
  name: string;
  elevation: string;
  description: string;
}

const ISLANDS: IslandLore[] = [
  {
    id: 'sanctum',
    name: 'Sanctum of Winds',
    elevation: '4,200 m',
    description:
      'An observatory spire anchored by ancient sky-stone, catching the first golden thermals above the cloud sea.',
  },
  {
    id: 'citadel',
    name: 'The Sunstone Citadel',
    elevation: '5,140 m',
    description:
      'Twin cascade falls spill endlessly into mist, fed by condensed cloud-streams suspended in high twilight.',
  },
  {
    id: 'arch',
    name: 'Bridge of Echoes',
    elevation: '4,680 m',
    description:
      'A slender stone span uniting drifting monoliths where travelers hear faint chimes carried on the upper gale.',
  },
];

interface Section2FloatingKingdomProps {
  theme: WorldTheme;
  discoveredIds: string[];
  collectedCrystals: string[];
  onIslandInteract: (freq: number) => void;
  onDiscover: (id: string) => void;
  onCollectCrystal: (crystal: CrystalItem) => void;
  onPortalTravel: (from: ChapterId, to: ChapterId, label: string) => void;
}

export function Section2FloatingKingdom({
  theme,
  discoveredIds,
  collectedCrystals,
  onIslandInteract,
  onDiscover,
  onCollectCrystal,
  onPortalTravel,
}: Section2FloatingKingdomProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const threeSlotRef = useRef<HTMLDivElement>(null);
  const [selectedIsland, setSelectedIsland] = useState<IslandLore>(ISLANDS[1]);
  const [shouldLoad3D, setShouldLoad3D] = useState(false);

  const bellFound = discoveredIds.includes('skyward-bell');
  const skyCrystal = AETHER_CRYSTALS[1];
  const isDigital = theme === 'digital';

  useEffect(() => {
    const target = threeSlotRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad3D(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = headingRef.current;
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
        { opacity: 0, y: 32 },
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

  const handleSelectIsland = (island: IslandLore, freq: number) => {
    setSelectedIsland(island);
    onIslandInteract(freq);
  };

  return (
    <section
      id="kingdom"
      ref={sectionRef}
      aria-labelledby="kingdom-heading"
      data-parallax-section="kingdom"
      className="relative min-h-[115vh] w-full overflow-hidden flex flex-col justify-between pt-20 pb-24 sm:py-24 bg-[#080D24]"
    >
      {/* Layer 0: Lazy-loaded Floating Kingdom Cloud Sea Backdrop */}
      <ParallaxLayer
        speed={0.10}
        mouseFactor={5}
        zIndex={1}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <div className="relative w-full h-full bg-gradient-to-b from-[#080D24] via-[#271C52] to-[#0C1430]">
          <img
            src="/src/assets/images/bg_floating_kingdom_1795336493985.jpg"
            alt="Vast floating sky realm illuminated by warm golden sunbeams over a cloud sea"
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center transition-all duration-700 ${
              isDigital ? 'opacity-60 hue-rotate-[170deg] saturate-110' : 'opacity-75'
            }`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#080D24]/85 via-[#1B1540]/35 to-[#06101B]/95"
          />
        </div>
      </ParallaxLayer>

      {/* Layer 1: Distant Floating Spires & Cloud Horizon */}
      <ParallaxLayer
        speed={0.16}
        mouseFactor={8}
        zIndex={2}
        className="absolute inset-x-0 top-[14%] h-[40vh] pointer-events-none"
      >
        <svg viewBox="0 0 1440 380" className="w-full h-full opacity-55" aria-hidden="true">
          <path d="M160,180 L235,145 L260,185 L220,245 L185,220 Z" fill={isDigital ? '#1B3A6B' : '#2B2158'} />
          <path d="M1140,120 L1215,90 L1250,130 L1200,210 L1165,170 Z" fill={isDigital ? '#22457A' : '#2E235C'} />
          <ellipse cx="720" cy="310" rx="680" ry="60" fill="#1C1946" opacity="0.5" />
        </svg>
      </ParallaxLayer>

      {/* Layer 2: Left Interactive Floating Island + Hidden Discovery #2 */}
      <ParallaxLayer
        speed={0.38}
        mouseFactor={15}
        zIndex={6}
        className="absolute left-[2%] sm:left-[7%] top-[78px] sm:top-[18%] w-[142px] sm:w-[270px]"
      >
        <div className="relative animate-float-slow">
          <button
            type="button"
            onClick={() => handleSelectIsland(ISLANDS[0], 523.25)}
            aria-pressed={selectedIsland.id === 'sanctum'}
            className={`group w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-xl transition-transform duration-300 ${
              selectedIsland.id === 'sanctum' ? 'scale-105' : 'hover:scale-[1.03]'
            }`}
          >
            <svg viewBox="0 0 320 260" className="w-full h-auto drop-shadow-[0_24px_35px_rgba(4,7,20,0.75)]">
              <defs>
                <linearGradient id="isl-left-rock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDigital ? '#22457A' : '#352B63'} />
                  <stop offset="100%" stopColor="#12142D" />
                </linearGradient>
              </defs>
              <rect x="136" y="42" width="38" height="72" rx="3" fill="#2A2250" />
              <polygon points="130,44 155,14 180,44" fill={isDigital ? '#5CE1E6' : '#E5A94C'} opacity="0.85" />
              <circle cx="155" cy="68" r="8" fill={isDigital ? '#7CE8FF' : '#FFD27D'} opacity={selectedIsland.id === 'sanctum' ? 1 : 0.65} />
              <path
                d="M35,112 Q160,92 285,115 L252,155 L205,220 L162,248 L120,210 L75,165 Z"
                fill="url(#isl-left-rock)"
              />
              <path d="M35,112 Q160,94 285,115 Q215,124 160,122 Q95,124 35,112 Z" fill={isDigital ? '#2F5FA3' : '#493B7D'} />
            </svg>
            <span
              className={`mt-1 block text-center text-[11px] sm:text-xs tracking-wider group-hover:text-[#FFF8EC] transition-colors ${
                isDigital ? 'text-[#9AF4FF]' : 'text-[#E8C58E]'
              }`}
            >
              Sanctum of Winds
            </span>
          </button>

          {/* Hidden Discovery #2: Skyward Bell of Aether */}
          <button
            type="button"
            onClick={() => onDiscover('skyward-bell')}
            aria-label="Ring Skyward Bell hidden discovery"
            className="absolute left-[10%] bottom-[14%] group min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD27D]"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full blur-sm transition-all duration-300 ${
                bellFound
                  ? 'bg-[#FFD27D]/45 scale-125'
                  : 'bg-[#C9B3F5]/20 group-hover:bg-[#FFD27D]/35 group-hover:scale-125'
              }`}
            />
            <svg width="26" height="30" viewBox="0 0 28 32" className="relative z-10">
              <path
                d="M14,3 L14,8 M8,19 Q8,10 14,10 Q20,10 20,19 L23,23 L5,23 Z"
                fill={bellFound ? '#FFD27D' : '#8D7EC2'}
                stroke="#FFF5D6"
                strokeWidth="1.2"
              />
              <circle cx="14" cy="26" r="2.2" fill="#FFD27D" />
            </svg>
          </button>
        </div>
      </ParallaxLayer>

      {/* Layer 3: Central Citadel Floating Island */}
      <ParallaxLayer
        speed={0.46}
        mouseFactor={20}
        zIndex={5}
        className="relative mx-auto mt-36 sm:mt-8 w-[88vw] max-w-[540px]"
      >
        <div className="animate-float-medium">
          <button
            type="button"
            onClick={() => handleSelectIsland(ISLANDS[1], 659.25)}
            aria-pressed={selectedIsland.id === 'citadel'}
            className={`group w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-2xl transition-transform duration-300 ${
              selectedIsland.id === 'citadel' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
          >
            <svg viewBox="0 0 720 420" className="w-full h-auto drop-shadow-[0_32px_50px_rgba(4,7,20,0.85)]">
              <defs>
                <linearGradient id="citadel-stone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDigital ? '#244A85' : '#3B2E6B'} />
                  <stop offset="60%" stopColor="#1B193C" />
                  <stop offset="100%" stopColor="#0C0E22" />
                </linearGradient>
                <linearGradient id="waterfall-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDigital ? '#B8F6FF' : '#FFE9BD'} stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#93B7FF" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#93B7FF" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d="M95,182 Q155,212 225,176" stroke={isDigital ? '#5CE1E6' : '#D9A86C'} strokeWidth="3" fill="none" opacity="0.8" />
              <path d="M95,190 Q155,220 225,184" stroke="#9C734B" strokeWidth="2" fill="none" opacity="0.65" />
              <path d="M22,175 Q65,160 112,178 L95,235 L62,272 L36,225 Z" fill="#231D47" />

              <rect x="305" y="72" width="110" height="88" rx="4" fill="#261F4C" />
              <path d="M285,74 L360,26 L435,74 Z" fill={isDigital ? '#2B5B9E' : '#3B2E6B'} />
              <path
                d="M338,160 L338,112 Q360,92 382,112 L382,160 Z"
                fill={isDigital ? '#5CE1E6' : '#FFD27D'}
                opacity={selectedIsland.id === 'citadel' ? 0.95 : 0.7}
              />
              <rect x="248" y="102" width="18" height="58" fill="#2D2457" />
              <rect x="454" y="102" width="18" height="58" fill="#2D2457" />
              <circle cx="257" cy="96" r="5" fill={isDigital ? '#5CE1E6' : '#E5A94C'} />
              <circle cx="463" cy="96" r="5" fill={isDigital ? '#5CE1E6' : '#E5A94C'} />

              <path
                d="M175,162 Q360,140 545,162 L515,215 L445,270 L378,365 L322,330 L265,280 L210,222 Z"
                fill="url(#citadel-stone)"
              />
              <path d="M175,162 Q360,142 545,162 Q450,178 360,175 Q270,178 175,162 Z" fill={isDigital ? '#38BDF8' : '#54448E'} fillOpacity={isDigital ? '0.45' : '1'} />

              <g className="overflow-hidden">
                <rect x="398" y="168" width="24" height="210" rx="10" fill="url(#waterfall-grad)" className="animate-waterfall" />
                <rect x="404" y="168" width="8" height="195" rx="4" fill="#FFF7E2" opacity="0.65" className="animate-waterfall" />
              </g>
              <ellipse cx="410" cy="366" rx="48" ry="16" fill="#CBD8FF" opacity="0.35" className="animate-mist" />
            </svg>
          </button>
        </div>
      </ParallaxLayer>

      {/* Layer 4: Right Interactive Island — Bridge of Echoes + Crystal #2 */}
      <ParallaxLayer
        speed={0.52}
        mouseFactor={22}
        zIndex={6}
        className="absolute right-[2%] sm:right-[5%] top-[82px] sm:top-[22%] w-[138px] sm:w-[230px]"
      >
        <div className="relative animate-float-slow">
          <button
            type="button"
            onClick={() => handleSelectIsland(ISLANDS[2], 783.99)}
            aria-pressed={selectedIsland.id === 'arch'}
            className={`group w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-xl transition-transform duration-300 ${
              selectedIsland.id === 'arch' ? 'scale-105' : 'hover:scale-[1.03]'
            }`}
          >
            <svg viewBox="0 0 260 220" className="w-full h-auto drop-shadow-[0_24px_35px_rgba(4,7,20,0.8)]">
              <path d="M78,108 L78,56 Q128,18 178,56 L178,108" stroke={isDigital ? '#38BDF8' : '#48397A'} strokeWidth="12" fill="none" />
              <circle cx="128" cy="64" r="7" fill={isDigital ? '#7CE8FF' : '#FFD27D'} opacity={selectedIsland.id === 'arch' ? 1 : 0.6} />
              <path d="M30,108 Q130,90 230,110 L195,165 L140,204 L95,172 Z" fill="#1E1940" />
              <path d="M30,108 Q130,92 230,110 Q180,118 130,116 Q75,118 30,108 Z" fill={isDigital ? '#2C5C9E' : '#463778'} />
            </svg>
            <span
              className={`mt-1 block text-center text-[11px] sm:text-xs tracking-wider group-hover:text-[#FFF8EC] transition-colors ${
                isDigital ? 'text-[#9AF4FF]' : 'text-[#E8C58E]'
              }`}
            >
              Bridge of Echoes
            </span>
          </button>

          {/* Collectible Crystal #2: Zephyr Prism */}
          <CollectibleCrystal
            crystal={skyCrystal}
            collected={collectedCrystals.includes(skyCrystal.id)}
            theme={theme}
            onCollect={onCollectCrystal}
            className="absolute -left-2 sm:-left-4 top-[28%]"
          />
        </div>
      </ParallaxLayer>

      {/* Layer 5: Foreground Drifting Rock Shards */}
      <ParallaxLayer
        speed={0.80}
        mouseFactor={30}
        zIndex={6}
        className="absolute -left-8 bottom-[14%] w-[160px] sm:w-[270px] pointer-events-none"
      >
        <svg viewBox="0 0 240 180" className="w-full h-auto opacity-90" aria-hidden="true">
          <path d="M10,55 L95,30 L175,65 L145,125 L68,162 L24,112 Z" fill="#070A18" />
        </svg>
      </ParallaxLayer>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-6 sm:space-y-8 mt-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div ref={headingRef} className="max-w-xl">
            <p className={`text-xs tracking-[0.24em] uppercase mb-2.5 font-medium ${isDigital ? 'text-[#7CE8FF]' : 'text-[#E8C58E]'}`}>
              Chapter II <span aria-hidden="true" className="mx-2 opacity-60">·</span> The Floating Kingdom
            </p>
            <h2
              id="kingdom-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-wide text-[#FFF7E8] leading-[1.06] headline-balance"
            >
              A WORLD WITHOUT LIMITS
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D7D2E5] leading-relaxed max-w-lg">
              Suspended above an ocean of clouds, ancient sanctuaries drift in serene equilibrium.
              Select any island or rotate the 3D artifacts below.
            </p>
          </div>

          <div className="w-full lg:w-[400px] bg-[#0B1028]/92 border border-white/15 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 mb-3">
              <div
                className={`flex items-center gap-2 text-xs tracking-wider uppercase font-medium ${
                  isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'}`} />
                <span>Active Sanctuary</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#B4AED0]">
                Alt. {selectedIsland.elevation}
              </span>
            </div>

            <h3 className="font-display text-2xl font-semibold text-[#FFF7E8]">
              {selectedIsland.name}
            </h3>
            <p className="mt-1.5 text-sm text-[#CEC9DE] leading-relaxed">
              {selectedIsland.description}
            </p>

            <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap gap-2">
              {ISLANDS.map((isl, idx) => {
                const active = selectedIsland.id === isl.id;
                const freqs = [523.25, 659.25, 783.99];
                return (
                  <button
                    key={isl.id}
                    type="button"
                    onClick={() => handleSelectIsland(isl, freqs[idx])}
                    className={`min-h-[42px] px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                      active
                        ? isDigital
                          ? 'bg-[#5CE1E6]/20 border-[#5CE1E6] text-[#9AF4FF]'
                          : 'bg-[#E5A94C]/20 border-[#E5A94C] text-[#FFD27D]'
                        : 'bg-white/5 border-white/10 text-[#C6C0D8] hover:text-white hover:border-white/25'
                    }`}
                  >
                    {isl.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lazy-Loaded Interactive 3D Objects Inspector */}
        <div ref={threeSlotRef} className="w-full">
          {shouldLoad3D ? (
            <Suspense
              fallback={
                <div className="h-[280px] rounded-xl bg-[#090E23]/90 border border-white/15 flex items-center justify-center text-xs text-[#C6C0D8]">
                  Loading 3D Artifact Inspector...
                </div>
              }
            >
              <Interactive3DArtifact theme={theme} onInteractChime={onIslandInteract} />
            </Suspense>
          ) : (
            <div className="h-[280px] rounded-xl bg-[#090E23]/80 border border-white/10 flex items-center justify-center text-xs text-[#A6A0BA]">
              Scroll closer to awaken 3D Artifact Inspector
            </div>
          )}
        </div>

        {/* Interactive Portal #2: Canopy Rift to The Lost Forest */}
        <div className="flex justify-center">
          <MagneticButton>
            <button
              type="button"
              onClick={() => onPortalTravel('kingdom', 'forest', 'DESCENDING INTO THE LOST FOREST')}
              className={`min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2.5 rounded-full bg-[#091822]/90 border text-[11px] sm:text-xs tracking-[0.15em] uppercase hover:text-white transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                isDigital
                  ? 'border-[#5CE1E6]/45 hover:border-[#9AF4FF] text-[#C7F9FF] focus-visible:ring-[#5CE1E6] shadow-[0_0_24px_rgba(92,225,230,0.2)]'
                  : 'border-[#8EB8A6]/45 hover:border-[#FFD27D] text-[#DCEEE5] focus-visible:ring-[#FFD27D] shadow-[0_0_24px_rgba(112,176,154,0.2)]'
              }`}
            >
              <Compass className={`w-4 h-4 shrink-0 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#FFD27D]'}`} />
              <span>Canopy Portal · Enter Lost Forest</span>
            </button>
          </MagneticButton>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 z-10 bg-gradient-to-t from-[#061119] to-transparent pointer-events-none"
      />
    </section>
  );
}
