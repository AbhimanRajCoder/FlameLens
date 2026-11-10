import { useEffect, useRef, useState } from 'react';
import { useInView } from '../lib/useInView';
import { useReducedMotion } from '../lib/useReducedMotion';
import type { ModelTrackId } from '../data/modelLab';

export interface MissionVisualResult {
  value: number | null;
  unit: string | null;
  label: string;
}

const labels: Record<ModelTrackId, { accessible: string; fallback: string }> = {
  extinction: { accessible: 'Fuel droplet between igniters inside a conceptual test chamber. The shell is illustrative and does not represent a measured flame.', fallback: 'FLEX droplet and igniter layout' },
  spread: { accessible: 'PMMA sample plate, airflow duct, and an illustrative flame-front marker. Front movement is a visual guide, not recorded footage.', fallback: 'BASS-II PMMA sample and airflow direction' },
  'soot-smoke': { accessible: 'Coflow burner and an illustrative diffusion-flame envelope. Its displayed length is controlled by the published smoke-point correlation when a batch has run.', fallback: 'SPICE burner, coflow, and length marker' },
};

function StaticBay({ trackId }: { trackId: ModelTrackId }) {
  return <div className={`mission-bay-static mission-bay-static-${trackId}`} aria-hidden="true">
    <div className="mission-static-chamber"><div className="mission-static-object"><i /><b /><em /></div></div>
    <div className="mission-static-baseline" />
    {trackId === 'spread' && <div className="mission-static-flow"><i /><i /><i /></div>}
  </div>;
}

/** Procedural instrument geometry: a teaching visualization, not a scanned NASA apparatus or mesh asset. */
export function MissionMeshBay({ trackId, result, runId }: { trackId: ModelTrackId; result: MissionVisualResult | null; runId: number }) {
  const { ref: visibleRef, inView } = useInView<HTMLDivElement>({ rootMargin: '180px', once: true });
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || !hostRef.current || webglFailed) return;
    const host = hostRef.current;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const probe = document.createElement('canvas');
        if (!probe.getContext('webgl2') && !probe.getContext('webgl')) throw new Error('WebGL unavailable');
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        host.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x060b10, 0.12);
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
        camera.position.set(3.1, 2.15, 4.45);
        const hemi = new THREE.HemisphereLight(0xcce9f1, 0x101820, 1.4);
        const keyLight = new THREE.DirectionalLight(0xe7f4f3, 2.4);
        keyLight.position.set(2.8, 4.2, 3.1);
        const coolRim = new THREE.PointLight(0x4bc6df, 15, 8);
        coolRim.position.set(-2, 1.6, -1.8);
        const warmRim = new THREE.PointLight(0xe98045, 8, 5);
        warmRim.position.set(0.3, 1.4, 2.2);
        scene.add(hemi, keyLight, coolRim, warmRim);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = false;
        controls.minDistance = 3.4;
        controls.maxDistance = 7.2;
        controls.target.set(0, 0.1, 0);
        controls.update();

        const mat = (color: number, roughness = 0.48, metalness = 0.18) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        const baseMat = mat(0x24313a, 0.62, 0.5);
        const bodyMat = mat(0x15232c, 0.38, 0.52);
        const sampleMat = mat(0x7a7262, 0.7, 0.05);
        const flameMat = new THREE.MeshStandardMaterial({ color: trackId === 'spread' ? 0xf2a75f : 0x80d7e2, emissive: trackId === 'spread' ? 0xb54b22 : 0x146d86, emissiveIntensity: 1.05, transparent: true, opacity: 0.75, roughness: 0.3, side: THREE.DoubleSide });
        const outlineMat = new THREE.LineBasicMaterial({ color: 0x558491, transparent: true, opacity: 0.42 });
        const apparatus = new THREE.Group();
        scene.add(apparatus);

        const addBox = (geometry: InstanceType<typeof THREE.BoxGeometry>, material: InstanceType<typeof THREE.MeshStandardMaterial>, position: [number, number, number]) => {
          const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); apparatus.add(mesh); return mesh;
        };
        const addCylinder = (radiusTop: number, radiusBottom: number, height: number, material: InstanceType<typeof THREE.MeshStandardMaterial>, position: [number, number, number], radial = 20) => {
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial), material); mesh.position.set(...position); apparatus.add(mesh); return mesh;
        };

        // Compact rig and observation duct, built from local primitives rather than a borrowed model.
        addBox(new THREE.BoxGeometry(2.55, 0.13, 1.65), baseMat, [0, -0.71, 0]);
        addBox(new THREE.BoxGeometry(0.16, 0.72, 0.16), bodyMat, [-0.97, -0.28, -0.55]);
        addBox(new THREE.BoxGeometry(0.16, 0.72, 0.16), bodyMat, [0.97, -0.28, -0.55]);
        const chamberGeometry = new THREE.BoxGeometry(2.12, 1.28, 0.92);
        apparatus.add(new THREE.LineSegments(new THREE.EdgesGeometry(chamberGeometry), outlineMat));
        const chamber = new THREE.Mesh(chamberGeometry, new THREE.MeshPhysicalMaterial({ color: 0x5596a0, transparent: true, opacity: 0.035, roughness: 0.16, metalness: 0.05, side: THREE.DoubleSide }));
        apparatus.add(chamber);
        const grid = new THREE.GridHelper(4.8, 24, 0x34525b, 0x182c35);
        grid.position.y = -0.79;
        scene.add(grid);

        let flame: InstanceType<typeof THREE.Mesh> | null = null;
        let frontMarker: InstanceType<typeof THREE.Mesh> | null = null;
        let shellMaterial: InstanceType<typeof THREE.MeshBasicMaterial> | null = null;

        if (trackId === 'extinction') {
          addCylinder(0.045, 0.055, 0.2, bodyMat, [0, -0.48, 0]);
          const electrodeMat = mat(0x9aa8ad, 0.36, 0.68);
          for (const side of [-1, 1]) {
            const electrode = addCylinder(0.018, 0.018, 0.72, electrodeMat, [side * 0.3, 0.18, 0.08], 10);
            electrode.rotation.z = Math.PI / 2;
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat(0xd0c7a5, 0.3, 0.55));
            tip.position.set(side * 0.09, 0.18, 0.08); apparatus.add(tip);
          }
          const droplet = new THREE.Mesh(new THREE.SphereGeometry(0.115, 28, 20), new THREE.MeshPhysicalMaterial({ color: 0x8ed5df, roughness: 0.08, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08 }));
          droplet.position.set(0, 0.18, 0.08); apparatus.add(droplet);
          shellMaterial = new THREE.MeshBasicMaterial({ color: 0x58bed0, wireframe: true, transparent: true, opacity: 0.12 });
          flame = new THREE.Mesh(new THREE.SphereGeometry(0.46, 30, 22), shellMaterial);
          flame.position.copy(droplet.position); apparatus.add(flame);
        } else if (trackId === 'spread') {
          addBox(new THREE.BoxGeometry(1.8, 0.095, 0.38), sampleMat, [0, -0.39, 0.05]);
          for (const z of [-0.28, 0.38]) addBox(new THREE.BoxGeometry(2.05, 0.04, 0.04), bodyMat, [0, -0.48, z]);
          const arrows = new THREE.Group();
          for (const y of [-0.08, 0.12, 0.32]) {
            const line = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.58, 8), mat(0x58c0d5, 0.4, 0.15));
            line.rotation.z = Math.PI / 2; line.position.set(-0.7, y, -0.34); arrows.add(line);
            const head = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 8), mat(0x78d4e2, 0.4, 0.1));
            head.rotation.z = -Math.PI / 2; head.position.set(-0.38, y, -0.34); arrows.add(head);
          }
          apparatus.add(arrows);
          const geometry = new THREE.ConeGeometry(0.18, 0.46, 12);
          geometry.rotateZ(-Math.PI / 2);
          flame = new THREE.Mesh(geometry, flameMat); flame.position.set(-0.57, -0.05, 0.05); apparatus.add(flame);
          frontMarker = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 12), new THREE.MeshBasicMaterial({ color: 0xf8d89d }));
          frontMarker.position.set(-0.34, -0.32, 0.05); apparatus.add(frontMarker);
        } else {
          const burner = addCylinder(0.1, 0.13, 0.3, bodyMat, [0, -0.53, 0.05], 24);
          burner.position.y = -0.53;
          addCylinder(0.07, 0.07, 0.04, mat(0x9ba9a9, 0.28, 0.72), [0, -0.36, 0.05], 24);
          const coflow = new THREE.Group();
          for (const x of [-0.48, -0.32, 0.32, 0.48]) {
            const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.86, 8), new THREE.MeshStandardMaterial({ color: 0x5799a5, roughness: 0.45, transparent: true, opacity: 0.5 }));
            pipe.position.set(x, 0.1, 0.05); coflow.add(pipe);
          }
          apparatus.add(coflow);
          const profile = [new THREE.Vector2(0, 0), new THREE.Vector2(0.09, 0.08), new THREE.Vector2(0.17, 0.25), new THREE.Vector2(0.16, 0.45), new THREE.Vector2(0.11, 0.65), new THREE.Vector2(0.055, 0.85), new THREE.Vector2(0, 0.98)];
          flame = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), flameMat);
          flame.position.set(0, -0.35, 0.05); apparatus.add(flame);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 8, 48), new THREE.MeshBasicMaterial({ color: 0xf1d4a2, transparent: true, opacity: 0.78 }));
          ring.position.set(0, 0.29, 0.05); apparatus.add(ring); frontMarker = ring;
        }

        const resize = () => {
          const rect = host.getBoundingClientRect();
          renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
          camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        resize();
        const observer = new ResizeObserver(resize); observer.observe(host);
        const currentValue = result?.value;
        const hasCompletedRun = runId > 0;
        const sootTarget = currentValue === null || currentValue === undefined ? 1 : THREE.MathUtils.clamp(0.48 + currentValue / 150, 0.55, 1.42);
        const startedAt = performance.now();
        let raf = 0;
        const renderLoop = (now: number) => {
          if (document.hidden) { raf = requestAnimationFrame(renderLoop); return; }
          const t = (now - startedAt) / 1000;
          if (!reducedMotion && trackId === 'extinction' && flame && shellMaterial) {
            flame.scale.setScalar(1 + Math.sin(t * 1.1) * 0.025);
            shellMaterial.opacity = hasCompletedRun ? 0.18 + Math.sin(t * 1.1) * 0.035 : 0.1;
          }
          if (!reducedMotion && hasCompletedRun && trackId === 'spread' && frontMarker && flame) {
            const progress = THREE.MathUtils.clamp(t / 2.2, 0, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            frontMarker.position.x = -0.34 + eased * 1.2;
            flame.position.x = -0.57 + eased * 1.2;
          }
          if (!reducedMotion && hasCompletedRun && trackId === 'soot-smoke' && flame) {
            const progress = THREE.MathUtils.clamp(t / 0.9, 0, 1);
            flame.scale.y = 0.22 + (sootTarget - 0.22) * (1 - Math.pow(1 - progress, 3));
          }
          controls.update();
          renderer.render(scene, camera);
          if (!reducedMotion) raf = requestAnimationFrame(renderLoop);
        };
        if (reducedMotion) {
          if (trackId === 'soot-smoke' && hasCompletedRun && flame) flame.scale.y = sootTarget;
          if (trackId === 'spread' && hasCompletedRun && frontMarker && flame) { frontMarker.position.x = 0.86; flame.position.x = 0.63; }
          renderer.render(scene, camera);
          controls.addEventListener('change', resize);
        } else raf = requestAnimationFrame(renderLoop);

        cleanup = () => {
          cancelAnimationFrame(raf);
          observer.disconnect();
          controls.removeEventListener('change', resize);
          controls.dispose();
          scene.traverse((object) => {
            const node = object as { geometry?: { dispose(): void }; material?: unknown };
            node.geometry?.dispose();
            const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
            for (const material of materials) (material as { dispose(): void }).dispose();
          });
          renderer.dispose(); renderer.domElement.remove();
        };
      } catch {
        if (!cancelled) setWebglFailed(true);
      }
    })();
    return () => { cancelled = true; cleanup?.(); };
  }, [inView, trackId, runId, result?.value, reducedMotion, webglFailed]);

  return <figure className="mission-bay-figure">
    <div className="mission-bay-stage" ref={visibleRef} role="img" aria-label={labels[trackId].accessible}>
      <StaticBay trackId={trackId} />
      {!webglFailed && <div className="mission-bay-canvas" ref={hostRef} aria-hidden="true" />}
      <span className="mission-bay-overlay mission-bay-overlay-top">PROCEDURAL INSTRUMENT VIEW</span>
      <span className="mission-bay-overlay mission-bay-overlay-bottom">{webglFailed ? 'STATIC DIAGRAM · WEBGL UNAVAILABLE' : inView ? 'DRAG TO INSPECT' : 'SCENE LOADS ON APPROACH'}</span>
    </div>
    <figcaption className="mission-bay-caption"><i />{labels[trackId].fallback} <span>· conceptual geometry</span></figcaption>
  </figure>;
}
