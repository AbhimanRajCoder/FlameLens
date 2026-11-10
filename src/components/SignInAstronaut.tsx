import { useEffect, useRef, useState } from 'react';
import type { Box3, Matrix4, Object3D } from 'three';
import { useReducedMotion } from '../lib/useReducedMotion';

const MODEL_URL = `${import.meta.env.BASE_URL}models/astronaut-signin.glb`;

function AstronautFallback() {
  return (
    <svg className="signin-astro-fallback" viewBox="0 0 220 280" aria-hidden="true" focusable="false">
      <ellipse cx="110" cy="252" rx="72" ry="14" fill="rgba(102,217,242,0.12)" />
      <rect x="78" y="34" width="64" height="58" rx="30" fill="#dcebf5" />
      <rect x="88" y="46" width="44" height="30" rx="15" fill="#0d1b2a" />
      <path d="M78 92c0 34 14 56 32 56s32-22 32-56H78z" fill="#e8f1fa" />
      <rect x="46" y="104" width="26" height="86" rx="13" fill="#c9dcea" transform="rotate(14 59 147)" />
      <rect x="148" y="104" width="26" height="86" rx="13" fill="#c9dcea" transform="rotate(-14 161 147)" />
      <rect x="66" y="196" width="30" height="52" rx="12" fill="#9fb8cc" />
      <rect x="124" y="196" width="30" height="52" rx="12" fill="#9fb8cc" />
      <circle cx="110" cy="238" r="7" fill="#f3b65a" />
    </svg>
  );
}

export function SignInAstronaut({ reduced: reducedProp }: { reduced?: boolean }) {
  const reducedMotion = useReducedMotion();
  const reduced = reducedProp ?? reducedMotion;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduced || failed) return;
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let raf = 0;
    let dispose: (() => void) | null = null;
    const partial: {
      renderer?: { dispose(): void; domElement: HTMLCanvasElement };
      draco?: { dispose(): void };
    } = {};

    const cleanupPartial = () => {
      partial.draco?.dispose();
      partial.draco = undefined;
      partial.renderer?.dispose();
      partial.renderer?.domElement.remove();
      partial.renderer = undefined;
    };

    (async () => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) throw new Error('WebGL unavailable');

        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
        const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);
        partial.renderer = renderer;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 50);
        camera.position.set(0, 0.92, 3.62);
        camera.lookAt(0, 0.88, 0);

        const hemi = new THREE.HemisphereLight(0x9fc4e0, 0x0b1220, 1.05);
        const key = new THREE.DirectionalLight(0xe8f1fa, 2.1);
        key.position.set(4, 5, 6);
        const rim = new THREE.DirectionalLight(0x66d9f2, 1.25);
        rim.position.set(-5, 2, -4);
        const warm = new THREE.DirectionalLight(0xf3b65a, 0.38);
        warm.position.set(-3, -2, 5);
        scene.add(hemi, key, rim, warm);

        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
        partial.draco = draco;
        loader.setDRACOLoader(draco);
        loader.setMeshoptDecoder(MeshoptDecoder);
        const gltf = await loader.loadAsync(MODEL_URL);
        if (cancelled) {
          cleanupPartial();
          return;
        }

        const model = gltf.scene;
        const box = new THREE.Box3();
        const mb = new THREE.Box3();
        model.updateMatrixWorld(true);
        model.traverse((object) => {
          const mesh = object as { isMesh?: boolean; visible?: boolean; geometry?: { computeBoundingBox(): void; boundingBox: Box3 | null }; matrixWorld: Matrix4 };
          if (mesh.isMesh && mesh.visible && mesh.geometry) {
            mesh.geometry.computeBoundingBox();
            if (mesh.geometry.boundingBox) {
              mb.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
              box.union(mb);
            }
          }
        });

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 2.05 / (size.y || 1);
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        const pivot = new THREE.Group();
        pivot.add(model);
        scene.add(pivot);
        scene.updateMatrixWorld(true);

        const mixer = new THREE.AnimationMixer(model);
        const findClip = (pattern: RegExp) => gltf.animations.find((clip) => pattern.test(clip.name));
        const waveClip = findClip(/wave/i);
        const idleClip = findClip(/idle|float/i) ?? gltf.animations[0];
        const greetingClip = waveClip ?? idleClip;
        const greetingAction = greetingClip ? mixer.clipAction(greetingClip) : null;
        let headBone: Object3D | null = null;
        model.traverse((object) => {
          const candidate = object as Object3D & { isBone?: boolean };
          if (!headBone && candidate.isBone && /head/i.test(candidate.name ?? '')) headBone = candidate;
        });
        const headVec = new THREE.Vector3();
        const headAnchor = () => {
          const parent = host.parentElement;
          if (!headBone || !parent) return null;
          const rect = host.getBoundingClientRect();
          if (!rect.width || !rect.height) return null;
          model.updateMatrixWorld(true);
          headBone.getWorldPosition(headVec);
          headVec.project(camera);
          const px = (headVec.x * 0.5 + 0.5) * rect.width;
          const py = (1 - (headVec.y * 0.5 + 0.5)) * rect.height;
          const pctX = (px / rect.width) * 100;
          const pctY = (py / rect.height) * 100;
          parent.style.setProperty('--astro-head-x', `${pctX}%`);
          parent.style.setProperty('--astro-head-y', `${pctY}%`);
          return { x: px, y: py, pctX, pctY };
        };
        const screenBox = () => {
          const rect = host.getBoundingClientRect();
          if (!rect.width || !rect.height) return null;
          model.updateMatrixWorld(true);
          const bounds = new THREE.Box3().setFromObject(model);
          const corners: Array<[number, number, number]> = [];
          for (const x of [bounds.min.x, bounds.max.x]) {
            for (const y of [bounds.min.y, bounds.max.y]) {
              for (const z of [bounds.min.z, bounds.max.z]) corners.push([x, y, z]);
            }
          }
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          let outside = 0;
          for (const [x, y, z] of corners) {
            const projected = new THREE.Vector3(x, y, z).project(camera);
            if (projected.z < -1 || projected.z > 1) outside += 1;
            const px = (projected.x * 0.5 + 0.5) * rect.width;
            const py = (1 - (projected.y * 0.5 + 0.5)) * rect.height;
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
          }
          return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            outsideCorners: outside,
            bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
            camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            host: { width: rect.width, height: rect.height },
          };
        };
        if (import.meta.env.DEV) {
          (window as unknown as Record<string, unknown>).__signinAstronaut = {
            clips: gltf.animations.map((clip) => ({ name: clip.name, duration: Number(clip.duration.toFixed(3)) })),
            wave: waveClip?.name ?? null,
            idle: idleClip?.name ?? null,
            playing: greetingClip?.name ?? null,
            screenBox,
            head: headAnchor,
          };
        }
        if (greetingAction) {
          greetingAction.setLoop(THREE.LoopRepeat, Infinity);
          greetingAction.play();
        }

        const resize = () => {
          const rect = host.getBoundingClientRect();
          renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
          camera.aspect = rect.width / Math.max(1, rect.height);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        let inView = true;
        const io = new IntersectionObserver(
          (entries) => {
            inView = entries.some((entry) => entry.isIntersecting);
          },
          { threshold: 0.05 },
        );
        io.observe(host);

        let last = performance.now();
        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          if (document.hidden || !inView) {
            last = now;
            return;
          }
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          const t = now / 1000;

          mixer.update(dt);
          pivot.position.y = Math.sin(t * 0.72) * 0.045;
          pivot.position.x = Math.sin(t * 0.42) * 0.018;
          pivot.rotation.z = Math.sin(t * 0.52) * 0.018;
          headAnchor();
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);

        dispose = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          mixer.stopAllAction();
          mixer.uncacheRoot(model);
          scene.traverse((object) => {
            const mesh = object as { geometry?: { dispose(): void }; material?: unknown };
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
            for (const material of materials) {
              const mat = material as { dispose(): void; map?: { dispose(): void } | null };
              mat.map?.dispose();
              mat.dispose();
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
        partial.renderer = undefined;
        partial.draco = undefined;
      } catch {
        cleanupPartial();
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      dispose?.();
      cleanupPartial();
    };
  }, [failed, reduced]);

  if (reduced || failed) {
    return <AstronautFallback />;
  }

  return <div className="signin-astro-stage" ref={hostRef} aria-hidden="true" />;
}
