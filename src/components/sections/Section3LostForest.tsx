import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass } from 'lucide-react';
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

interface ForestRelic {
  id: string;
  name: string;
  whisper: string;
  xClass: string;
  yClass: string;
  freq: number;
}

const RELICS: ForestRelic[] = [
  {
    id: 'lantern',
    name: 'Whispering Lantern',
    whisper: 'A suspended amber vessel guiding wanderers beneath the canopy.',
    xClass: 'left-[24%] sm:left-[20%]',
    yClass: 'top-[32%] sm:top-[36%]',
    freq: 587.33,
  },
  {
    id: 'monolith',
    name: 'Sunmoss Monolith',
    whisper: 'Carved stone etched with starlight maps from before the Awakening.',
    xClass: 'left-[50%]',
    yClass: 'top-[37%] sm:top-[42%]',
    freq: 493.88,
  },
  {
    id: 'blossom',
    name: 'Aether Blossom',
    whisper: 'Luminous flora that opens only where sunbeams pierce the mist.',
    xClass: 'right-[20%] sm:right-[20%]',
    yClass: 'top-[31%] sm:top-[36%]',
    freq: 698.46,
  },
];

const FIREFLIES = [
  { left: '12%', top: '34%', delay: '0s', size: 6 },
  { left: '22%', top: '58%', delay: '1.2s', size: 5 },
  { left: '34%', top: '42%', delay: '2.4s', size: 7 },
  { left: '46%', top: '65%', delay: '0.8s', size: 5 },
  { left: '58%', top: '38%', delay: '3.1s', size: 6 },
  { left: '68%', top: '55%', delay: '1.7s', size: 7 },
  { left: '78%', top: '44%', delay: '2.9s', size: 5 },
  { left: '86%', top: '62%', delay: '0.4s', size: 6 },
  { left: '28%', top: '72%', delay: '2.1s', size: 4 },
  { left: '64%', top: '74%', delay: '1.5s', size: 5 },
];

interface Section3LostForestProps {
  theme: WorldTheme;
  discoveredIds: string[];
  collectedCrystals: string[];
  onRelicInteract: (freq: number) => void;
  onDiscover: (id: string) => void;
  onCollectCrystal: (crystal: CrystalItem) => void;
  onPortalTravel: (from: ChapterId, to: ChapterId, label: string) => void;
}

export function Section3LostForest({
  theme,
  discoveredIds,
  collectedCrystals,
  onRelicInteract,
  onDiscover,
  onCollectCrystal,
  onPortalTravel,
}: Section3LostForestProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const [activeRelic, setActiveRelic] = useState<ForestRelic | null>(null);
  const owlFound = discoveredIds.includes('owl-totem');
  const forestCrystal = AETHER_CRYSTALS[2];
  const isDigital = theme === 'digital';

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
        { opacity: 0, y: 28 },
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

  const handleHoverRelic = (relic: ForestRelic) => {
    if (activeRelic?.id !== relic.id) {
      onRelicInteract(relic.freq);
    }
    setActiveRelic(relic);
  };

  return (
    <section
      id="forest"
      aria-labelledby="forest-heading"
      data-parallax-section="forest"
      className={`relative min-h-[115vh] w-full overflow-hidden flex flex-col justify-between pt-20 pb-24 sm:py-24 ${
        isDigital
          ? 'bg-gradient-to-b from-[#040E1D] via-[#092138] to-[#06091E]'
          : 'bg-gradient-to-b from-[#061119] via-[#0B1D26] to-[#080B1E]'
      }`}
    >
      {/* Layer 0: Atmospheric Canopy Sky & Volumetric Sunlight Shafts */}
      <ParallaxLayer
        speed={0.12}
        mouseFactor={5}
        zIndex={1}
        className="absolute inset-0 -top-[10%] -bottom-[10%] pointer-events-none"
      >
        <div className="relative w-full h-full">
          <div
            className={`absolute -top-24 left-[18%] w-[520px] h-[520px] rounded-full blur-3xl ${
              isDigital
                ? 'bg-radial from-[#5CE1E6]/22 via-[#3B82F6]/10 to-transparent'
                : 'bg-radial from-[#FFD27D]/20 via-[#577C6E]/10 to-transparent'
            }`}
          />
          <div
            className={`absolute -top-[10%] left-[12%] w-[18%] h-[130%] bg-gradient-to-b rotate-[22deg] blur-xl ${
              isDigital
                ? 'from-[#7CE8FF]/18 via-[#38BDF8]/8 to-transparent'
                : 'from-[#FFE6A8]/18 via-[#E5A94C]/8 to-transparent'
            }`}
          />
          <div
            className={`absolute -top-[10%] left-[36%] w-[14%] h-[130%] bg-gradient-to-b rotate-[22deg] blur-xl ${
              isDigital
                ? 'from-[#7CE8FF]/14 via-[#8B5CF6]/8 to-transparent'
                : 'from-[#FFE6A8]/14 via-[#8AB2A0]/6 to-transparent'
            }`}
          />
          <div className="absolute -top-[10%] left-[60%] w-[10%] h-[120%] bg-gradient-to-b from-[#FFE6A8]/10 via-transparent to-transparent rotate-[22deg] blur-xl" />
        </div>
      </ParallaxLayer>

      {/* Layer 1: Distant Forest Silhouettes */}
      <ParallaxLayer
        speed={0.15}
        mouseFactor={7}
        zIndex={2}
        className="absolute inset-x-0 bottom-[16%] h-[55vh] pointer-events-none"
      >
        <svg viewBox="0 0 1440 500" preserveAspectRatio="none" className="w-full h-full opacity-55" aria-hidden="true">
          <path
            d="M0,500 L0,230 L35,140 L70,230 L105,110 L145,235 L190,155 L230,240 L275,95 L320,225 L370,150 L415,245 L465,120 L510,235 L560,165 L610,240 L665,105 L715,230 L770,145 L825,245 L880,115 L930,240 L985,160 L1035,235 L1090,100 L1145,245 L1200,155 L1255,235 L1315,120 L1370,240 L1410,165 L1440,220 L1440,500 Z"
            fill={isDigital ? '#0D2642' : '#142C36'}
          />
        </svg>
      </ParallaxLayer>

      {/* Layer 2: Mid-Distant Pine & Birch Trunks + Hidden Discovery #3 */}
      <ParallaxLayer
        speed={0.28}
        mouseFactor={12}
        zIndex={3}
        className="absolute inset-x-0 bottom-[10%] h-[65vh] pointer-events-none"
      >
        <div className="relative w-full h-full">
          <svg viewBox="0 0 1440 600" preserveAspectRatio="none" className="w-full h-full opacity-80" aria-hidden="true">
            <g fill={isDigital ? '#081B30' : '#0E212B'}>
              <rect x="85" y="40" width="20" height="560" />
              <rect x="240" y="0" width="26" height="600" />
              <rect x="430" y="60" width="18" height="540" />
              <rect x="615" y="20" width="24" height="580" />
              <rect x="820" y="55" width="22" height="545" />
              <rect x="1010" y="10" width="28" height="590" />
              <rect x="1215" y="45" width="20" height="555" />
              <rect x="1355" y="25" width="24" height="575" />
            </g>
            <ellipse cx="720" cy="510" rx="760" ry="75" fill={isDigital ? '#38BDF8' : '#70A39A'} opacity="0.14" className="animate-mist" />
          </svg>

          {/* Hidden Discovery #3: Starlight Owl Totem */}
          <button
            type="button"
            onClick={() => onDiscover('owl-totem')}
            aria-label="Inspect Starlight Owl Totem hidden discovery"
            className="pointer-events-auto absolute right-[16%] sm:right-[15%] top-[14%] sm:top-[22%] group min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD27D]"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full blur-sm transition-all duration-300 ${
                owlFound
                  ? 'bg-[#E8F28D]/45 scale-125'
                  : 'bg-[#99C2AE]/20 group-hover:bg-[#E8F28D]/40 group-hover:scale-125'
              }`}
            />
            <svg width="32" height="36" viewBox="0 0 32 36" className="relative z-10">
              <ellipse cx="16" cy="20" rx="9" ry="12" fill="#172A33" stroke="#A6D4BE" strokeWidth="1.2" />
              <circle cx="12.5" cy="15" r="2.2" fill={owlFound ? '#FFF5B8' : '#E8F28D'} />
              <circle cx="19.5" cy="15" r="2.2" fill={owlFound ? '#FFF5B8' : '#E8F28D'} />
              <polygon points="16,17 14,20 18,20" fill="#E5A94C" />
            </svg>
          </button>
        </div>
      </ParallaxLayer>

      {/* Layer 3: Midground Ancient Trees, Fireflies, Relics & Crystal #3 */}
      <ParallaxLayer
        speed={0.45}
        mouseFactor={18}
        zIndex={8}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full">
          {FIREFLIES.map((ff, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="absolute rounded-full animate-firefly"
              style={{
                left: ff.left,
                top: ff.top,
                width: `${ff.size}px`,
                height: `${ff.size}px`,
                backgroundColor: isDigital ? '#7CE8FF' : '#E8F28D',
                boxShadow: isDigital
                  ? '0 0 14px rgba(124,232,255,0.9)'
                  : '0 0 14px rgba(232,242,141,0.9)',
                animationDelay: ff.delay,
              }}
            />
          ))}

          {/* Collectible Crystal #3: Sylvan Dewstone */}
          <CollectibleCrystal
            crystal={forestCrystal}
            collected={collectedCrystals.includes(forestCrystal.id)}
            theme={theme}
            onCollect={onCollectCrystal}
            className="pointer-events-auto absolute left-[16%] sm:left-[14%] top-[20%] sm:top-[26%]"
          />

          {RELICS.map((relic) => {
            const isHovered = activeRelic?.id === relic.id;
            return (
              <button
                key={relic.id}
                type="button"
                onMouseEnter={() => handleHoverRelic(relic)}
                onFocus={() => handleHoverRelic(relic)}
                onClick={() => handleHoverRelic(relic)}
                aria-label={`${relic.name}: ${relic.whisper}`}
                className={`pointer-events-auto absolute ${relic.xClass} ${relic.yClass} -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-full p-3 transition-transform duration-300 ${
                  isHovered ? 'scale-115' : 'hover:scale-110'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-full transition-opacity duration-300 blur-md ${
                    isHovered
                      ? 'bg-[#FFD27D]/55 opacity-100'
                      : 'bg-[#E5A94C]/25 opacity-60 group-hover:opacity-95'
                  }`}
                />
                <svg
                  width="44"
                  height="52"
                  viewBox="0 0 44 52"
                  className="relative z-10 drop-shadow-[0_0_12px_rgba(255,210,125,0.6)]"
                >
                  {relic.id === 'lantern' && (
                    <>
                      <path d="M22,2 L22,12" stroke="#D9A86C" strokeWidth="2" />
                      <polygon points="12,14 32,14 29,38 15,38" fill="#17242D" stroke={isDigital ? '#5CE1E6' : '#E5A94C'} strokeWidth="1.6" />
                      <circle cx="22" cy="26" r="5" fill={isDigital ? '#7CE8FF' : '#FFE6A8'} />
                    </>
                  )}
                  {relic.id === 'monolith' && (
                    <>
                      <polygon points="22,4 34,16 32,46 12,46 10,16" fill="#182730" stroke="#99C2AE" strokeWidth="1.5" />
                      <path d="M22,15 L22,36 M16,24 L28,24" stroke={isDigital ? '#5CE1E6' : '#FFD27D'} strokeWidth="2" strokeLinecap="round" />
                    </>
                  )}
                  {relic.id === 'blossom' && (
                    <>
                      <path d="M22,48 Q22,34 22,28" stroke="#76A58B" strokeWidth="2" />
                      <path d="M22,28 Q10,18 14,10 Q22,16 22,28 Z" fill={isDigital ? '#5CE1E6' : '#F6C873'} />
                      <path d="M22,28 Q34,18 30,10 Q22,16 22,28 Z" fill={isDigital ? '#5CE1E6' : '#F6C873'} />
                      <circle cx="22" cy="20" r="4" fill="#FFF7DC" />
                    </>
                  )}
                </svg>
              </button>
            );
          })}
        </div>
      </ParallaxLayer>

      {/* Layer 4: Tall Framing Foreground Trees & Ferns */}
      <ParallaxLayer
        speed={0.84}
        mouseFactor={32}
        zIndex={7}
        className="absolute inset-0 -top-[12%] -bottom-[12%] pointer-events-none"
      >
        <div className="relative w-full h-full flex justify-between">
          <svg viewBox="0 0 280 900" preserveAspectRatio="none" className="h-full w-[54px] sm:w-[190px] opacity-95" aria-hidden="true">
            <path d="M0,0 L120,0 Q95,220 135,480 Q155,680 185,900 L0,900 Z" fill="#04080E" />
            <path d="M110,180 Q190,145 260,175 Q195,195 115,235 Z" fill="#04080E" />
            <path d="M128,420 Q200,395 250,425 Q190,445 135,465 Z" fill="#04080E" />
          </svg>
          <svg viewBox="0 0 280 900" preserveAspectRatio="none" className="h-full w-[54px] sm:w-[190px] opacity-95" aria-hidden="true">
            <path d="M280,0 L165,0 Q190,260 145,510 Q125,700 90,900 L280,900 Z" fill="#04080E" />
            <path d="M168,230 Q95,195 30,225 Q95,245 162,275 Z" fill="#04080E" />
          </svg>
        </div>
      </ParallaxLayer>

      {/* Section Typography & Starlight Portal */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-6 sm:space-y-8 mt-auto pt-60 sm:pt-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <div ref={headingRef} className="max-w-lg">
            <p className={`text-xs tracking-[0.24em] uppercase mb-3 font-medium ${isDigital ? 'text-[#7CE8FF]' : 'text-[#B9D7C8]'}`}>
              Chapter III <span aria-hidden="true" className="mx-2 opacity-60">·</span> The Lost Forest
            </p>
            <h2
              id="forest-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-wide text-[#F6F4EA] leading-[1.06] headline-balance"
            >
              WHERE ANCIENT ROOTS REMEMBER THE SKY
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#C4D3CE] leading-relaxed">
              Sunbeams slice through twilight mist while foreground elders glide past distant pines.
              Hover or tap any glowing forest relic to awaken its quiet memory.
            </p>
          </div>

          <div className="w-full md:w-[340px] bg-[#07131B]/92 border border-white/15 rounded-xl p-5 min-h-[120px] flex flex-col justify-center">
            {activeRelic ? (
              <>
                <span
                  className={`text-xs tracking-wider uppercase font-medium ${
                    isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
                  }`}
                >
                  {activeRelic.name}
                </span>
                <p className="mt-2 text-sm text-[#DFE8E3] leading-relaxed">
                  {activeRelic.whisper}
                </p>
              </>
            ) : (
              <>
                <span className="text-xs tracking-wider uppercase text-[#9AB8AD] font-medium">
                  Forest Resonance
                </span>
                <p className="mt-2 text-sm text-[#BACAC4] leading-relaxed">
                  Tap or hover over the glowing lantern, monolith, or blossom nestled above the mist.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <MagneticButton>
            <button
              type="button"
              onClick={() => onPortalTravel('forest', 'gate', 'CROSSING INTO THE CELESTIAL GATE')}
              className={`min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2.5 rounded-full bg-[#130E2C]/90 border text-[11px] sm:text-xs tracking-[0.15em] uppercase hover:text-white transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                isDigital
                  ? 'border-[#5CE1E6]/45 hover:border-[#9AF4FF] text-[#C7F9FF] focus-visible:ring-[#5CE1E6] shadow-[0_0_24px_rgba(92,225,230,0.22)]'
                  : 'border-[#B494FF]/45 hover:border-[#FFD27D] text-[#EDE4FF] focus-visible:ring-[#FFD27D] shadow-[0_0_24px_rgba(165,130,255,0.22)]'
              }`}
            >
              <Compass className={`w-4 h-4 shrink-0 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#FFD27D]'}`} />
              <span>Starlight Portal · Enter Celestial Gate</span>
            </button>
          </MagneticButton>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-28 z-10 bg-gradient-to-t from-[#050614] to-transparent pointer-events-none"
      />
    </section>
  );
}
