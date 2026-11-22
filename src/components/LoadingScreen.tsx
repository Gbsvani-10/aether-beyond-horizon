import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onReady?: () => void;
  onSkipAnimations?: () => void;
}

const CORE_ASSETS = [
  '/src/assets/images/bg_awakening_sky_1795336493260.jpg',
  '/src/assets/images/bg_floating_kingdom_1795336493985.jpg',
  '/src/assets/images/bg_celestial_cosmos_1795336493195.jpg',
  '/src/assets/images/bg_final_horizon_1795336493369.jpg',
];

export function LoadingScreen({ onReady, onSkipAnimations }: LoadingScreenProps) {
  const [progress, setProgress] = useState(12);
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const dismissImmediately = (skipMotion = false) => {
    if (skipMotion) {
      onSkipAnimations?.();
    }
    setProgress(100);
    setFadingOut(true);
    onReady?.();
    window.setTimeout(() => setVisible(false), skipMotion ? 50 : 450);
  };

  useEffect(() => {
    let mounted = true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let completed = 0;
    const totalSteps = CORE_ASSETS.length + 1;

    const finishLoading = () => {
      if (!mounted) return;
      setProgress(100);
      setFadingOut(true);
      onReady?.();
      window.setTimeout(() => {
        if (mounted) setVisible(false);
      }, prefersReduced ? 80 : 500);
    };

    const bumpProgress = () => {
      if (!mounted) return;
      completed += 1;
      const pct = Math.min(100, Math.round((completed / totalSteps) * 100));
      setProgress((prev) => Math.max(prev, pct));
      if (completed >= totalSteps) {
        finishLoading();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(bumpProgress).catch(bumpProgress);
    } else {
      bumpProgress();
    }

    CORE_ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = bumpProgress;
      img.onerror = bumpProgress;
      img.src = src;
    });

    const fallbackTimer = window.setTimeout(finishLoading, 1450);

    return () => {
      mounted = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [onReady]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading AETHER experience"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050814] transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-24 h-24 flex items-center justify-center mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#E5A94C"
            strokeOpacity="0.3"
            strokeWidth="1.2"
            strokeDasharray="10 8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="34"
            stroke="#C9B3F5"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeDasharray="36 16"
            fill="none"
          />
        </svg>
        <span className="absolute w-3 h-3 rounded-full bg-[#FFD27D] shadow-[0_0_20px_rgba(255,210,125,0.85)]" />
      </div>

      <h2 className="font-display text-3xl sm:text-4xl tracking-[0.28em] text-[#FFF8EC] font-semibold">
        AETHER
      </h2>
      <p className="mt-2 text-xs tracking-[0.24em] uppercase text-[#C9C1D9]">
        Beyond the Horizon
      </p>

      <div className="mt-8 w-56 sm:w-64">
        <div className="h-[2px] w-full bg-white/10 overflow-hidden rounded-full">
          <div
            className="h-full bg-gradient-to-r from-[#D48C3B] via-[#FFD27D] to-[#9B7DF2] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#9E98B6] font-mono tabular-nums">
          <span>Preparing atmosphere</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Accessible Skip Intro / Skip Animations Action */}
      <button
        type="button"
        onClick={() => dismissImmediately(true)}
        className="mt-8 min-h-[40px] px-4 py-1.5 text-xs tracking-wider uppercase text-[#B9B2CF] hover:text-white border border-white/15 rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] transition-colors"
      >
        Skip Intro &amp; Reduce Motion
      </button>
    </div>
  );
}
