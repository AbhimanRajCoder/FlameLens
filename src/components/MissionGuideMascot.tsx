import { useEffect, useRef, useState } from 'react';
import type { BufferGeometry, Material, Object3D, Texture } from 'three';
import { useReducedMotion } from '../lib/useReducedMotion';

const MODEL_URL = `${import.meta.env.BASE_URL}models/mission-guide-robocat.glb`;

function MascotFallback() {
  return <svg className="md-mascot-fallback" viewBox="0 0 240 250" aria-hidden="true" focusable="false">
    <ellipse cx="120" cy="226" rx="58" ry="9" fill="rgba(85,193,218,.13)"/>
    <path d="m77 65 4-35 32 24m18 0 34-24 1 40" fill="#8baab9" stroke="#c4e9ef" strokeWidth="3" strokeLinejoin="round"/>
    <rect x="64" y="50" width="112" height="91" rx="38" fill="#b5c9cf" stroke="#e0f3f5" strokeWidth="3"/>
    <rect x="75" y="69" width="90" height="56" rx="24" fill="#091521" stroke="#58d1e5" strokeWidth="2"/>
    <ellipse cx="100" cy="97" rx="7" ry="10" fill="#7ee6f0"/><ellipse cx="140" cy="97" rx="7" ry="10" fill="#7ee6f0"/>
    <path d="M110 112q10 8 20 0" fill="none" stroke="#7ee6f0" strokeWidth="2" strokeLinecap="round"/>
    <path d="M78 145h84l11 40H67z" fill="#819aa6" stroke="#c4e9ef" strokeWidth="3" strokeLinejoin="round"/>
    <rect x="99" y="157" width="42" height="20" rx="8" fill="#0b1b28" stroke="#58d1e5" strokeWidth="2"/>
    <circle cx="120" cy="167" r="4" fill="#8df2ff"/>
    <path d="m76 148-20 28m108-28 18 25M90 183l-4 31m63-31 5 31" fill="none" stroke="#c4e9ef" strokeWidth="10" strokeLinecap="round"/>
    <path d="M55 177h-9m139-4 8-4" stroke="#f2bb65" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}

/** A locally bundled, rigged CC0 guide bot. It pauses off-screen and falls back to SVG. */
export function MissionGuideMascot({ action = 'Idle' }: { action?: 'Idle' | 'Walk' | 'Special' }) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const playMotionRef = useRef<((name: 'Idle' | 'Walk' | 'Special') => void) | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    if (reduced || failed || !hostRef.current) return;
    const host = hostRef.current;
    let cancelled = false;
    let raf = 0;
    let cleanup: (() => void) | null = null;
    let renderer: { dispose(): void; domElement: HTMLCanvasElement } | undefined;
    let model: Object3D | null = null;

    (async () => {
      try {
        const probe = document.createElement('canvas');
        if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('WebGL unavailable');
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        if (cancelled) return;

        const webgl = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer = webgl;
        webgl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        webgl.outputColorSpace = THREE.SRGBColorSpace;
        webgl.toneMapping = THREE.ACESFilmicToneMapping;
        webgl.toneMappingExposure = 1.08;
        webgl.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(webgl.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, .01, 80);
        camera.position.set(0, 1.02, 4.75);
        camera.lookAt(0, .92, 0);
        scene.add(new THREE.HemisphereLight(0xb5d4e6, 0x101c25, 1.4));
        const key = new THREE.DirectionalLight(0xe4f4fa, 2.3);
        key.position.set(3, 5, 4);
        const rim = new THREE.DirectionalLight(0x55d2e8, 1.25);
        rim.position.set(-4, 2, -3);
        scene.add(key, rim);

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(MODEL_URL);
        if (cancelled) { webgl.dispose(); webgl.domElement.remove(); return; }
        setLoaded(true);
        model = gltf.scene;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 1.78 / (size.y || Math.max(size.x, size.z, 1));
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        const pivot = new THREE.Group();
        pivot.add(model);
        scene.add(pivot);

        const mixer = new THREE.AnimationMixer(model);
        const clip = (name: string) => THREE.AnimationClip.findByName(gltf.animations, name);
        const idle = clip('Idle');
        if (!idle) throw new Error('The GLB has no Idle clip');
        const idleAction = mixer.clipAction(idle);
        idleAction.setLoop(THREE.LoopRepeat, Infinity).play();
        const actionNames = ['Walk', 'Special'] as const;
        const actions = new Map<string, import('three').AnimationAction>();
        for (const name of actionNames) {
          const found = clip(name);
          if (found) actions.set(name, mixer.clipAction(found));
        }
        let removeFinishListener: (() => void) | null = null;
        const playMotion = (name: 'Idle' | 'Walk' | 'Special') => {
          const next = name === 'Idle' ? idleAction : actions.get(name);
          if (!next) return;
          removeFinishListener?.();
          removeFinishListener = null;
          if (name === 'Idle') {
            for (const action of actions.values()) action.fadeOut(.18);
            idleAction.reset().fadeIn(.22).play();
            return;
          }
          idleAction.fadeOut(.16);
          next.reset().setLoop(THREE.LoopOnce, 1);
          next.clampWhenFinished = true;
          next.fadeIn(.14).play();
          const onFinish = (event: { action: import('three').AnimationAction }) => {
            if (event.action !== next) return;
            mixer.removeEventListener('finished', onFinish);
            removeFinishListener = null;
            idleAction.reset().fadeIn(.2).play();
          };
          mixer.addEventListener('finished', onFinish);
          removeFinishListener = () => mixer.removeEventListener('finished', onFinish);
        };
        playMotionRef.current = playMotion;
        playMotion(actionRef.current);

        const resize = () => {
          const rect = host.getBoundingClientRect();
          webgl.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
          camera.aspect = rect.width / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);
        let inView = true;
        const io = new IntersectionObserver((entries) => { inView = entries.some((entry) => entry.isIntersecting); }, { threshold: .02 });
        io.observe(host);
        let last = performance.now();
        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          if (document.hidden || !inView) { last = now; return; }
          const dt = Math.min(.05, (now - last) / 1000);
          last = now;
          mixer.update(dt);
          pivot.position.y = Math.sin(now / 1000 * .75) * .025;
          pivot.rotation.y = Math.sin(now / 1000 * .3) * .06;
          webgl.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);
        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect(); io.disconnect();
          removeFinishListener?.();
          playMotionRef.current = null;
          mixer.stopAllAction(); mixer.uncacheRoot(model!);
          scene.traverse((object) => {
            const resource = object as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
            resource.geometry?.dispose();
            const mats = Array.isArray(resource.material) ? resource.material : resource.material ? [resource.material] : [];
            for (const mat of mats) { const map = (mat as Material & { map?: Texture | null }).map; map?.dispose(); mat.dispose(); }
          });
          webgl.dispose(); webgl.domElement.remove();
        };
      } catch {
        renderer?.dispose(); renderer?.domElement.remove();
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; cleanup?.(); cancelAnimationFrame(raf); };
  }, [failed, reduced]);

  useEffect(() => { playMotionRef.current?.(action); }, [action]);

  if (reduced || failed) return <MascotFallback />;
  return <div className="md-mascot-stage" ref={hostRef} aria-hidden="true">{loaded ? null : <MascotFallback />}</div>;
}
