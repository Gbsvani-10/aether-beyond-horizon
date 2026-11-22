import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { WorldTheme } from '../types/aether';

export type ArtifactId = 'island' | 'obelisk' | 'astrolabe';

interface ArtifactSpec {
  id: ArtifactId;
  name: string;
  materialNote: string;
  parts: Record<string, { title: string; detail: string }>;
}

const ARTIFACTS: Record<ArtifactId, ArtifactSpec> = {
  island: {
    id: 'island',
    name: 'Skybound Sanctuary',
    materialNote: 'Aetherite Stone · Sunstone Crystal',
    parts: {
      spire: {
        title: 'Sunstone Beacon',
        detail: 'Channels golden twilight resonance to stabilize surrounding islands in orbit.',
      },
      plateau: {
        title: 'Basalt Sky-Plateau',
        detail: 'Porous volcanic rock infused with buoyant mineral veins.',
      },
      ring: {
        title: 'Orbital Stabilizer Ring',
        detail: 'Engraved bronze halo spinning in harmony with high-altitude currents.',
      },
    },
  },
  obelisk: {
    id: 'obelisk',
    name: 'Monolith of Echoes',
    materialNote: 'Obsidian Slate · Brushed Brass',
    parts: {
      spire: {
        title: 'Apex Crown',
        detail: 'Casts harmonic frequencies across neighboring valleys during dusk.',
      },
      plateau: {
        title: 'Runic Plinth',
        detail: 'Foundation slab anchored by counter-rotating brass rings.',
      },
      ring: {
        title: 'Resonance Halo',
        detail: 'Sensitive to magnetic tides and traveler proximity.',
      },
    },
  },
  astrolabe: {
    id: 'astrolabe',
    name: 'Celestial Astrolabe',
    materialNote: 'Gilded Bronze · Starlight Core',
    parts: {
      spire: {
        title: 'Starlight Core',
        detail: 'Miniature captive dawn star guiding navigators toward the Celestial Gate.',
      },
      plateau: {
        title: 'Meridian Base',
        detail: 'Precision pedestal calibrated to the five realms of Aether.',
      },
      ring: {
        title: 'Armillary Spheres',
        detail: 'Concentric gilded rings tracking sunrise, daylight, sunset, and night.',
      },
    },
  },
};

interface Interactive3DArtifactProps {
  theme?: WorldTheme;
  onInteractChime?: (freq: number) => void;
}

/**
 * Lazy-loaded Three.js 3D Object Inspector:
 * - Supports drag rotation, scroll/button zoom, and Raycaster part clicking.
 * - Uses RoomEnvironment PBR lighting, software-WebGL pacing, and WebGL fallback.
 */
export default function Interactive3DArtifact({
  theme = 'fantasy',
  onInteractChime,
}: Interactive3DArtifactProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactId>('island');
  const [selectedPart, setSelectedPart] = useState<{ title: string; detail: string }>(
    ARTIFACTS.island.parts.spire,
  );
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const activeArtifactRef = useRef<ArtifactId>('island');
  const groupsRef = useRef<Record<ArtifactId, THREE.Group> | null>(null);
  const materialsRef = useRef<{
    goldMat: THREE.MeshStandardMaterial;
    crystalMat: THREE.MeshStandardMaterial;
    stoneMat: THREE.MeshStandardMaterial;
    keyLight: THREE.DirectionalLight;
  } | null>(null);
  const chimeRef = useRef(onInteractChime);
  chimeRef.current = onInteractChime;

  const isDigital = theme === 'digital';

  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats) return;
    if (isDigital) {
      mats.stoneMat.color.setHex(0x1e3a6e);
      mats.goldMat.color.setHex(0x5ce1e6);
      mats.crystalMat.color.setHex(0x7ce8ff);
      mats.crystalMat.emissive.setHex(0x38bdf8);
      mats.keyLight.color.setHex(0x9bf4ff);
    } else {
      mats.stoneMat.color.setHex(0x352b63);
      mats.goldMat.color.setHex(0xe5a94c);
      mats.crystalMat.color.setHex(0xffd27d);
      mats.crystalMat.emissive.setHex(0xe59638);
      mats.keyLight.color.setHex(0xffd28a);
    }
  }, [isDigital]);

  useEffect(() => {
    activeArtifactRef.current = activeArtifact;
    setSelectedPart(ARTIFACTS[activeArtifact].parts.spire);
    if (groupsRef.current) {
      (Object.keys(groupsRef.current) as ArtifactId[]).forEach((key) => {
        if (groupsRef.current) {
          groupsRef.current[key].visible = key === activeArtifact;
        }
      });
    }
  }, [activeArtifact]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReduced =
      document.documentElement.classList.contains('skip-animations') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
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

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 300;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 1.5, 4.6);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 7.5;
    controls.autoRotate = !prefersReduced && !isSoftwareGl;
    controls.autoRotateSpeed = 0.85;
    controlsRef.current = controls;

    // Warm Key + Cool Hemisphere Fill + Rim
    const hemiLight = new THREE.HemisphereLight(0x8fa8ff, 0x2a1b42, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffd28a, 1.8);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9b7df2, 1.1);
    rimLight.position.set(-4, 2, -4);
    scene.add(rimLight);

    // Materials (Varied roughness & metalness across adjacent parts)
    const stoneMat = new THREE.MeshStandardMaterial({
      color: isDigital ? 0x1e3a6e : 0x352b63,
      roughness: 0.82,
      metalness: 0.08,
    });
    const darkRockMat = new THREE.MeshStandardMaterial({
      color: 0x161430,
      roughness: 0.9,
      metalness: 0.05,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: isDigital ? 0x5ce1e6 : 0xe5a94c,
      roughness: 0.24,
      metalness: 0.88,
    });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: isDigital ? 0x7ce8ff : 0xffd27d,
      emissive: isDigital ? 0x38bdf8 : 0xe59638,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.25,
    });

    materialsRef.current = { goldMat, crystalMat, stoneMat, keyLight };

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const clickableMeshes: THREE.Object3D[] = [];

    const registerPart = (mesh: THREE.Mesh, partKey: 'spire' | 'plateau' | 'ring') => {
      mesh.userData.partKey = partKey;
      clickableMeshes.push(mesh);
      return mesh;
    };

    // 1. Composite Floating Island (6 distinct parts)
    const islandGroup = new THREE.Group();
    const topGeo = new THREE.CylinderGeometry(1.15, 0.95, 0.28, 7);
    const spireBaseGeo = new THREE.ConeGeometry(0.92, 1.45, 7);
    const towerGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.72, 6);
    const crystalGeo = new THREE.OctahedronGeometry(0.24, 0);
    const ringGeo = new THREE.TorusGeometry(1.42, 0.035, 12, 48);
    const shardGeo = new THREE.OctahedronGeometry(0.22, 0);
    geometriesToDispose.push(topGeo, spireBaseGeo, towerGeo, crystalGeo, ringGeo, shardGeo);

    const plateauTop = registerPart(new THREE.Mesh(topGeo, stoneMat), 'plateau');
    plateauTop.position.y = 0.05;
    const plateauUnder = registerPart(new THREE.Mesh(spireBaseGeo, darkRockMat), 'plateau');
    plateauUnder.rotation.x = Math.PI;
    plateauUnder.position.y = -0.8;
    const beaconTower = registerPart(new THREE.Mesh(towerGeo, stoneMat), 'spire');
    beaconTower.position.set(0, 0.52, 0);
    const beaconCrystal = registerPart(new THREE.Mesh(crystalGeo, crystalMat), 'spire');
    beaconCrystal.position.set(0, 1.12, 0);
    const orbitRing = registerPart(new THREE.Mesh(ringGeo, goldMat), 'ring');
    orbitRing.rotation.x = Math.PI / 2.25;
    orbitRing.rotation.y = 0.25;
    const miniShard1 = registerPart(new THREE.Mesh(shardGeo, darkRockMat), 'plateau');
    miniShard1.position.set(-1.15, -0.35, 0.45);
    const miniShard2 = registerPart(new THREE.Mesh(shardGeo, darkRockMat), 'plateau');
    miniShard2.scale.setScalar(0.75);
    miniShard2.position.set(1.1, -0.15, -0.4);

    islandGroup.add(
      plateauTop,
      plateauUnder,
      beaconTower,
      beaconCrystal,
      orbitRing,
      miniShard1,
      miniShard2,
    );
    scene.add(islandGroup);

    // 2. Composite Ancient Obelisk (5 distinct parts)
    const obeliskGroup = new THREE.Group();
    obeliskGroup.visible = false;
    const plinthGeo = new THREE.CylinderGeometry(0.75, 0.92, 0.35, 6);
    const shaftGeo = new THREE.CylinderGeometry(0.22, 0.36, 1.55, 4);
    const capGeo = new THREE.ConeGeometry(0.24, 0.38, 4);
    const obRingGeo = new THREE.TorusGeometry(0.88, 0.04, 12, 48);
    geometriesToDispose.push(plinthGeo, shaftGeo, capGeo, obRingGeo);

    const obPlinth = registerPart(new THREE.Mesh(plinthGeo, darkRockMat), 'plateau');
    obPlinth.position.y = -0.78;
    const obShaft = registerPart(new THREE.Mesh(shaftGeo, stoneMat), 'spire');
    obShaft.rotation.y = Math.PI / 4;
    obShaft.position.y = 0.14;
    const obCap = registerPart(new THREE.Mesh(capGeo, crystalMat), 'spire');
    obCap.rotation.y = Math.PI / 4;
    obCap.position.y = 1.1;
    const obRing1 = registerPart(new THREE.Mesh(obRingGeo, goldMat), 'ring');
    obRing1.rotation.x = Math.PI / 2.4;
    const obRing2 = registerPart(new THREE.Mesh(obRingGeo, goldMat), 'ring');
    obRing2.scale.setScalar(0.76);
    obRing2.rotation.x = -Math.PI / 3;
    obRing2.position.y = 0.45;

    obeliskGroup.add(obPlinth, obShaft, obCap, obRing1, obRing2);
    scene.add(obeliskGroup);

    // 3. Composite Celestial Astrolabe (5 distinct parts)
    const astrolabeGroup = new THREE.Group();
    astrolabeGroup.visible = false;
    const baseGeo = new THREE.CylinderGeometry(0.65, 0.85, 0.25, 24);
    const outerArcGeo = new THREE.TorusGeometry(1.15, 0.045, 16, 60);
    const innerArcGeo = new THREE.TorusGeometry(0.85, 0.038, 16, 60);
    const coreGeo = new THREE.IcosahedronGeometry(0.32, 1);
    geometriesToDispose.push(baseGeo, outerArcGeo, innerArcGeo, coreGeo);

    const astroBase = registerPart(new THREE.Mesh(baseGeo, darkRockMat), 'plateau');
    astroBase.position.y = -1.15;
    const astroRing1 = registerPart(new THREE.Mesh(outerArcGeo, goldMat), 'ring');
    const astroRing2 = registerPart(new THREE.Mesh(innerArcGeo, goldMat), 'ring');
    astroRing2.rotation.y = Math.PI / 3;
    const astroRing3 = registerPart(new THREE.Mesh(innerArcGeo, stoneMat), 'ring');
    astroRing3.scale.setScalar(0.72);
    astroRing3.rotation.x = Math.PI / 2.5;
    const astroCore = registerPart(new THREE.Mesh(coreGeo, crystalMat), 'spire');

    astrolabeGroup.add(astroBase, astroRing1, astroRing2, astroRing3, astroCore);
    scene.add(astrolabeGroup);

    groupsRef.current = {
      island: islandGroup,
      obelisk: obeliskGroup,
      astrolabe: astrolabeGroup,
    };

    // Raycaster for clicking parts
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore drag rotations

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNDC, camera);
      const activeGroup = groupsRef.current?.[activeArtifactRef.current];
      if (!activeGroup) return;

      const hits = raycaster.intersectObjects(activeGroup.children, false);
      if (hits.length > 0) {
        const key = hits[0].object.userData.partKey as 'spire' | 'plateau' | 'ring' | undefined;
        if (key) {
          setSelectedPart(ARTIFACTS[activeArtifactRef.current].parts[key]);
          chimeRef.current?.(key === 'spire' ? 698.46 : key === 'ring' ? 587.33 : 440);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let contextLost = false;
    const onLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onRestored = () => {
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored);

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
        const t = clock.getElapsedTime();
        if (!prefersReduced) {
          beaconCrystal.rotation.y = t * 0.9;
          orbitRing.rotation.z = t * 0.35;
          obRing1.rotation.z = t * 0.4;
          obRing2.rotation.z = -t * 0.5;
          astroRing1.rotation.y = t * 0.3;
          astroRing2.rotation.x = t * 0.45;
          astroCore.rotation.y = -t * 0.6;
        }
        controls.update();
        renderer.render(scene, camera);
      }
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
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
      controls.dispose();
      geometriesToDispose.forEach((g) => g.dispose());
      stoneMat.dispose();
      darkRockMat.dispose();
      goldMat.dispose();
      crystalMat.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleZoom = (delta: number) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    const dir = new THREE.Vector3().subVectors(cam.position, ctrl.target);
    const nextDist = THREE.MathUtils.clamp(dir.length() + delta, 2.6, 7.5);
    dir.setLength(nextDist);
    cam.position.copy(ctrl.target).add(dir);
    ctrl.update();
  };

  const handleResetView = () => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    cam.position.set(0, 1.5, 4.6);
    ctrl.target.set(0, 0, 0);
    ctrl.update();
  };

  const spec = ARTIFACTS[activeArtifact];

  return (
    <div className="bg-[#090E23]/92 border border-white/15 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
      {/* 3D Interactive Canvas Area */}
      <div className="md:col-span-7 relative min-h-[280px] sm:min-h-[320px] bg-gradient-to-b from-[#13193C]/50 to-[#060916]/80">
        {webglUnavailable ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <p className="font-display text-2xl text-[#FFD27D]">{spec.name}</p>
            <p className="mt-2 text-xs text-[#C6C0D8] max-w-xs">
              Interactive 3D view is unavailable on this browser context. Select artifact parts on
              the right to inspect their lore.
            </p>
          </div>
        ) : (
          <div
            ref={mountRef}
            data-cursor="interactive"
            aria-label={`Interactive 3D model of ${spec.name}. Drag to rotate and scroll or use controls to zoom.`}
            className="w-full h-full min-h-[280px] sm:min-h-[320px] cursor-grab active:cursor-grabbing"
          />
        )}

        {/* Zoom & Reset Camera Controls */}
        {!webglUnavailable && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleZoom(-0.7)}
              aria-label="Zoom in 3D object"
              className="w-10 h-10 flex items-center justify-center rounded-md bg-[#0B1028]/90 border border-white/15 text-[#E8E2D5] hover:text-[#FFD27D] hover:border-[#E5A94C]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.7)}
              aria-label="Zoom out 3D object"
              className="w-10 h-10 flex items-center justify-center rounded-md bg-[#0B1028]/90 border border-white/15 text-[#E8E2D5] hover:text-[#FFD27D] hover:border-[#E5A94C]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset 3D camera"
              className="w-10 h-10 flex items-center justify-center rounded-md bg-[#0B1028]/90 border border-white/15 text-[#E8E2D5] hover:text-[#FFD27D] hover:border-[#E5A94C]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info Panel & Artifact Selector */}
      <div className="md:col-span-5 p-5 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
        <div>
          <p
            className={`text-[11px] tracking-[0.2em] uppercase font-medium ${
              isDigital ? 'text-[#5CE1E6]' : 'text-[#E5A94C]'
            }`}
          >
            3D Artifact Inspector
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-[#FFF8EC]">
            {spec.name}
          </h3>
          <p className="mt-1 text-xs text-[#A8A2BE]">{spec.materialNote}</p>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p
              className={`text-xs font-medium ${
                isDigital ? 'text-[#7CE8FF]' : 'text-[#FFD27D]'
              }`}
            >
              {selectedPart.title}
            </p>
            <p className="mt-1.5 text-sm text-[#D6D0E4] leading-relaxed">{selectedPart.detail}</p>
            <p className="mt-2.5 text-[11px] text-[#9E97B5]">
              Drag to rotate · Scroll to zoom · Click 3D parts to inspect
            </p>
          </div>
        </div>

        {/* Artifact Switcher */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {(['island', 'obelisk', 'astrolabe'] as ArtifactId[]).map((id) => {
            const active = activeArtifact === id;
            const labels: Record<ArtifactId, string> = {
              island: 'Sky Island',
              obelisk: 'Monolith',
              astrolabe: 'Astrolabe',
            };
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveArtifact(id);
                  chimeRef.current?.(523.25);
                }}
                className={`min-h-[42px] px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A94C] ${
                  active
                    ? isDigital
                      ? 'bg-[#5CE1E6]/20 border-[#5CE1E6] text-[#9AF4FF]'
                      : 'bg-[#E5A94C]/20 border-[#E5A94C] text-[#FFD27D]'
                    : 'bg-white/5 border-white/10 text-[#C6C0D8] hover:text-white'
                }`}
              >
                {labels[id]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
