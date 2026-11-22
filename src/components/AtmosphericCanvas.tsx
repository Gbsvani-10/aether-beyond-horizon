import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { WorldTheme } from '../types/aether';

interface AtmosphericCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  theme: WorldTheme;
  skipAnimations: boolean;
}

/**
 * Continuous atmospheric particle layer rendered via Three.js WebGL
 * with interactive pointer swirl/repulsion, Fantasy/Digital theme palettes,
 * mobile & low-power optimization, and 2D Canvas fallback.
 */
export function AtmosphericCanvas({
  scrollProgressRef,
  theme,
  skipAnimations,
}: AtmosphericCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<number>(theme === 'digital' ? 1 : 0);
  const reducedRef = useRef<boolean>(skipAnimations);

  themeRef.current = theme === 'digital' ? 1 : 0;
  reducedRef.current = skipAnimations;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced =
      skipAnimations || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileOrLowPower =
      window.innerWidth < 768 ||
      (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4);

    let hasWebgl = false;
    try {
      hasWebgl = Boolean(window.WebGLRenderingContext);
    } catch {
      hasWebgl = false;
    }

    if (!hasWebgl) {
      return initFallback2DCanvas(
        container,
        scrollProgressRef,
        themeRef,
        prefersReduced,
        isMobileOrLowPower,
      );
    }

    return initThreeAtmosphere(
      container,
      scrollProgressRef,
      themeRef,
      prefersReduced,
      isMobileOrLowPower,
    );
  }, [scrollProgressRef, skipAnimations]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
    />
  );
}

function initThreeAtmosphere(
  container: HTMLDivElement,
  scrollProgressRef: React.MutableRefObject<number>,
  themeRef: React.MutableRefObject<number>,
  prefersReduced: boolean,
  isMobileOrLowPower: boolean,
): () => void {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.z = 18;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobileOrLowPower,
      powerPreference: 'high-performance',
    });
  } catch {
    return initFallback2DCanvas(
      container,
      scrollProgressRef,
      themeRef,
      prefersReduced,
      isMobileOrLowPower,
    );
  }

  let isSoftwareGl = false;
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    isSoftwareGl = false;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const maxDpr = isSoftwareGl || isMobileOrLowPower ? 1 : Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(maxDpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const count = isMobileOrLowPower ? 140 : 420;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const sizes = new Float32Array(count);
  const tints = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    phases[i] = Math.random() * Math.PI * 2;
    sizes[i] = 1.6 + Math.random() * 4.4;
    tints[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uTheme: { value: themeRef.current },
      uPixelRatio: { value: maxDpr },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerWorld: { value: new THREE.Vector2(999, 999) },
      uReduced: { value: prefersReduced ? 1.0 : 0.0 },
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aSize;
      attribute float aTint;

      uniform float uTime;
      uniform float uProgress;
      uniform float uPixelRatio;
      uniform vec2 uPointer;
      uniform vec2 uPointerWorld;
      uniform float uReduced;

      varying float vAlpha;
      varying float vTint;

      void main() {
        vec3 pos = position;
        float t = uTime * (1.0 - uReduced);

        pos.x += sin(t * 0.35 + aPhase) * 0.75 + uPointer.x * (0.4 + aTint * 0.6);
        pos.y += cos(t * 0.28 + aPhase * 1.3) * 0.65 + mod(t * 0.22 + aPhase, 22.0) * 0.05;
        pos.y -= (uProgress * 6.0 - 3.0) * (0.3 + aTint * 0.5);
        pos.y = mod(pos.y + 11.0, 22.0) - 11.0;

        vec2 toCursor = pos.xy - uPointerWorld;
        float cursorDist = length(toCursor);
        float influence = smoothstep(4.2, 0.0, cursorDist) * (1.0 - uReduced);
        pos.xy += normalize(toCursor + vec2(0.001)) * influence * 1.35;

        float gateFactor = smoothstep(0.52, 0.72, uProgress) * (1.0 - smoothstep(0.76, 0.92, uProgress));
        float angle = gateFactor * (t * 0.35 + aPhase) * 0.35;
        float s = sin(angle);
        float c = cos(angle);
        pos.xy = mix(pos.xy, mat2(c, -s, s, c) * pos.xy, gateFactor * 0.65);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = aSize * uPixelRatio * (18.0 / max(1.0, -mvPosition.z)) * (1.0 + influence * 0.55);

        float shimmer = 0.55 + 0.45 * sin(t * 1.4 + aPhase * 2.0);
        vAlpha = shimmer * (0.30 + aTint * 0.38 + influence * 0.28);
        vTint = aTint;
      }
    `,
    fragmentShader: `
      uniform float uProgress;
      uniform float uTheme;
      varying float vAlpha;
      varying float vTint;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float glow = smoothstep(0.5, 0.05, dist);
        glow = pow(glow, 1.8);

        vec3 warmGold = vec3(0.98, 0.76, 0.38);
        vec3 daylightSky = vec3(0.75, 0.88, 1.0);
        vec3 twilightViolet = vec3(0.72, 0.58, 0.96);
        vec3 forestAmber = vec3(0.88, 0.94, 0.48);

        float dayBand = smoothstep(0.18, 0.30, uProgress) * (1.0 - smoothstep(0.38, 0.48, uProgress));
        float forestBand = smoothstep(0.38, 0.52, uProgress) * (1.0 - smoothstep(0.58, 0.70, uProgress));
        float cosmosBand = smoothstep(0.62, 0.76, uProgress) * (1.0 - smoothstep(0.86, 0.96, uProgress));

        vec3 fantasyColor = mix(warmGold, twilightViolet, vTint * 0.45);
        fantasyColor = mix(fantasyColor, daylightSky, dayBand * vTint * 0.55);
        fantasyColor = mix(fantasyColor, forestAmber, forestBand * 0.78);
        fantasyColor = mix(fantasyColor, mix(twilightViolet, warmGold, vTint), cosmosBand * 0.85);

        vec3 digitalCyan = vec3(0.36, 0.88, 0.96);
        vec3 digitalPrism = vec3(0.65, 0.55, 0.98);
        vec3 digitalColor = mix(digitalCyan, digitalPrism, vTint);

        vec3 finalColor = mix(fantasyColor, digitalColor, uTheme);
        gl_FragColor = vec4(finalColor, glow * vAlpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerWorldTarget = new THREE.Vector2(999, 999);
  const onPointerMove = (e: PointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerTarget.set(nx * 0.8, ny * 0.8);
    pointerWorldTarget.set(nx * 14.5, ny * 8.5);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const pr = isSoftwareGl || isMobileOrLowPower ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h);
    material.uniforms.uPixelRatio.value = pr;
  };
  window.addEventListener('resize', onResize);

  let contextLost = false;
  const onContextLost = (e: Event) => {
    e.preventDefault();
    contextLost = true;
  };
  const onContextRestored = () => {
    contextLost = false;
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

  let frameId = 0;
  let disposed = false;
  const clock = new THREE.Clock();

  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 80);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  function tick() {
    if (disposed) return;
    if (!contextLost) {
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uTheme.value +=
        (themeRef.current - material.uniforms.uTheme.value) * 0.08;
      material.uniforms.uProgress.value +=
        (scrollProgressRef.current - material.uniforms.uProgress.value) * 0.08;
      material.uniforms.uPointer.value.lerp(pointerTarget, 0.06);
      material.uniforms.uPointerWorld.value.lerp(pointerWorldTarget, 0.12);
      renderer.render(scene, camera);
    }

    if (prefersReduced) return;
    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  }

  tick();

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    clearTimeout(frameId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}

function initFallback2DCanvas(
  container: HTMLDivElement,
  scrollProgressRef: React.MutableRefObject<number>,
  themeRef: React.MutableRefObject<number>,
  prefersReduced: boolean,
  isMobileOrLowPower: boolean,
): () => void {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const count = isMobileOrLowPower ? 45 : 85;
  const particles = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
    speed: 0.0002 + Math.random() * 0.0004,
  }));

  let mouseX = -999;
  let mouseY = -999;
  const onPointerMove = (e: PointerEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let rafId = 0;
  let t = 0;

  const draw = () => {
    t += 0.016;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const progress = scrollProgressRef.current;
    const isDigital = themeRef.current > 0.5;
    const isForest = progress > 0.38 && progress < 0.65;

    for (const p of particles) {
      if (!prefersReduced) {
        p.y = (p.y - p.speed + 1) % 1;
      }
      let px = p.x * w + Math.sin(t + p.phase) * 14;
      let py = p.y * h;

      const dx = px - mouseX;
      const dy = py - mouseY;
      const dist = Math.hypot(dx, dy);
      if (!prefersReduced && dist < 110 && dist > 1) {
        const push = ((110 - dist) / 110) * 26;
        px += (dx / dist) * push;
        py += (dy / dist) * push;
      }

      const alpha = 0.28 + 0.36 * Math.abs(Math.sin(t * 0.8 + p.phase));

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isDigital
        ? `rgba(92, 225, 230, ${alpha})`
        : isForest
          ? `rgba(225, 240, 125, ${alpha})`
          : `rgba(246, 198, 108, ${alpha})`;
      ctx.fill();
    }

    if (!prefersReduced) {
      rafId = requestAnimationFrame(draw);
    }
  };

  draw();

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', resize);
    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}
