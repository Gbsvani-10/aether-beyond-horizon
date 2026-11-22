import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Gem, Sparkles, X } from 'lucide-react';
import { AtmosphericCanvas } from './components/AtmosphericCanvas';
import { CinematicCursor } from './components/CinematicCursor';
import { CinematicEndingModal } from './components/CinematicEndingModal';
import { DynamicSkyAtmosphere, getTimePhaseFromProgress } from './components/DynamicSkyAtmosphere';
import { ExplorerCompanion } from './components/ExplorerCompanion';
import { LivingStorybook } from './components/LivingStorybook';
import { LoadingScreen } from './components/LoadingScreen';
import { BASE_CHAPTERS, NavigationHUD, SANCTUARY_CHAPTER } from './components/NavigationHUD';
import { PortalTransitionOverlay } from './components/PortalTransitionOverlay';
import { Section1Awakening } from './components/sections/Section1Awakening';
import { Section2FloatingKingdom } from './components/sections/Section2FloatingKingdom';
import { Section3LostForest } from './components/sections/Section3LostForest';
import { Section4CelestialGate } from './components/sections/Section4CelestialGate';
import { Section5FinalHorizon } from './components/sections/Section5FinalHorizon';
import { Section6SecretSanctuary } from './components/sections/Section6SecretSanctuary';
import {
  AETHER_CRYSTALS,
  HIDDEN_DISCOVERIES,
  type ChapterId,
  type CrystalItem,
  type WorldTheme,
} from './types/aether';
import { soundEngine } from './utils/soundEngine';

gsap.registerPlugin(ScrollTrigger);

interface RewardToast {
  kind: 'discovery' | 'crystal';
  title: string;
  subtitle: string;
  body: string;
}

export default function App() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('awakening');
  const [visitedChapters, setVisitedChapters] = useState<ChapterId[]>(['awakening']);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [chapterProgress, setChapterProgress] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [theme, setTheme] = useState<WorldTheme>('fantasy');
  const [autoExplore, setAutoExplore] = useState<boolean>(false);
  const [skipAnimations, setSkipAnimations] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const [storybookOpen, setStorybookOpen] = useState<boolean>(false);
  const [portalHistory, setPortalHistory] = useState<ChapterId[]>([]);
  const [portalOverlay, setPortalOverlay] = useState<{ active: boolean; label: string }>({
    active: false,
    label: '',
  });
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [collectedCrystals, setCollectedCrystals] = useState<string[]>([]);
  const [rewardToast, setRewardToast] = useState<RewardToast | null>(null);
  const [endingModalOpen, setEndingModalOpen] = useState<boolean>(false);

  const scrollProgressRef = useRef<number>(0);
  const toastTimerRef = useRef<number>(0);
  const programmaticTimerRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const autoExploreRef = useRef<boolean>(autoExplore);
  const skipAnimationsRef = useRef<boolean>(skipAnimations);
  const endingTriggeredRef = useRef<boolean>(false);

  autoExploreRef.current = autoExplore;
  skipAnimationsRef.current = skipAnimations;

  const sanctuaryUnlocked = collectedCrystals.length >= AETHER_CRYSTALS.length;
  const allCompleted =
    sanctuaryUnlocked && discoveredIds.length >= HIDDEN_DISCOVERIES.length;

  // Sync skip-animations class on <html> and notify ParallaxLayer instances
  useEffect(() => {
    document.documentElement.classList.toggle('skip-animations', skipAnimations);
    window.dispatchEvent(new Event('aether-motion-change'));
    ScrollTrigger.refresh();
  }, [skipAnimations]);

  // Track visited chapters for the Living Storybook
  useEffect(() => {
    setVisitedChapters((prev) =>
      prev.includes(activeChapter) ? prev : [...prev, activeChapter],
    );
  }, [activeChapter]);

  // Trigger the Cinematic Ending Sequence once when all crystals and relics are found
  useEffect(() => {
    if (allCompleted && !endingTriggeredRef.current) {
      endingTriggeredRef.current = true;
      const timer = window.setTimeout(() => {
        setAutoExplore(false);
        setEndingModalOpen(true);
        soundEngine.playChime(523.25, 0.08);
        window.setTimeout(() => soundEngine.playChime(659.25, 0.08), 140);
        window.setTimeout(() => soundEngine.playChime(783.99, 0.1), 280);
      }, 900);
      return () => window.clearTimeout(timer);
    }
  }, [allCompleted]);

  // Clean up procedural audio & timers on root unmount
  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
      window.clearTimeout(programmaticTimerRef.current);
      soundEngine.dispose();
    };
  }, []);

  // Scroll tracking, active chapter detection, and GSAP ScrollTrigger full-viewport section snapping
  useEffect(() => {
    const activeChapters = sanctuaryUnlocked
      ? [...BASE_CHAPTERS, SANCTUARY_CHAPTER]
      : BASE_CHAPTERS;

    const updateScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgressRef.current = progress;
      setScrollProgress(progress);
      soundEngine.setScrollProgress(progress, window.scrollY);

      const halfViewport = window.innerHeight * 0.5;
      const scrollMid = window.scrollY + halfViewport;
      let currentId: ChapterId = activeChapters[0].id;
      let currentIdx = 0;

      for (let i = 0; i < activeChapters.length; i++) {
        const el = document.getElementById(activeChapters[i].id);
        if (!el) continue;
        if (scrollMid >= el.offsetTop) {
          currentId = activeChapters[i].id;
          currentIdx = i;
        }
      }

      const activeEl = document.getElementById(currentId);
      if (activeEl) {
        const startY = currentIdx === 0 ? 0 : activeEl.offsetTop - halfViewport;
        const endY =
          currentIdx === activeChapters.length - 1
            ? maxScroll
            : activeEl.offsetTop + activeEl.offsetHeight - halfViewport;
        const span = Math.max(1, endY - startY);
        const localProgress = Math.max(0, Math.min(1, (window.scrollY - startY) / span));
        setChapterProgress(localProgress);
      }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    const triggers = activeChapters.map((chapter) => {
      const el = document.getElementById(chapter.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveChapter(chapter.id),
        onEnterBack: () => setActiveChapter(chapter.id),
      });
    });

    // Full-viewport chapter snapping when scroll settles
    const snapTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      snap: {
        snapTo: (value: number) => {
          if (
            autoExploreRef.current ||
            skipAnimationsRef.current ||
            isProgrammaticScrollRef.current
          ) {
            return value;
          }
          const maxScroll = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          const points = activeChapters
            .map((c) => {
              const el = document.getElementById(c.id);
              return el ? Math.max(0, Math.min(1, el.offsetTop / maxScroll)) : null;
            })
            .filter((p): p is number => p !== null);

          if (points.length === 0) return value;

          // Allow resting cleanly at the bottom footer if scrolled past the final chapter top
          const lastPoint = points[points.length - 1];
          if (value > lastPoint + 0.04) {
            points.push(1);
          }

          let closest = points[0];
          let minDiff = Math.abs(value - closest);
          for (const p of points) {
            const diff = Math.abs(value - p);
            if (diff < minDiff) {
              minDiff = diff;
              closest = p;
            }
          }
          return closest;
        },
        duration: { min: 0.25, max: 0.55 },
        delay: 0.12,
        ease: 'power2.inOut',
        inertia: false,
      },
    });

    const onResize = () => {
      ScrollTrigger.refresh();
      updateScroll();
    };
    window.addEventListener('resize', onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', onResize);
      triggers.forEach((t) => t?.kill());
      snapTrigger.kill();
    };
  }, [sanctuaryUnlocked]);

  // Smooth Cinematic Auto-Explore camera glide (interruptible on manual scroll/touch/keys)
  useEffect(() => {
    if (!autoExplore) return;

    let rafId = 0;
    let lastTime = performance.now();
    const speedPxPerSec = skipAnimationsRef.current ? 150 : 96;

    const pauseOnUserInput = () => {
      setAutoExplore(false);
    };

    const pauseOnKey = (e: KeyboardEvent) => {
      if (
        ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End'].includes(e.code)
      ) {
        setAutoExplore(false);
      }
    };

    window.addEventListener('wheel', pauseOnUserInput, { passive: true });
    window.addEventListener('touchstart', pauseOnUserInput, { passive: true });
    window.addEventListener('keydown', pauseOnKey);

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      if (window.scrollY >= maxScroll - 2) {
        setAutoExplore(false);
        return;
      }

      window.scrollTo({
        top: Math.min(maxScroll, window.scrollY + speedPxPerSec * dt),
        behavior: 'auto',
      });
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', pauseOnUserInput);
      window.removeEventListener('touchstart', pauseOnUserInput);
      window.removeEventListener('keydown', pauseOnKey);
    };
  }, [autoExplore]);

  const showToast = useCallback((toast: RewardToast) => {
    setRewardToast(toast);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setRewardToast(null);
    }, 6500);
  }, []);

  const beginProgrammaticScroll = useCallback((durationMs = 950) => {
    isProgrammaticScrollRef.current = true;
    window.clearTimeout(programmaticTimerRef.current);
    programmaticTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, durationMs);
  }, []);

  const navigateToSection = useCallback(
    (id: ChapterId) => {
      setAutoExplore(false);
      const target = document.getElementById(id);
      if (!target) return;
      const prefersReduced =
        skipAnimationsRef.current ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      beginProgrammaticScroll(prefersReduced ? 120 : 950);
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      soundEngine.playChime(523.25, 0.06);
    },
    [beginProgrammaticScroll],
  );

  const handlePortalTravel = useCallback(
    (from: ChapterId, to: ChapterId, label: string) => {
      setAutoExplore(false);
      const prefersReduced =
        skipAnimationsRef.current ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      soundEngine.playChime(659.25, 0.1);
      setPortalHistory((prev) => [...prev, from]);

      if (prefersReduced) {
        beginProgrammaticScroll(150);
        const target = document.getElementById(to);
        target?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      beginProgrammaticScroll(1000);
      setPortalOverlay({ active: true, label });
      window.setTimeout(() => {
        const target = document.getElementById(to);
        target?.scrollIntoView({ behavior: 'auto', block: 'start' });
        soundEngine.playChime(783.99, 0.08);
      }, 380);

      window.setTimeout(() => {
        setPortalOverlay({ active: false, label: '' });
      }, 820);
    },
    [beginProgrammaticScroll],
  );

  const handleReturnPrevious = useCallback(() => {
    setAutoExplore(false);
    const allChapters = [...BASE_CHAPTERS, SANCTUARY_CHAPTER];
    setPortalHistory((prev) => {
      if (prev.length === 0) return prev;
      const previousId = prev[prev.length - 1];
      const nextStack = prev.slice(0, -1);

      const prefersReduced =
        skipAnimationsRef.current ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      soundEngine.playChime(440, 0.08);

      if (prefersReduced) {
        beginProgrammaticScroll(150);
        document.getElementById(previousId)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        beginProgrammaticScroll(950);
        const chapterTitle =
          allChapters.find((c) => c.id === previousId)?.title.toUpperCase() ?? 'PREVIOUS REALM';
        setPortalOverlay({ active: true, label: `RETURNING TO ${chapterTitle}` });
        window.setTimeout(() => {
          document.getElementById(previousId)?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 360);
        window.setTimeout(() => {
          setPortalOverlay({ active: false, label: '' });
        }, 780);
      }

      return nextStack;
    });
  }, [beginProgrammaticScroll]);

  const handleDiscover = useCallback(
    (id: string) => {
      const item = HIDDEN_DISCOVERIES.find((d) => d.id === id);
      if (!item) return;

      setDiscoveredIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      soundEngine.playChime(783.99, 0.09);
      window.setTimeout(() => soundEngine.playChime(987.77, 0.06), 140);

      showToast({
        kind: 'discovery',
        subtitle: 'Discovery Uncovered',
        title: item.title,
        body: item.message,
      });
    },
    [showToast],
  );

  const handleCollectCrystal = useCallback(
    (crystal: CrystalItem) => {
      setCollectedCrystals((prev) => {
        if (prev.includes(crystal.id)) return prev;
        const next = [...prev, crystal.id];
        const unlockedNow = next.length >= AETHER_CRYSTALS.length;

        soundEngine.playChime(659.25, 0.09);
        window.setTimeout(() => soundEngine.playChime(880, 0.08), 110);
        if (unlockedNow) {
          window.setTimeout(() => soundEngine.playChime(1046.5, 0.1), 240);
        }

        showToast({
          kind: 'crystal',
          subtitle: unlockedNow
            ? `All ${AETHER_CRYSTALS.length}/${AETHER_CRYSTALS.length} Shards United — Sanctuary Unlocked!`
            : `Crystal Collected (${next.length}/${AETHER_CRYSTALS.length})`,
          title: crystal.name,
          body: unlockedNow
            ? 'The Astral Sanctuary (Chapter VI) has opened beyond The Final Horizon.'
            : crystal.lore,
        });

        return next;
      });
    },
    [showToast],
  );

  const handleToggleSound = useCallback(() => {
    const enabled = soundEngine.toggle();
    setSoundEnabled(enabled);
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'fantasy' ? 'digital' : 'fantasy'));
    soundEngine.playChime(587.33, 0.06);
  }, []);

  const handleToggleAutoExplore = useCallback(() => {
    setAutoExplore((prev) => {
      const next = !prev;
      if (next && window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 4) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      return next;
    });
  }, []);

  const handleToggleSkipAnimations = useCallback(() => {
    setSkipAnimations((prev) => !prev);
  }, []);

  const handleInteractiveChime = useCallback((freq: number) => {
    soundEngine.playChime(freq, 0.08);
  }, []);

  const timePhase = getTimePhaseFromProgress(scrollProgress, sanctuaryUnlocked);
  const previousRealm = portalHistory.length > 0 ? portalHistory[portalHistory.length - 1] : null;
  const isDigital = theme === 'digital';

  return (
    <div data-theme={theme} className="relative min-h-screen w-full bg-[#060916] text-[#F4EFE6]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#0C122B] focus:text-[#FFF8EC] focus:border focus:border-[#FFD27D] focus:outline-none focus:ring-2 focus:ring-[#FFD27D] text-xs font-medium"
      >
        Skip to Aether interactive journey
      </a>
      <LoadingScreen onSkipAnimations={() => setSkipAnimations(true)} />
      <CinematicCursor theme={theme} skipAnimations={skipAnimations} />
      <PortalTransitionOverlay
        active={portalOverlay.active}
        label={portalOverlay.label}
        theme={theme}
      />

      <NavigationHUD
        activeChapter={activeChapter}
        scrollProgress={scrollProgress}
        chapterProgress={chapterProgress}
        timePhase={timePhase}
        soundEnabled={soundEnabled}
        previousRealm={previousRealm}
        discoveredIds={discoveredIds}
        collectedCrystals={collectedCrystals}
        sanctuaryUnlocked={sanctuaryUnlocked}
        theme={theme}
        autoExplore={autoExplore}
        skipAnimations={skipAnimations}
        onToggleSound={handleToggleSound}
        onNavigate={navigateToSection}
        onReturnPrevious={handleReturnPrevious}
        onOpenStorybook={() => {
          setAutoExplore(false);
          setStorybookOpen(true);
        }}
        onToggleAutoExplore={handleToggleAutoExplore}
        onToggleTheme={handleToggleTheme}
        onToggleSkipAnimations={handleToggleSkipAnimations}
      />

      <DynamicSkyAtmosphere scrollProgress={scrollProgress} theme={theme} />
      <AtmosphericCanvas
        scrollProgressRef={scrollProgressRef}
        theme={theme}
        skipAnimations={skipAnimations}
      />

      <ExplorerCompanion
        activeChapter={activeChapter}
        scrollProgress={scrollProgress}
        theme={theme}
        skipAnimations={skipAnimations}
      />

      {storybookOpen && (
        <LivingStorybook
          open={storybookOpen}
          activeChapter={activeChapter}
          theme={theme}
          visitedChapters={visitedChapters}
          onClose={() => setStorybookOpen(false)}
          onNavigateChapter={navigateToSection}
        />
      )}

      <CinematicEndingModal
        open={endingModalOpen}
        theme={theme}
        discoveriesCount={discoveredIds.length}
        totalDiscoveries={HIDDEN_DISCOVERIES.length}
        crystalsCount={collectedCrystals.length}
        totalCrystals={AETHER_CRYSTALS.length}
        onEnterSanctuary={() => {
          setEndingModalOpen(false);
          navigateToSection('sanctuary');
        }}
        onReplayJourney={() => {
          setEndingModalOpen(false);
          navigateToSection('awakening');
        }}
        onClose={() => setEndingModalOpen(false)}
      />

      {/* Discovery & Crystal Quest Reward Toast */}
      {rewardToast && (
        <div
          role="status"
          aria-live="polite"
          className={`animate-toast-enter fixed top-[68px] sm:top-auto sm:bottom-20 left-3 right-3 sm:left-auto sm:right-8 z-50 mx-auto sm:mx-0 max-w-sm bg-[#0C122B]/96 border rounded-xl p-4 shadow-2xl ${
            isDigital ? 'border-[#5CE1E6]/55' : 'border-[#E5A94C]/55'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className={`flex items-center gap-2 text-xs tracking-wider uppercase font-medium ${
                isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
              }`}
            >
              {rewardToast.kind === 'crystal' ? (
                <Gem className="w-3.5 h-3.5" style={{ color: isDigital ? '#5CE1E6' : '#E5A94C' }} />
              ) : (
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: isDigital ? '#5CE1E6' : '#E5A94C' }}
                />
              )}
              <span>{rewardToast.subtitle}</span>
            </div>
            <button
              type="button"
              onClick={() => setRewardToast(null)}
              aria-label="Dismiss notification"
              className={`text-[#A8A2BE] hover:text-white cursor-pointer p-1 rounded focus-visible:outline-none focus-visible:ring-2 ${
                isDigital ? 'focus-visible:ring-[#5CE1E6]' : 'focus-visible:ring-[#E5A94C]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="mt-1.5 font-display text-xl font-semibold text-[#FFF8EC]">
            {rewardToast.title}
          </h4>
          <p className="mt-1 text-xs sm:text-sm text-[#D6D0E4] leading-relaxed">
            {rewardToast.body}
          </p>
        </div>
      )}

      <main
        id="main-content"
        aria-label="Aether interactive parallax chapters"
        className="relative w-full"
      >
        <Section1Awakening
          theme={theme}
          discoveredIds={discoveredIds}
          collectedCrystals={collectedCrystals}
          onExploreClick={() => navigateToSection('kingdom')}
          onDiscover={handleDiscover}
          onCollectCrystal={handleCollectCrystal}
          onPortalTravel={handlePortalTravel}
        />
        <Section2FloatingKingdom
          theme={theme}
          discoveredIds={discoveredIds}
          collectedCrystals={collectedCrystals}
          onIslandInteract={handleInteractiveChime}
          onDiscover={handleDiscover}
          onCollectCrystal={handleCollectCrystal}
          onPortalTravel={handlePortalTravel}
        />
        <Section3LostForest
          theme={theme}
          discoveredIds={discoveredIds}
          collectedCrystals={collectedCrystals}
          onRelicInteract={handleInteractiveChime}
          onDiscover={handleDiscover}
          onCollectCrystal={handleCollectCrystal}
          onPortalTravel={handlePortalTravel}
        />
        <Section4CelestialGate
          theme={theme}
          collectedCrystals={collectedCrystals}
          onCollectCrystal={handleCollectCrystal}
          onPortalTravel={handlePortalTravel}
        />
        <Section5FinalHorizon
          theme={theme}
          collectedCrystals={collectedCrystals}
          sanctuaryUnlocked={sanctuaryUnlocked}
          onCollectCrystal={handleCollectCrystal}
          onEnterSanctuary={() => navigateToSection('sanctuary')}
          onExploreAgain={() => navigateToSection('awakening')}
        />
        {sanctuaryUnlocked && (
          <Section6SecretSanctuary
            theme={theme}
            allCompleted={allCompleted}
            onResonate={handleInteractiveChime}
            onOpenEnding={() => setEndingModalOpen(true)}
            onBackToTop={() => navigateToSection('awakening')}
          />
        )}
      </main>
    </div>
  );
}
