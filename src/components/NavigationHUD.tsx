import { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  X,
  Gem,
  BookOpen,
  Play,
  Pause,
  ZapOff,
  Cpu,
  Wand2,
} from 'lucide-react';
import type { ChapterId, TimePhase, WorldTheme } from '../types/aether';
import { AETHER_CRYSTALS, HIDDEN_DISCOVERIES } from '../types/aether';

export interface ChapterItem {
  id: ChapterId;
  numeral: string;
  label: string;
  title: string;
}

export const BASE_CHAPTERS: ChapterItem[] = [
  { id: 'awakening', numeral: 'I', label: 'Awakening', title: 'The Awakening' },
  { id: 'kingdom', numeral: 'II', label: 'Kingdom', title: 'The Floating Kingdom' },
  { id: 'forest', numeral: 'III', label: 'Forest', title: 'The Lost Forest' },
  { id: 'gate', numeral: 'IV', label: 'Gate', title: 'The Celestial Gate' },
  { id: 'horizon', numeral: 'V', label: 'Horizon', title: 'The Final Horizon' },
];

export const SANCTUARY_CHAPTER: ChapterItem = {
  id: 'sanctuary',
  numeral: 'VI',
  label: 'Sanctuary',
  title: 'The Astral Sanctuary',
};

interface NavigationHUDProps {
  activeChapter: ChapterId;
  scrollProgress: number;
  chapterProgress: number;
  timePhase: TimePhase;
  soundEnabled: boolean;
  previousRealm: ChapterId | null;
  discoveredIds: string[];
  collectedCrystals: string[];
  sanctuaryUnlocked: boolean;
  theme: WorldTheme;
  autoExplore: boolean;
  skipAnimations: boolean;
  onToggleSound: () => void;
  onNavigate: (id: ChapterId) => void;
  onReturnPrevious: () => void;
  onOpenStorybook: () => void;
  onToggleAutoExplore: () => void;
  onToggleTheme: () => void;
  onToggleSkipAnimations: () => void;
}

function PhaseIcon({ phase }: { phase: TimePhase }) {
  switch (phase) {
    case 'Sunrise':
    case 'New Dawn':
      return <Sunrise className="w-3.5 h-3.5 text-[#FFD27D]" />;
    case 'Daylight':
      return <Sun className="w-3.5 h-3.5 text-[#FFE59E]" />;
    case 'Sunset':
      return <Sunset className="w-3.5 h-3.5 text-[#F4935A]" />;
    case 'Night':
    case 'Eternity':
      return <Moon className="w-3.5 h-3.5 text-[#C9B3F5]" />;
  }
}

export function NavigationHUD({
  activeChapter,
  scrollProgress,
  chapterProgress,
  timePhase,
  soundEnabled,
  previousRealm,
  discoveredIds,
  collectedCrystals,
  sanctuaryUnlocked,
  theme,
  autoExplore,
  skipAnimations,
  onToggleSound,
  onNavigate,
  onReturnPrevious,
  onOpenStorybook,
  onToggleAutoExplore,
  onToggleTheme,
  onToggleSkipAnimations,
}: NavigationHUDProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'discoveries' | 'crystals'>('none');

  const chapters = sanctuaryUnlocked
    ? [...BASE_CHAPTERS, SANCTUARY_CHAPTER]
    : BASE_CHAPTERS;

  const isDigital = theme === 'digital';
  const accentHex = isDigital ? '#5CE1E6' : '#FFD27D';

  useEffect(() => {
    if (!mobileMenuOpen && activeDrawer === 'none') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setActiveDrawer('none');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, activeDrawer]);

  const handleSelectChapter = (id: ChapterId) => {
    setMobileMenuOpen(false);
    setActiveDrawer('none');
    onNavigate(id);
  };

  const prevChapterObj = previousRealm
    ? chapters.find((c) => c.id === previousRealm)
    : null;

  return (
    <>
      {/* Fixed Thin Top Horizontal Scroll Progress Bar */}
      <div
        role="progressbar"
        aria-label="Journey scroll progress"
        aria-valuenow={Math.round(scrollProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-white/10 pointer-events-none"
      >
        <div
          className={`h-full origin-left will-change-transform transition-transform duration-75 ${
            isDigital
              ? 'bg-gradient-to-r from-[#38BDF8] via-[#5CE1E6] to-[#A78BFA]'
              : 'bg-gradient-to-r from-[#E5A94C] via-[#FFD27D] to-[#9B7DF2]'
          }`}
          style={{ transform: `scaleX(${Math.max(0.005, Math.min(1, scrollProgress))})` }}
        />
      </div>

      {/* Top Navigation Bar (Strict 3-Zone Contract, <= 56px height) */}
      <header
        aria-label="Primary site header"
        className="fixed top-[3px] left-0 right-0 z-40 h-14 px-4 sm:px-8 flex items-center justify-between gap-4 sm:gap-8 bg-[#060916]/90 border-b border-white/10"
      >
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelectChapter('awakening')}
          aria-label="AETHER — Return to Chapter I: The Awakening"
          className="font-display text-xl sm:text-2xl font-semibold tracking-[0.22em] text-[#F7F1E5] hover:text-[#FFD27D] transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm px-1"
        >
          AETHER
        </button>

        {/* Zone 2: Chapter Links (Desktop) / Compact Chapter Switcher (Mobile) */}
        <nav aria-label="Primary realm chapters navigation" className="hidden md:flex items-center gap-5 lg:gap-7">
          {chapters.map((chapter) => {
            const isActive = activeChapter === chapter.id;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleSelectChapter(chapter.id)}
                aria-current={isActive ? 'location' : undefined}
                aria-label={`Chapter ${chapter.numeral}: ${chapter.title}`}
                className={`relative py-2 text-xs lg:text-sm font-medium tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm ${
                  isActive
                    ? isDigital
                      ? 'text-[#7CE8FF]'
                      : 'text-[#FFD27D]'
                    : 'text-[#C8C3D8] hover:text-[#F7F1E5]'
                }`}
              >
                {chapter.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 bottom-0.5 h-[1.5px] transition-transform duration-200 origin-left ${
                    isDigital ? 'bg-[#5CE1E6]' : 'bg-[#E5A94C]'
                  } ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            );
          })}
        </nav>

        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-chapter-menu"
            aria-label="Select realm chapter and explorer tools"
            className="min-h-[40px] px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-[#E9E2D4] border border-white/15 rounded-md bg-[#0E142D] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
          >
            <span className="relative w-5 h-5 flex items-center justify-center shrink-0" aria-hidden="true">
              <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="rgba(255,210,125,0.2)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke={accentHex}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeDasharray={50.265}
                  strokeDashoffset={50.265 * (1 - Math.max(0.02, Math.min(1, chapterProgress)))}
                />
              </svg>
              <Compass className="w-2.5 h-2.5 text-[#E5A94C] absolute" />
            </span>
            <span>{chapters.find((c) => c.id === activeChapter)?.label ?? 'Chapters'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                mobileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Zone 3: Sound Toggle Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Disable ambient sound' : 'Enable ambient sound'}
            className={`min-h-[40px] px-3.5 py-2 flex items-center gap-2 text-xs font-medium rounded-md border transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
              soundEnabled
                ? 'bg-[#E5A94C]/15 border-[#E5A94C]/60 text-[#FFD27D]'
                : 'bg-[#0C1229] border-white/15 text-[#C8C3D8] hover:text-[#F7F1E5] hover:border-white/30'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#FFD27D]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#9B95B0]" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer: Chapters + Discoveries/Quest Quick Links */}
      {mobileMenuOpen && (
        <div
          id="mobile-chapter-menu"
          role="region"
          aria-label="Mobile realm chapters and explorer tools"
          className="fixed top-[60px] left-3 right-3 z-40 md:hidden bg-[#0A0F24]/98 border border-white/15 rounded-xl p-3 shadow-2xl max-h-[72vh] overflow-y-auto animate-modal-enter"
        >
          <nav aria-label="Mobile realm chapters navigation" className="flex flex-col gap-1">
            {chapters.map((chapter) => {
              const isActive = activeChapter === chapter.id;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => handleSelectChapter(chapter.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`min-h-[44px] px-3 py-2 flex items-center justify-between text-sm rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                    isActive
                      ? isDigital
                        ? 'bg-[#5CE1E6]/15 text-[#9AF4FF]'
                        : 'bg-[#E5A94C]/15 text-[#FFD27D]'
                      : 'text-[#D6D0E4] hover:bg-white/5'
                  }`}
                >
                  <span className="font-medium">{chapter.title}</span>
                  <span className="text-xs text-[#9E97B5] font-display italic">
                    Chapter {chapter.numeral}
                  </span>
                </button>
              );
            })}
          </nav>

          <div
            role="group"
            aria-label="Mobile explorer modes and tools"
            className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStorybook();
              }}
              className="min-h-[42px] px-3 py-2 flex items-center justify-center gap-1.5 rounded-md bg-white/5 border border-white/10 text-[#EAE2D3] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <BookOpen className="w-3.5 h-3.5" style={{ color: accentHex }} />
              <span>Storybook</span>
            </button>
            <button
              type="button"
              onClick={onToggleAutoExplore}
              className={`min-h-[42px] px-3 py-2 flex items-center justify-center gap-1.5 rounded-md border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                autoExplore
                  ? isDigital
                    ? 'bg-[#5CE1E6]/20 border-[#5CE1E6] text-[#9AF4FF]'
                    : 'bg-[#E5A94C]/20 border-[#E5A94C] text-[#FFD27D]'
                  : 'bg-white/5 border-white/10 text-[#EAE2D3]'
              }`}
            >
              {autoExplore ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoExplore ? 'Pause Tour' : 'Auto-Explore'}</span>
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="min-h-[42px] px-3 py-2 flex items-center justify-center gap-1.5 rounded-md bg-white/5 border border-white/10 text-[#EAE2D3] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              {isDigital ? (
                <Cpu className="w-3.5 h-3.5 text-[#5CE1E6]" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-[#FFD27D]" />
              )}
              <span>{isDigital ? 'Digital Mode' : 'Fantasy Mode'}</span>
            </button>
            <button
              type="button"
              onClick={onToggleSkipAnimations}
              className={`min-h-[42px] px-3 py-2 flex items-center justify-center gap-1.5 rounded-md border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                skipAnimations
                  ? 'bg-[#E5A94C]/20 border-[#E5A94C] text-[#FFD27D]'
                  : 'bg-white/5 border-white/10 text-[#EAE2D3]'
              }`}
            >
              <ZapOff className="w-3.5 h-3.5" />
              <span>{skipAnimations ? 'Motion Off' : 'Skip Motion'}</span>
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 px-1 flex items-center justify-between text-xs text-[#C6C0D8]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveDrawer('crystals');
              }}
              className="min-h-[40px] px-2 inline-flex items-center gap-1.5 py-1 rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
              style={{ color: accentHex }}
            >
              <Gem className="w-3.5 h-3.5" />
              <span>
                Crystals {collectedCrystals.length}/{AETHER_CRYSTALS.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveDrawer('discoveries');
              }}
              className="min-h-[40px] px-2 inline-flex items-center gap-1.5 text-[#FFD27D] py-1 rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Relics {discoveredIds.length}/{HIDDEN_DISCOVERIES.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Compact Floating Explorer & Journey Navigation Bar (Bottom Left on Tablet/Desktop + Full Mobile Dock) */}
      <aside
        aria-label="Explorer journey HUD and quick tools"
        className="fixed bottom-3 left-3 right-3 sm:right-auto sm:bottom-5 sm:left-6 z-30 flex flex-col items-start gap-2 pointer-events-none"
      >
        {prevChapterObj && (
          <button
            type="button"
            onClick={onReturnPrevious}
            aria-label={`Return to previous realm: ${prevChapterObj.title}`}
            className="pointer-events-auto min-h-[40px] px-3.5 py-2 flex items-center gap-2 rounded-lg bg-[#141132]/95 border border-[#E5A94C]/55 text-xs font-medium text-[#FFD27D] hover:bg-[#1D1847] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD27D] shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to {prevChapterObj.label}</span>
          </button>
        )}

        {/* Mobile Bottom Explorer Dock */}
        <nav
          aria-label="Mobile explorer quick navigation"
          className="pointer-events-auto flex sm:hidden w-full items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-[#070B1E]/95 border border-white/15 shadow-xl"
        >
          <div className="flex items-center gap-1.5 text-[11px] text-[#E4DEC9] pl-1 whitespace-nowrap">
            <PhaseIcon phase={timePhase} />
            <span>{timePhase === 'New Dawn' ? 'Dawn' : timePhase}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setActiveDrawer((prev) => (prev === 'crystals' ? 'none' : 'crystals'))
              }
              aria-label="Crystal Quest Log"
              aria-expanded={activeDrawer === 'crystals'}
              className="min-h-[40px] px-2 flex items-center gap-1 rounded-lg text-[11px] text-[#E4DEC9] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <Gem className="w-3.5 h-3.5" style={{ color: accentHex }} />
              <span className="font-mono tabular-nums">
                {collectedCrystals.length}/{AETHER_CRYSTALS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveDrawer((prev) => (prev === 'discoveries' ? 'none' : 'discoveries'))
              }
              aria-label="Hidden Discoveries Journal"
              aria-expanded={activeDrawer === 'discoveries'}
              className="min-h-[40px] px-2 flex items-center gap-1 rounded-lg text-[11px] text-[#E4DEC9] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A94C]" />
              <span className="font-mono tabular-nums">
                {discoveredIds.length}/{HIDDEN_DISCOVERIES.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveDrawer('none');
                onOpenStorybook();
              }}
              aria-label="Open Living Storybook"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#E4DEC9] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <BookOpen className="w-4 h-4" style={{ color: accentHex }} />
            </button>

            <button
              type="button"
              onClick={onToggleAutoExplore}
              aria-pressed={autoExplore}
              aria-label={autoExplore ? 'Pause Auto-Explore' : 'Start Auto-Explore'}
              className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                autoExplore
                  ? isDigital
                    ? 'bg-[#5CE1E6]/20 text-[#9AF4FF]'
                    : 'bg-[#E5A94C]/20 text-[#FFD27D]'
                  : 'text-[#C8C3D8] hover:bg-white/10'
              }`}
            >
              {autoExplore ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={isDigital}
              aria-label={`Switch to ${isDigital ? 'Fantasy' : 'Digital Universe'} theme`}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#E4DEC9] hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              {isDigital ? (
                <Cpu className="w-4 h-4 text-[#5CE1E6]" />
              ) : (
                <Wand2 className="w-4 h-4 text-[#FFD27D]" />
              )}
            </button>

            <button
              type="button"
              onClick={onToggleSkipAnimations}
              aria-pressed={skipAnimations}
              aria-label={skipAnimations ? 'Enable animations' : 'Skip animations'}
              className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                skipAnimations ? 'bg-[#E5A94C]/20 text-[#FFD27D]' : 'text-[#A6A0BC] hover:bg-white/10'
              }`}
            >
              <ZapOff className="w-4 h-4" />
            </button>
          </div>
        </nav>

        <div className="pointer-events-auto hidden sm:flex flex-wrap items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#070B1E]/94 border border-white/15 shadow-xl max-w-[calc(100vw-3rem)]">
          {/* Dynamic Time Phase */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10 text-xs text-[#E4DEC9] whitespace-nowrap">
            <PhaseIcon phase={timePhase} />
            <span>{timePhase}</span>
          </div>

          {/* Chapter Numerals with Active Granular Progress Ring */}
          <nav aria-label="Compact realm chapter navigation" className="flex items-center gap-1">
            {chapters.map((chapter) => {
              const isActive = activeChapter === chapter.id;
              const ringCircumference = 84.823;
              const dashOffset =
                ringCircumference * (1 - Math.max(0.02, Math.min(1, chapterProgress)));

              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => handleSelectChapter(chapter.id)}
                  title={`${chapter.title}${isActive ? ` (${Math.round(chapterProgress * 100)}%)` : ''}`}
                  aria-label={`Jump to ${chapter.title}`}
                  aria-current={isActive ? 'step' : undefined}
                  className={`relative w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                    isActive
                      ? isDigital
                        ? 'bg-[#5CE1E6]/12 text-[#7CE8FF]'
                        : 'bg-[#E5A94C]/12 text-[#FFD27D]'
                      : 'text-[#A6A0BC] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <svg
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    >
                      <circle
                        cx="16"
                        cy="16"
                        r="13.5"
                        fill="none"
                        stroke={isDigital ? 'rgba(92,225,230,0.2)' : 'rgba(255,210,125,0.18)'}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="13.5"
                        fill="none"
                        stroke={accentHex}
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={dashOffset}
                        className="transition-[stroke-dashoffset] duration-100 ease-out"
                      />
                    </svg>
                  )}
                  <span className="relative z-10">{chapter.numeral}</span>
                </button>
              );
            })}
          </nav>

          {/* Crystal Quest Counter */}
          <button
            type="button"
            onClick={() =>
              setActiveDrawer((prev) => (prev === 'crystals' ? 'none' : 'crystals'))
            }
            aria-expanded={activeDrawer === 'crystals'}
            title="Crystal Quest Progress"
            className="pl-2.5 border-l border-white/10 flex items-center gap-1.5 text-xs text-[#E4DEC9] hover:text-white whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm py-1"
          >
            <Gem className="w-3.5 h-3.5" style={{ color: accentHex }} />
            <span className="font-mono tabular-nums">
              {collectedCrystals.length}/{AETHER_CRYSTALS.length}
            </span>
          </button>

          {/* Discoveries Counter */}
          <button
            type="button"
            onClick={() =>
              setActiveDrawer((prev) => (prev === 'discoveries' ? 'none' : 'discoveries'))
            }
            aria-expanded={activeDrawer === 'discoveries'}
            title="Hidden Discoveries"
            className="pl-2.5 border-l border-white/10 flex items-center gap-1.5 text-xs text-[#E4DEC9] hover:text-white whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5A94C]" />
            <span className="font-mono tabular-nums">
              {discoveredIds.length}/{HIDDEN_DISCOVERIES.length}
            </span>
          </button>

          {/* Living Storybook Button */}
          <button
            type="button"
            onClick={onOpenStorybook}
            title="Open Living Storybook"
            className="pl-2.5 border-l border-white/10 flex items-center gap-1.5 text-xs text-[#E4DEC9] hover:text-white whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm py-1"
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: accentHex }} />
            <span className="hidden lg:inline">Storybook</span>
          </button>

          {/* Auto-Explore Toggle */}
          <button
            type="button"
            onClick={onToggleAutoExplore}
            aria-pressed={autoExplore}
            title={autoExplore ? 'Pause Auto-Explore' : 'Start Cinematic Auto-Explore'}
            className={`pl-2.5 border-l border-white/10 flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm py-1 ${
              autoExplore ? 'text-[#FFD27D]' : 'text-[#C8C3D8] hover:text-white'
            }`}
          >
            {autoExplore ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{autoExplore ? 'Exploring' : 'Auto'}</span>
          </button>

          {/* Theme Switch: Fantasy / Digital Universe */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={isDigital}
            title={`Switch to ${isDigital ? 'Fantasy' : 'Digital Universe'} theme`}
            className="pl-2.5 border-l border-white/10 flex items-center gap-1.5 text-xs text-[#E4DEC9] hover:text-white whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm py-1"
          >
            {isDigital ? (
              <Cpu className="w-3.5 h-3.5 text-[#5CE1E6]" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-[#FFD27D]" />
            )}
            <span className="hidden xl:inline">{isDigital ? 'Digital' : 'Fantasy'}</span>
          </button>

          {/* Accessible Skip Animations Toggle */}
          <button
            type="button"
            onClick={onToggleSkipAnimations}
            aria-pressed={skipAnimations}
            aria-label={skipAnimations ? 'Enable animations' : 'Skip animations and reduce motion'}
            title={skipAnimations ? 'Animations Disabled (Click to Enable)' : 'Skip Animations'}
            className={`pl-2.5 border-l border-white/10 flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm py-1 ${
              skipAnimations ? 'text-[#FFD27D]' : 'text-[#A6A0BC] hover:text-white'
            }`}
          >
            <ZapOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Crystal Quest Drawer */}
      {activeDrawer === 'crystals' && (
        <div
          role="dialog"
          aria-label="Crystal Quest Log"
          className="fixed bottom-[76px] sm:bottom-20 left-3 right-3 sm:right-auto sm:left-6 z-40 sm:w-full max-w-sm bg-[#090E23]/97 border border-white/15 rounded-xl p-5 shadow-2xl max-h-[68vh] overflow-y-auto animate-modal-enter"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display text-xl font-semibold text-[#FFF8EC]">
                Crystal Quest
              </h3>
              <p className="text-xs text-[#B6B0CA]">
                {collectedCrystals.length} of {AETHER_CRYSTALS.length} Aether Crystals collected
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer('none')}
              aria-label="Close crystal quest log"
              className="w-10 h-10 flex items-center justify-center rounded-md text-[#C6C0D8] hover:text-white hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {AETHER_CRYSTALS.map((crystal) => {
              const found = collectedCrystals.includes(crystal.id);
              return (
                <div
                  key={crystal.id}
                  className="p-3 rounded-lg bg-white/[0.03] border border-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold" style={{ color: accentHex }}>
                      {found ? crystal.name : 'Uncollected Crystal'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrawer('none');
                        handleSelectChapter(crystal.chapterId);
                      }}
                      className="text-[11px] text-[#B9B2CF] hover:text-white underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm px-1"
                    >
                      Visit {chapters.find((c) => c.id === crystal.chapterId)?.label}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#D3CEE3] leading-relaxed">
                    {found ? crystal.lore : crystal.hint}
                  </p>
                </div>
              );
            })}
          </div>

          {sanctuaryUnlocked && (
            <button
              type="button"
              onClick={() => {
                setActiveDrawer('none');
                handleSelectChapter('sanctuary');
              }}
              className={`mt-4 w-full min-h-[42px] px-4 py-2 rounded-lg text-[#080B1A] text-xs font-semibold tracking-wide cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isDigital
                  ? 'bg-[#5CE1E6] hover:bg-[#9AF4FF]'
                  : 'bg-[#E5A94C] hover:bg-[#FFD27D]'
              }`}
            >
              Enter The Astral Sanctuary
            </button>
          )}
        </div>
      )}

      {/* Hidden Discoveries Drawer */}
      {activeDrawer === 'discoveries' && (
        <div
          role="dialog"
          aria-label="Hidden Discoveries Journal"
          className="fixed bottom-[76px] sm:bottom-20 left-3 right-3 sm:right-auto sm:left-6 z-40 sm:w-full max-w-sm bg-[#090E23]/97 border border-white/15 rounded-xl p-5 shadow-2xl max-h-[68vh] overflow-y-auto animate-modal-enter"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display text-xl font-semibold text-[#FFF8EC]">
                Hidden Discoveries
              </h3>
              <p className="text-xs text-[#B6B0CA]">
                {discoveredIds.length} of {HIDDEN_DISCOVERIES.length} relics uncovered
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer('none')}
              aria-label="Close discoveries journal"
              className="w-10 h-10 flex items-center justify-center rounded-md text-[#C6C0D8] hover:text-white hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {HIDDEN_DISCOVERIES.map((item) => {
              const found = discoveredIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-white/[0.03] border border-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#FFD27D]">
                      {found ? item.title : 'Undiscovered Relic'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrawer('none');
                        handleSelectChapter(item.chapterId);
                      }}
                      className="text-[11px] text-[#B9B2CF] hover:text-white underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm px-1"
                    >
                      Visit {chapters.find((c) => c.id === item.chapterId)?.label}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-[#D3CEE3] leading-relaxed">
                    {found ? item.message : item.clue}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Right-Edge Chapter Rail */}
      <aside
        aria-label="Scroll progress and chapter rail"
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3.5"
      >
        <nav aria-label="Chapter scroll depth navigation" className="flex flex-col items-end gap-3.5">
          {chapters.map((chapter) => {
            const isActive = activeChapter === chapter.id;
            const railCircumference = 50.265;
            const railDashOffset =
              railCircumference * (1 - Math.max(0.02, Math.min(1, chapterProgress)));

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleSelectChapter(chapter.id)}
                aria-label={`Jump to Chapter ${chapter.numeral}: ${chapter.title}`}
                aria-current={isActive ? 'step' : undefined}
                className="group flex items-center gap-3 py-1 px-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] rounded-sm"
              >
                <span
                  className={`text-xs tracking-wider transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? isDigital
                        ? 'opacity-100 text-[#7CE8FF] translate-x-0'
                        : 'opacity-100 text-[#FFD27D] translate-x-0'
                      : 'opacity-0 group-hover:opacity-100 text-[#C8C3D8] translate-x-1 group-hover:translate-x-0'
                  }`}
                >
                  {chapter.numeral} · {chapter.label}
                </span>
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="relative w-5 h-5 flex items-center justify-center shrink-0"
                  >
                    <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke={isDigital ? 'rgba(92,225,230,0.22)' : 'rgba(255,210,125,0.2)'}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke={accentHex}
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeDasharray={railCircumference}
                        strokeDashoffset={railDashOffset}
                        className="transition-[stroke-dashoffset] duration-100 ease-out"
                      />
                    </svg>
                    <span
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: accentHex }}
                    />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="block h-[2px] w-3.5 bg-white/30 group-hover:w-5 group-hover:bg-white/65 transition-all duration-200 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div
          aria-label={`Overall journey progress: ${Math.round(scrollProgress * 100)} percent`}
          className="mt-2 text-[11px] font-mono tabular-nums text-[#A6A0BA]"
        >
          {Math.round(scrollProgress * 100)}%
        </div>
      </aside>
    </>
  );
}
