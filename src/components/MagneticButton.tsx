import { useRef, type ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Wraps a button or CTA to add subtle damped magnetic pointer attraction on desktop.
 * Automatically inert on touch devices and prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  strength = 0.22,
  className = '',
}: MagneticButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    if (
      document.documentElement.classList.contains('skip-animations') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    const clampedX = Math.max(-9, Math.min(9, dx));
    const clampedY = Math.max(-7, Math.min(7, dy));
    el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (wrapRef.current) {
      wrapRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`inline-block transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
