import * as THREE from "three";
import { gsap } from "../lib/gsap";

const DARK = { bg: 0x040a16, wall: 0x0a1830, strip: 0x2f7bff, floor: 0x07122a, amb: 0.25 };
const LIGHT = { bg: 0xdbe8fb, wall: 0xf1f6ff, strip: 0x4f8dff, floor: 0xc9d9f2, amb: 1.4 };

function glyph(ch: string) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.font = '700 52px "JetBrains Mono", monospace'; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "#2f7bff"; g.shadowBlur = 10; g.fillStyle = "#bfe6ff"; g.fillText(ch, 32, 34);
  return new THREE.CanvasTexture(c);
}

/** Лаборатория + пьедестал. Состояние (предмет, тема) меняется через setStep(0|1|2). */
export function createLabScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(DARK.bg, 9, 24);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60); camera.position.set(0, 1.7, 7.4); camera.lookAt(0, 1.1, 0);

  const labGroup = new THREE.Group(); scene.add(labGroup);
  const wallMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.2, transparent: true });
  const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.7, transparent: true });
  const stripMat = new THREE.MeshBasicMaterial({ transparent: true });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), wallMat); wall.position.set(0, 4, -6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat); floor.rotation.x = -Math.PI / 2;
  labGroup.add(wall, floor);
  for (let i = -6; i <= 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, 7, 0.07), stripMat); s.position.set(i * 2.2, 3.5, -5.9); labGroup.add(s); }
  for (const x of [-8.5, -6.4, 6.4, 8.5]) { // шкафы с экранами по бокам
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.4, 1.3), wallMat); cab.position.set(x, 1.2, -4.6);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), stripMat); scr.position.set(x, 1.7, -3.94);
    labGroup.add(cab, scr);
  }

  const pedMat = new THREE.MeshStandardMaterial({ color: 0x0b1d3d, metalness: 0.85, roughness: 0.28 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.022, 16, 160), new THREE.MeshBasicMaterial({ color: 0x7fd0ff }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.28;
  const ped = new THREE.Group(); ped.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.75, 0.55, 64), pedMat), ring); ped.position.y = 0.27; scene.add(ped);

  const amb = new THREE.AmbientLight(0xffffff, 0.25);
  const key = new THREE.PointLight(0x4f9bff, 55, 30); key.position.set(0, 4, 3);
  scene.add(amb, key);

  // Предмет 1: информационный файл с 0 и 1 вокруг
  const file = new THREE.Group();
  const docMat = new THREE.MeshPhysicalMaterial({ color: 0x2f7bff, emissive: 0x1550d0, emissiveIntensity: 0.7, transparent: true, opacity: 0.35, roughness: 0.1 });
  file.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.06), docMat));
  file.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 1.2, 0.06)), new THREE.LineBasicMaterial({ color: 0x9fdcff })));
  for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: 0xbfe6ff })); l.position.set(-0.05, 0.3 - i * 0.2, 0.05); file.add(l); }
  const spriteMats = [glyph("0"), glyph("1")].map((map) => new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false }));
  const sprites = Array.from({ length: 32 }, (_, i) => {
    const sp = new THREE.Sprite(spriteMats[i % 2]); sp.scale.setScalar(0.28);
    sp.userData = { a: Math.random() * 6.28, r: 0.95 + Math.random() * 0.5, y: -0.7 + Math.random() * 1.4, s: 0.5 + Math.random() * 0.9 };
    file.add(sp); return sp;
  });

  // Предмет 2: физический объект
  const objMat = new THREE.MeshPhysicalMaterial({ color: 0x3d8bff, metalness: 0.9, roughness: 0.15, clearcoat: 1, emissive: 0x0a2a70 });
  const obj = new THREE.Mesh(new THREE.TorusKnotGeometry(0.42, 0.14, 160, 24), objMat);
  scene.add(file, obj);

  // Шаг 3: другое пространство — светлая цифровая площадка с порталами, парящими узлами и лучами.
  const space = new THREE.Group(); scene.add(space);
  const fades: Array<[THREE.Material, number]> = [];
  const sm = <M extends THREE.Material>(m: M, base: number): M => { m.transparent = true; fades.push([m, base]); return m; };
  const sFloor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), sm(new THREE.MeshStandardMaterial({ color: 0xe9f1ff, roughness: 0.15, metalness: 0.3 }), 1));
  sFloor.rotation.x = -Math.PI / 2; space.add(sFloor);
  const lineMat = sm(new THREE.MeshBasicMaterial({ color: 0x4f8dff }), 0.9);
  for (const r of [3, 5, 8, 12]) { const rg = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.03, 128), lineMat); rg.rotation.x = -Math.PI / 2; rg.position.y = 0.01; space.add(rg); }
  const portals = [-4.5, -8, -12].map((z, i) => { const p = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 0.6, 0.05, 16, 128), lineMat); p.position.set(0, 2.4 + i * 0.4, z); space.add(p); return p; });
  const edgeMat = sm(new THREE.LineBasicMaterial({ color: 0x2f6fe0 }), 1);
  const panelMat = sm(new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.45);
  const cubes = Array.from({ length: 14 }, () => {
    const sz = 0.35 + Math.random() * 0.6, g = new THREE.BoxGeometry(sz, sz, sz), m = new THREE.Group();
    m.add(new THREE.Mesh(g, panelMat), new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
    const a = Math.random() * 6.28, r = 3.5 + Math.random() * 6;
    m.position.set(Math.cos(a) * r, 0.8 + Math.random() * 4, -Math.abs(Math.sin(a)) * r - 1.5);
    m.userData = { y: m.position.y, p: Math.random() * 6.28 }; space.add(m); return m;
  });
  const beamMat = sm(new THREE.MeshBasicMaterial({ color: 0x7fb2ff }), 0.16);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12, 12, 1, true), beamMat); b.position.set(-9 + i * 3 + Math.random(), 6, -6 - Math.random() * 4); space.add(b); }
  const pos = new Float32Array(260 * 3).map((_, i) => (i % 3 === 0 ? (Math.random() - 0.5) * 24 : i % 3 === 1 ? Math.random() * 7 : Math.random() * 16 - 12));
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pGeo, sm(new THREE.PointsMaterial({ color: 0x2f7bff, size: 0.06 }), 0.9)); space.add(pts);
  space.visible = false;

  const st = { v0: 1, v1: 0, theme: 0 };
  const c = { a: new THREE.Color(), b: new THREE.Color() };
  const mix = (k: "bg" | "wall" | "strip" | "floor", t: number) => c.a.set(DARK[k]).lerp(c.b.set(LIGHT[k]), t);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  const clock = new THREE.Clock(); let raf = 0;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    const bg = mix("bg", st.theme).clone(); (scene.background as THREE.Color | null) ? (scene.background as THREE.Color).copy(bg) : (scene.background = bg);
    (scene.fog as THREE.Fog).color.copy(bg);
    const k = st.theme; // 0 — лаборатория, 1 — новое пространство (кросс-фейд материалов)
    [wallMat, floorMat, stripMat].forEach((m) => (m.opacity = 1 - k));
    fades.forEach(([m, b]) => (m.opacity = b * k));
    labGroup.visible = k < 0.99; space.visible = k > 0.01;
    camera.position.set(0, 1.7 - 0.35 * k, 7.4 - 0.9 * k); camera.lookAt(0, 1.1, 0);
    portals.forEach((p, i) => { p.rotation.x = Math.sin(t * 0.4 + i) * 0.5; p.rotation.y = Math.cos(t * 0.3 + i) * 0.5; });
    cubes.forEach((c) => { c.position.y = c.userData.y + Math.sin(t + c.userData.p) * 0.25; c.rotation.y += dt * 0.3; });
    pts.rotation.y += dt * 0.02;
    wallMat.color.copy(mix("wall", st.theme)); floorMat.color.copy(mix("floor", st.theme)); stripMat.color.copy(mix("strip", st.theme));
    amb.intensity = DARK.amb + (LIGHT.amb - DARK.amb) * st.theme;
    const bob = 1.75 + Math.sin(t * 1.5) * 0.1;
    file.position.y = bob; file.rotation.y += dt * 0.8; file.visible = st.v0 > 0.01; file.scale.setScalar(Math.max(st.v0, 1e-4));
    spriteMats.forEach((m) => (m.opacity = st.v0));
    sprites.forEach((s) => { const u = s.userData; u.a += dt * u.s; s.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(u.a * 2) * 0.08, Math.sin(u.a) * u.r); });
    obj.position.y = bob; obj.rotation.x += dt * 0.5; obj.rotation.y += dt * 0.9; obj.visible = st.v1 > 0.01; obj.scale.setScalar(Math.max(st.v1, 1e-4));
    renderer.render(scene, camera);
  };
  // Не рендерим, пока канвас вне экрана: две WebGL-сцены одновременно — лишняя нагрузка.
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) { clock.getDelta(); frame(); } } else { cancelAnimationFrame(raf); raf = 0; }
  });
  io.observe(canvas);

  return {
    setStep(i: number) { gsap.to(st, { v0: i === 0 ? 1 : 0, v1: i === 1 ? 1 : 0, theme: i === 2 ? 1 : 0, duration: 1, ease: "power2.inOut", overwrite: true }); },
    dispose() {
      io.disconnect(); cancelAnimationFrame(raf); ro.disconnect(); gsap.killTweensOf(st);
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      [wallMat, floorMat, stripMat, pedMat, docMat, objMat, ...spriteMats, ...fades.map(([m]) => m)].forEach((m) => { (m as THREE.SpriteMaterial).map?.dispose(); m.dispose(); });
      renderer.dispose();
    },
  };
}
