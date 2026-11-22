import { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Compass, X } from 'lucide-react';
import {
  STORYBOOK_CHAPTERS,
  type ChapterId,
  type WorldTheme,
} from '../types/aether';

interface LivingStorybookProps {
  open: boolean;
  activeChapter: ChapterId;
  theme: WorldTheme;
  visitedChapters: ChapterId[];
  onClose: () => void;
  onNavigateChapter: (id: ChapterId) => void;
}

function ChapterIllustration({
  chapterId,
  theme,
}: {
  chapterId: ChapterId;
  theme: WorldTheme;
}) {
  const isDigital = theme === 'digital';
  const accent = isDigital ? '#5CE1E6' : '#FFD27D';
  const secondary = isDigital ? '#A78BFA' : '#9B7DF2';
  const bgTop = isDigital ? '#051029' : '#0D1330';
  const bgBottom = isDigital ? '#0D264A' : '#2C1E4D';

  return (
    <svg
      viewBox="0 0 360 180"
      className="w-full h-36 sm:h-44 rounded-lg border border-white/10"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sb-bg-${chapterId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bgTop} />
          <stop offset="100%" stopColor={bgBottom} />
        </linearGradient>
      </defs>
      <rect width="360" height="180" fill={`url(#sb-bg-${chapterId})`} />

      {chapterId === 'awakening' && (
        <>
          <circle cx="180" cy="112" r="34" fill={accent} opacity="0.85" />
          <path d="M0,145 L75,95 L155,130 L235,88 L360,140 L360,180 L0,180 Z" fill="#101534" />
          <path d="M0,160 L120,125 L260,152 L360,130 L360,180 L0,180 Z" fill="#070A18" />
        </>
      )}

      {chapterId === 'kingdom' && (
        <>
          <ellipse cx="180" cy="148" rx="140" ry="18" fill={secondary} opacity="0.22" />
          <path d="M115,82 L245,82 L215,132 L180,152 L145,132 Z" fill="#231E4B" stroke={accent} strokeWidth="1.2" />
          <rect x="164" y="48" width="32" height="34" fill="#322963" />
          <polygon points="158,48 180,26 202,48" fill={accent} />
          <rect x="192" y="84" width="10" height="58" fill={accent} opacity="0.7" />
        </>
      )}

      {chapterId === 'forest' && (
        <>
          <polygon points="90,0 165,0 245,180 140,180" fill={accent} opacity="0.14" />
          <rect x="42" y="10" width="18" height="170" fill="#071219" />
          <rect x="120" y="0" width="14" height="180" fill="#0C1F2A" />
          <rect x="235" y="0" width="16" height="180" fill="#0C1F2A" />
          <rect x="305" y="12" width="20" height="168" fill="#071219" />
          <circle cx="170" cy="98" r="4" fill={accent} />
          <circle cx="205" cy="72" r="3" fill={accent} />
          <circle cx="148" cy="126" r="3" fill={secondary} />
        </>
      )}

      {chapterId === 'gate' && (
        <>
          <circle cx="180" cy="90" r="52" stroke={secondary} strokeWidth="1.5" strokeDasharray="8 6" fill="none" />
          <circle cx="180" cy="90" r="38" stroke={accent} strokeWidth="2.5" strokeDasharray="24 10" fill="none" />
          <circle cx="180" cy="90" r="18" fill={accent} opacity="0.8" />
        </>
      )}

      {(chapterId === 'horizon' || chapterId === 'sanctuary') && (
        <>
          <circle cx="180" cy="96" r="38" fill={accent} opacity="0.75" />
          <path d="M0,138 L95,102 L180,128 L275,96 L360,134 L360,180 L0,180 Z" fill="#0D1028" />
          <line x1="0" y1="142" x2="360" y2="142" stroke={accent} strokeOpacity="0.45" />
        </>
      )}
    </svg>
  );
}

export function LivingStorybook({
  open,
  activeChapter,
  theme,
  visitedChapters,
  onClose,
  onNavigateChapter,
}: LivingStorybookProps) {
  const foundIdx = STORYBOOK_CHAPTERS.findIndex((c) => c.id === activeChapter);
  const initialIndex = foundIdx >= 0 ? foundIdx : STORYBOOK_CHAPTERS.length - 1;
  const [pageIdx, setPageIdx] = useState<number>(initialIndex);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const chapter = STORYBOOK_CHAPTERS[pageIdx] ?? STORYBOOK_CHAPTERS[0];
  const isDigital = theme === 'digital';
  const visited = visitedChapters.includes(chapter.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Living Storybook"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-4 bg-[#030510]/85"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#090E23] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className={`w-4 h-4 ${isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'}`} />
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#FFF8EC]">
              The Living Storybook
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close storybook"
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#C6C0D8] hover:text-white hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chapter Index Tabs */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {STORYBOOK_CHAPTERS.map((item, idx) => {
            const active = idx === pageIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPageIdx(idx)}
                className={`min-h-[38px] px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                  active
                    ? isDigital
                      ? 'bg-[#5CE1E6]/20 text-[#9AF4FF] border border-[#5CE1E6]/50'
                      : 'bg-[#E5A94C]/20 text-[#FFD27D] border border-[#E5A94C]/50'
                    : 'text-[#B6B0CA] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.numeral}. {item.title}
              </button>
            );
          })}
        </div>

        {/* Scrollable Page Content */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <ChapterIllustration chapterId={chapter.id} theme={theme} />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#B6B0CA]">
              <span
                className={`uppercase tracking-[0.2em] font-medium ${
                  isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'
                }`}
              >
                Chapter {chapter.numeral} ·{' '}
                {isDigital ? chapter.digitalSubtitle : chapter.fantasySubtitle}
              </span>
              <span>{visited ? 'Explored' : 'Unvisited'}</span>
            </div>

            <h3 className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold text-[#FFF8EC]">
              {chapter.title}
            </h3>

            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-[#D7D2E5] leading-relaxed">
              {isDigital ? chapter.digitalProse : chapter.fantasyProse}
            </p>

            <p
              className={`mt-4 pt-3 border-t border-white/10 font-display italic text-base sm:text-lg ${
                isDigital ? 'text-[#B8F6FF]' : 'text-[#FFE4AD]'
              }`}
            >
              &ldquo;{chapter.quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-[#060916] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageIdx === 0}
              onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
              className="min-h-[42px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-md border border-white/15 text-xs font-medium text-[#D6D0E4] hover:text-white disabled:opacity-35 cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={pageIdx === STORYBOOK_CHAPTERS.length - 1}
              onClick={() => setPageIdx((i) => Math.min(STORYBOOK_CHAPTERS.length - 1, i + 1))}
              className="min-h-[42px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-md border border-white/15 text-xs font-medium text-[#D6D0E4] hover:text-white disabled:opacity-35 cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateChapter(chapter.id);
            }}
            className={`min-h-[42px] px-4 py-2 inline-flex items-center gap-2 rounded-md text-[#070B1A] text-xs font-semibold tracking-wide cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isDigital
                ? 'bg-[#5CE1E6] hover:bg-[#9AF4FF]'
                : 'bg-[#E5A94C] hover:bg-[#FFD27D]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Travel to Chapter {chapter.numeral}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
