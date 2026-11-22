import { useEffect, useRef, useState } from 'react';
import type { WorldTheme } from '../types/aether';

interface CinematicCursorProps {
  theme: WorldTheme;
  skipAnimations: boolean;
}

/**
 * Subtle desktop-only custom animated cursor that expands over interactive elements.
 * Automatically disabled on touch devices, prefers-reduced-motion, or skipAnimations.
 */
export function CinematicCursor({ theme, skipAnimations }: CinematicCursorProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const prefersReduced =
      skipAnimations || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (prefersReduced || !hasFinePointer) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let visible = false;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        ringX = targetX;
        ringY = targetY;
        visible = true;
      }

      const el = e.target as HTMLElement | null;
      const interactive = Boolean(
        el?.closest('button, a, [role="button"], [data-cursor="interactive"], canvas'),
      );
      setIsHoveringInteractive(interactive);
    };

    const onPointerDown = () => setIsPressed(true);
    const onPointerUp = () => setIsPressed(false);

    const tick = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        dotRef.current.style.opacity = visible ? '1' : '0';
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        ringRef.current.style.opacity = visible ? '1' : '0';
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(rafId);
    };
  }, [skipAnimations]);

  if (!enabled) return null;

  const isDigital = theme === 'digital';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] hidden md:block">
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-4 -mt-4 will-change-transform opacity-0 transition-opacity duration-300"
      >
        <div
          className={`w-8 h-8 rounded-full border transition-all duration-200 ease-out ${
            isHoveringInteractive
              ? isDigital
                ? 'scale-150 border-[#5CE1E6] bg-[#5CE1E6]/10'
                : 'scale-150 border-[#FFD27D] bg-[#FFD27D]/10'
              : isDigital
                ? 'scale-100 border-[#5CE1E6]/55 bg-transparent'
                : 'scale-100 border-[#E5A94C]/55 bg-transparent'
          } ${isPressed ? 'scale-90' : ''}`}
        />
      </div>

      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 will-change-transform opacity-0"
      >
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-150 ${
            isHoveringInteractive
              ? 'bg-[#FFF7E2]'
              : isDigital
                ? 'bg-[#5CE1E6]'
                : 'bg-[#FFD27D]'
          }`}
        />
      </div>
    </div>
  );
}
