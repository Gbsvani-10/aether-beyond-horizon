import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxLayerProps {
  /**
   * Movement speed factor relative to scroll:
   * ~0.15 for background, ~0.40 for middle-ground, ~0.80 for foreground.
   */
  speed: number;
  /**
   * Subtle desktop mouse parallax offset in pixels (e.g., 8 for bg, 26 for fg).
   */
  mouseFactor?: number;
  className?: string;
  zIndex?: number;
  children: ReactNode;
}

/**
 * Dual-axis ParallaxLayer:
 * - Outer wrapper driven by GSAP ScrollTrigger scrub along Y-axis.
 * - Inner wrapper driven by smoothly damped desktop pointer position along X/Y.
 * Automatically disables motion when `prefers-reduced-motion: reduce` or `.skip-animations` is active.
 */
export function ParallaxLayer({
  speed,
  mouseFactor = 0,
  className = '',
  zIndex,
  children,
}: ParallaxLayerProps) {
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const mouseWrapRef = useRef<HTMLDivElement>(null);
  const [motionDisabled, setMotionDisabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.classList.contains('skip-animations')
    );
  });

  useEffect(() => {
    const syncMotion = () => {
      const reduced =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('skip-animations');
      setMotionDisabled(reduced);
    };

    const observer = new MutationObserver(syncMotion);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    window.addEventListener('aether-motion-change', syncMotion);

    return () => {
      observer.disconnect();
      window.removeEventListener('aether-motion-change', syncMotion);
    };
  }, []);

  useEffect(() => {
    const outer = scrollWrapRef.current;
    if (!outer) return;

    if (motionDisabled) {
      gsap.set(outer, { clearProps: 'transform' });
      return;
    }

    const parentSection = outer.closest('[data-parallax-section]') as HTMLElement | null;
    const triggerEl = parentSection || outer;
    const travelRange = speed * 260;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        outer,
        { y: travelRange * 0.45 },
        {
          y: -travelRange * 0.55,
          ease: 'none',
          scrollTrigger: {
            trigger: triggerEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        },
      );
    }, outer);

    return () => ctx.revert();
  }, [speed, motionDisabled]);

  useEffect(() => {
    const inner = mouseWrapRef.current;
    if (!inner || mouseFactor === 0) return;

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (motionDisabled || !hasFinePointer) {
      inner.style.transform = '';
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = -nx * mouseFactor;
      targetY = -ny * mouseFactor * 0.65;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.065;
      currentY += (targetY - currentY) * 0.065;
      inner.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(rafId);
      inner.style.transform = '';
    };
  }, [mouseFactor, motionDisabled]);

  return (
    <div
      ref={scrollWrapRef}
      className={`will-change-transform ${className}`}
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div ref={mouseWrapRef} className="w-full h-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
