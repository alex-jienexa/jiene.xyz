import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/** Анимируемое снаружи (GSAP) состояние сцены. */
export interface SceneState { pedestal: number; light: number; spin: number }

export function createHeroScene(canvas: HTMLCanvasElement, state: SceneState) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x02050d);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 1.5, 7); camera.lookAt(0, 0.9, 0);

  const mats: THREE.Material[] = [];
  const track = <M extends THREE.Material>(m: M) => { m.transparent = true; mats.push(m); return m; };

  const pedestal = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.75, 0.55, 64), track(new THREE.MeshStandardMaterial({ color: 0x0b1d3d, metalness: 0.85, roughness: 0.28 })));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.022, 16, 160), track(new THREE.MeshBasicMaterial({ color: 0x7fd0ff })));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.28;
  pedestal.add(base, ring); scene.add(pedestal);

  const cube = new THREE.Group();
  cube.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), track(new THREE.MeshPhysicalMaterial({ color: 0x2f7bff, emissive: 0x1550d0, emissiveIntensity: 0.8, roughness: 0.1, opacity: 0.3 }))));
  cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), track(new THREE.LineBasicMaterial({ color: 0x9fdcff }))));
  cube.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), track(new THREE.MeshBasicMaterial({ color: 0xffffff }))));
  scene.add(cube);

  scene.add(new THREE.AmbientLight(0x4466aa, 0.15));
  const point = new THREE.PointLight(0x4f9bff, 0, 30); point.position.set(0, 3, 2.5); scene.add(point);
  const rim = new THREE.PointLight(0xffffff, 0, 20); rim.position.set(-3, 1.5, -2); scene.add(rim);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.9, 0.7, 0.1);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  resize(); addEventListener("resize", resize);

  const clock = new THREE.Clock(); let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime, p = state.pedestal;
    pedestal.position.y = -2.2 + 2.2 * p;
    cube.position.y = 1.55 + Math.sin(t * 1.5) * 0.12 - (1 - p) * 1.5;
    cube.rotation.x += dt * state.spin * 1.3; cube.rotation.y += dt * state.spin * 1.9; cube.rotation.z += dt * state.spin * 0.7;
    for (const m of mats) { const o = (m as THREE.Material & { userData: { o?: number } }).userData; o.o ??= m.opacity; m.opacity = o.o! * p; }
    point.intensity = state.light * 60; rim.intensity = state.light * 25;
    bloom.strength = 0.5 + state.light * 0.9;
    composer.render();
  };
  // Не рендерим, пока канвас вне экрана: две WebGL-сцены одновременно — лишняя нагрузка.
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) { clock.getDelta(); frame(); } } else { cancelAnimationFrame(raf); raf = 0; }
  });
  io.observe(canvas);

  return () => {
    io.disconnect(); cancelAnimationFrame(raf); removeEventListener("resize", resize);
    scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); });
    mats.forEach((m) => m.dispose()); composer.dispose(); renderer.dispose();
  };
}
