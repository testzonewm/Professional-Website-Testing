import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  computeSceneCrossfade,
  interpolateKoiPose,
  type KoiPose,
  type SectionAnchor,
} from '../utils/nectarlineMath';
import {
  detectSoftwareGl,
  ensureSharedPointerListeners,
  sharedPointer,
} from '../utils/webglDetect';

interface SceneBackdropProps {
  onNavScrolledChange: (scrolled: boolean) => void;
}

const VIDEO_ASPECT = 1276 / 720;

export const SceneBackdrop: React.FC<SceneBackdropProps> = ({ onNavScrolledChange }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const violetRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pondCanvasRef = useRef<HTMLCanvasElement>(null);
  const koiCanvasRef = useRef<HTMLCanvasElement>(null);
  const navCallbackRef = useRef(onNavScrolledChange);
  navCallbackRef.current = onNavScrolledChange;

  useEffect(() => {
    ensureSharedPointerListeners();
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareGl();

    let disposed = false;
    let videoBlobUrl: string | null = null;
    let videoReadyOnce = false;
    let lastShouldPlay = true;

    // --- Helper: Compute Section Anchors ---
    const getEndTop = (): number => {
      const endEl = document.getElementById('end');
      return endEl ? endEl.getBoundingClientRect().top + window.scrollY : 4200;
    };

    const getSectionAnchors = (): SectionAnchor[] => {
      const h = Math.max(1, window.innerHeight);
      const studioEl = document.getElementById('studio');
      const dashEl = document.getElementById('dash');
      const packsEl = document.getElementById('packs');
      const usesEl = document.getElementById('uses');
      const endEl = document.getElementById('end');

      const absTop = (el: HTMLElement | null, fallback: number) =>
        el ? el.getBoundingClientRect().top + window.scrollY : fallback;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      const dashTop = absTop(dashEl, h * 1.8);
      const dashHeight = dashEl ? dashEl.offsetHeight : 600;

      return [
        { key: 'hero', scrollPos: 0 },
        { key: 'statement', scrollPos: absTop(studioEl, h) + 0.2 * h },
        { key: 'dash', scrollPos: dashTop + dashHeight * 0.5 - 0.5 * h },
        { key: 'packs', scrollPos: absTop(packsEl, h * 2.8) + 0.3 * h },
        { key: 'uses', scrollPos: absTop(usesEl, h * 3.8) + 0.3 * h },
        { key: 'end', scrollPos: Math.min(absTop(endEl, maxScroll), maxScroll) },
      ];
    };

    // --- Scroll Crossfade ---
    let lastNavScrolled = false;
    const applyCrossfade = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      const cf = computeSceneCrossfade(y, h, getEndTop());

      if (dayRef.current) {
        dayRef.current.style.opacity = cf.dayOpacity.toFixed(4);
        dayRef.current.style.transform = `scale(${cf.dayScale.toFixed(5)}) translateY(${cf.dayTranslateY.toFixed(2)}px)`;
      }
      if (violetRef.current) {
        violetRef.current.style.opacity = cf.violetOpacity.toFixed(4);
      }
      if (nightRef.current) {
        nightRef.current.style.opacity = cf.nightOpacity.toFixed(4);
      }

      if (cf.navScrolled !== lastNavScrolled) {
        lastNavScrolled = cf.navScrolled;
        navCallbackRef.current(cf.navScrolled);
      }

      lastShouldPlay = cf.videoShouldPlay;
      const vid = videoRef.current;
      if (vid && !isReduced && vid.src) {
        if (cf.videoShouldPlay && vid.paused) {
          vid.play().catch(() => {});
        } else if (!cf.videoShouldPlay && !vid.paused) {
          vid.pause();
        }
      }
    };

    applyCrossfade();

    // --- Video & WebGL1 Ripple Lens Setup ---
    const vid = videoRef.current;
    const pondCanvas = pondCanvasRef.current;
    let gl1: WebGLRenderingContext | null = null;
    let pondRaf = 0;
    let pondTex: WebGLTexture | null = null;
    let pondProg: WebGLProgram | null = null;
    let pondBuf: WebGLBuffer | null = null;

    const enableFallbackVideo = () => {
      if (vid) vid.classList.add('fallback');
      if (pondCanvas) pondCanvas.style.display = 'none';
    };

    if (!isReduced && vid && pondCanvas) {
      // Fetch local mp4 into an object URL so offline Service Worker cache never hits partial 206 range issues
      fetch('/assets/pond-loop.mp4')
        .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('mp4 fetch failed'))))
        .then((blob) => {
          if (disposed) return;
          videoBlobUrl = URL.createObjectURL(blob);
          vid.src = videoBlobUrl;
          if (lastShouldPlay) {
            vid.play().catch(() => {});
          }
        })
        .catch(() => {
          if (disposed) return;
          vid.src = '/assets/pond-loop.mp4';
          if (lastShouldPlay) {
            vid.play().catch(() => {});
          }
        });

      const onPlaying = () => {
        videoReadyOnce = true;
        pondCanvas.classList.add('ready');
        sceneRef.current?.setAttribute('data-pond-ready', 'true');
      };
      vid.addEventListener('playing', onPlaying, { once: true });

      try {
        gl1 = pondCanvas.getContext('webgl', {
          alpha: false,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
        });
      } catch {
        gl1 = null;
      }

      if (!gl1) {
        enableFallbackVideo();
      } else {
        const vsSrc = `
          attribute vec2 aPos;
          varying vec2 vUv;
          void main() {
            vUv = aPos * 0.5 + 0.5;
            gl_Position = vec4(aPos, 0.0, 1.0);
          }
        `;
        const fsSrc = `
          precision mediump float;
          varying vec2 vUv;
          uniform sampler2D uTex;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uPresence;
          uniform vec2 uScale;
          uniform vec2 uTilt;

          vec2 coverUv(vec2 uv) {
            return clamp((uv - 0.5) * uScale + 0.5 + uTilt, 0.001, 0.999);
          }

          void main() {
            float dist = distance(vUv, uMouse);
            float ripple = sin(dist * 20.0 - uTime * 5.0) * 0.006;
            float strength = smoothstep(0.2, 0.0, dist) * uPresence;
            vec2 offset = normalize(vUv - uMouse + 1e-5) * ripple * strength;

            vec2 uvR = coverUv(vUv + offset + vec2(0.005, 0.0) * strength);
            vec2 uvG = coverUv(vUv + offset);
            vec2 uvB = coverUv(vUv + offset - vec2(0.005, 0.0) * strength);

            float r = texture2D(uTex, uvR).r;
            float g = texture2D(uTex, uvG).g;
            float b = texture2D(uTex, uvB).b;
            gl_FragColor = vec4(r, g, b, 1.0);
          }
        `;

        const compileShader = (type: number, src: string) => {
          const sh = gl1!.createShader(type);
          if (!sh) return null;
          gl1!.shaderSource(sh, src);
          gl1!.compileShader(sh);
          if (!gl1!.getShaderParameter(sh, gl1!.COMPILE_STATUS)) {
            gl1!.deleteShader(sh);
            return null;
          }
          return sh;
        };

        const vs = compileShader(gl1.VERTEX_SHADER, vsSrc);
        const fs = compileShader(gl1.FRAGMENT_SHADER, fsSrc);
        pondProg = gl1.createProgram();
        if (vs && fs && pondProg) {
          gl1.attachShader(pondProg, vs);
          gl1.attachShader(pondProg, fs);
          gl1.linkProgram(pondProg);
          gl1.deleteShader(vs);
          gl1.deleteShader(fs);
        }

        if (!pondProg || !gl1.getProgramParameter(pondProg, gl1.LINK_STATUS)) {
          enableFallbackVideo();
          gl1 = null;
        } else {
          gl1.useProgram(pondProg);
          pondBuf = gl1.createBuffer();
          gl1.bindBuffer(gl1.ARRAY_BUFFER, pondBuf);
          gl1.bufferData(
            gl1.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl1.STATIC_DRAW,
          );
          const loc = gl1.getAttribLocation(pondProg, 'aPos');
          gl1.enableVertexAttribArray(loc);
          gl1.vertexAttribPointer(loc, 2, gl1.FLOAT, false, 0, 0);

          pondTex = gl1.createTexture();
          gl1.bindTexture(gl1.TEXTURE_2D, pondTex);
          gl1.pixelStorei(gl1.UNPACK_FLIP_Y_WEBGL, 1);
          gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_WRAP_S, gl1.CLAMP_TO_EDGE);
          gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_WRAP_T, gl1.CLAMP_TO_EDGE);
          gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_MIN_FILTER, gl1.LINEAR);
          gl1.texParameteri(gl1.TEXTURE_2D, gl1.TEXTURE_MAG_FILTER, gl1.LINEAR);

          const uTexLoc = gl1.getUniformLocation(pondProg, 'uTex');
          const uTimeLoc = gl1.getUniformLocation(pondProg, 'uTime');
          const uMouseLoc = gl1.getUniformLocation(pondProg, 'uMouse');
          const uPresenceLoc = gl1.getUniformLocation(pondProg, 'uPresence');
          const uScaleLoc = gl1.getUniformLocation(pondProg, 'uScale');
          const uTiltLoc = gl1.getUniformLocation(pondProg, 'uTilt');
          gl1.uniform1i(uTexLoc, 0);

          const resizePond = () => {
            if (!gl1 || !pondCanvas) return;
            const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
            const w = Math.max(1, Math.floor(window.innerWidth * dpr));
            const h = Math.max(1, Math.floor(window.innerHeight * dpr));
            if (pondCanvas.width !== w || pondCanvas.height !== h) {
              pondCanvas.width = w;
              pondCanvas.height = h;
              gl1.viewport(0, 0, w, h);
            }
          };
          resizePond();
          window.addEventListener('resize', resizePond);

          const startTs = performance.now();
          let lastPondTs = startTs;
          let presence = 0;
          let curMouseX = 0.5;
          let curMouseY = 0.5;
          let curTx = 0;
          let curTy = 0;

          const drawPond = (now: number) => {
            if (disposed || !gl1 || !pondCanvas) return;
            const dt = Math.min(0.05, Math.max(0.001, (now - lastPondTs) / 1000));
            lastPondTs = now;

            const kPresence = 1 - Math.exp(-6 * dt);
            presence += ((sharedPointer.inside ? 1 : 0) - presence) * kPresence;
            if (sharedPointer.inside) {
              curMouseX = sharedPointer.u;
              curMouseY = sharedPointer.v;
            }
            const kTilt = 1 - Math.exp(-dt / 0.1);
            curTx += (sharedPointer.tx - curTx) * kTilt;
            curTy += (sharedPointer.ty - curTy) * kTilt;

            if (videoReadyOnce && !vid.paused && vid.readyState >= 2 && lastShouldPlay) {
              const A = pondCanvas.width / Math.max(1, pondCanvas.height);
              const V = VIDEO_ASPECT;
              const z = 0.975;
              const sx = (A > V ? 1 : A / V) * z;
              const sy = (A > V ? V / A : 1) * z;

              gl1.bindTexture(gl1.TEXTURE_2D, pondTex);
              gl1.texImage2D(gl1.TEXTURE_2D, 0, gl1.RGB, gl1.RGB, gl1.UNSIGNED_BYTE, vid);

              gl1.uniform1f(uTimeLoc, (now - startTs) / 1000);
              gl1.uniform2f(uMouseLoc, curMouseX, curMouseY);
              gl1.uniform1f(uPresenceLoc, presence);
              gl1.uniform2f(uScaleLoc, sx, sy);
              gl1.uniform2f(uTiltLoc, curTx * 0.009 * sx, curTy * 0.009 * sy);

              gl1.drawArrays(gl1.TRIANGLES, 0, 6);
            }

            pondRaf = requestAnimationFrame(drawPond);
          };

          pondRaf = requestAnimationFrame(drawPond);

          // Store cleanup hook on window listener
          (pondCanvas as unknown as { _cleanupResize?: () => void })._cleanupResize = () => {
            window.removeEventListener('resize', resizePond);
          };
        }
      }
    }

    // --- 3D Koi Setup (Three.js 0.170.0) ---
    const koiCanvas = koiCanvasRef.current;
    let renderer: THREE.WebGLRenderer | null = null;
    let pmremEnv: THREE.Texture | null = null;
    let koiLoopId = 0;
    let koiRenderBusy = false;
    let koiRenderDirty = false;
    let koiMaterial: THREE.MeshPhysicalMaterial | null = null;
    let loadedKoiRoot: THREE.Object3D | null = null;

    const cleanupKoiResources = () => {
      if (loadedKoiRoot) {
        loadedKoiRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            m.geometry?.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => mat.dispose());
            } else {
              m.material?.dispose();
            }
          }
        });
      }
      pmremEnv?.dispose();
      renderer?.dispose();
    };

    if (koiCanvas) {
      renderer = new THREE.WebGLRenderer({
        canvas: koiCanvas,
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight, false);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      pmremEnv = pmrem.fromScene(roomEnv, 0.04).texture;
      scene.environment = pmremEnv;
      roomEnv.dispose();
      pmrem.dispose();

      const hemi = new THREE.HemisphereLight(0xc6b2ff, 0x2a1c80, 0.7);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffc8f0, 1.6);
      keyLight.position.set(3, 5, 6);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x8c7bff, 2.8);
      rimLight.position.set(-5, -1, -4);
      scene.add(rimLight);

      const camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / Math.max(1, window.innerHeight),
        0.1,
        100,
      );
      camera.position.set(0, 0, 10);

      const rig = new THREE.Group();
      const body = new THREE.Group();
      rig.add(body);
      scene.add(rig);

      const swimUniforms = {
        uSwimTime: { value: 0 },
        uSwimFreq: { value: 5.2 },
        uSwimSpeed: { value: 6.5 },
        uSwimAmp: { value: 0.075 },
      };

      let anchors = getSectionAnchors();
      const currentPose: KoiPose = interpolateKoiPose(
        window.scrollY,
        anchors,
        window.innerWidth <= 820,
      );

      let lastScrollY = window.scrollY;
      let scrollVel = 0;

      const updateFrustum = () => {
        const fh = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * 10;
        const fw = fh * camera.aspect;
        return { fw, fh };
      };

      const applyPoseToScene = (pose: KoiPose, elapsed: number) => {
        const { fw, fh } = updateFrustum();
        const bob = isReduced ? 0 : Math.sin(0.9 * elapsed) * 0.018;
        const wobbleRoll = isReduced ? 0 : Math.sin(0.7 * elapsed) * 0.04;
        const wobbleYaw = isReduced ? 0 : Math.sin(0.5 * elapsed) * 0.06;

        rig.position.set(pose.x * (fw / 2), (pose.y + bob) * (fh / 2), 0);
        rig.rotation.order = 'XYZ';
        rig.rotation.set(pose.roll + wobbleRoll, pose.yaw + wobbleYaw, pose.pitch);
        body.scale.setScalar(pose.s * fh);
      };

      const afterDraw = (cb: () => void) => {
        if (disposed || !renderer) return;
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) return;
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              koiLoopId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              koiLoopId = window.setTimeout(cb, 80);
            }
          };
          koiLoopId = window.setTimeout(poll, 5);
        } else {
          koiLoopId = window.setTimeout(cb, 80);
        }
      };

      const requestReducedRender = () => {
        if (disposed || !renderer) return;
        if (koiRenderBusy) {
          koiRenderDirty = true;
          return;
        }
        koiRenderBusy = true;
        koiLoopId = requestAnimationFrame(() => {
          if (disposed || !renderer) return;
          koiRenderDirty = false;
          const target = interpolateKoiPose(
            window.scrollY,
            anchors,
            window.innerWidth <= 820,
          );
          Object.assign(currentPose, target);
          applyPoseToScene(currentPose, 0);
          renderer.render(scene, camera);
          const done = () => {
            koiRenderBusy = false;
            if (koiRenderDirty) requestReducedRender();
          };
          if (isSoftwareGl) afterDraw(done);
          else done();
        });
      };

      // Load local GLB model
      const loader = new GLTFLoader();
      loader.load(
        '/assets/koi.glb',
        (gltf) => {
          if (disposed) return;
          const root = gltf.scene;
          root.updateMatrixWorld(true);

          const meshes: THREE.Mesh[] = [];
          root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              meshes.push(child as THREE.Mesh);
            }
          });

          let baseTex: THREE.Texture | null = null;
          const bakedGeometries: THREE.BufferGeometry[] = [];
          const box = new THREE.Box3();

          meshes.forEach((m) => {
            const origMat = Array.isArray(m.material) ? m.material[0] : m.material;
            const stdMat = origMat as THREE.MeshStandardMaterial | undefined;
            if (!baseTex && stdMat?.map) {
              baseTex = stdMat.map;
              baseTex.colorSpace = THREE.SRGBColorSpace;
            }
            const geom = m.geometry.clone();
            m.updateWorldMatrix(true, false);
            geom.applyMatrix4(m.matrixWorld);
            bakedGeometries.push(geom);
            geom.computeBoundingBox();
            if (geom.boundingBox) box.union(geom.boundingBox);
          });

          const size = new THREE.Vector3();
          box.getSize(size);

          // Longest axis becomes +X
          const rotMat = new THREE.Matrix4();
          if (size.z >= size.x && size.z >= size.y) {
            rotMat.makeRotationY(Math.PI / 2);
          } else if (size.y >= size.x && size.y >= size.z) {
            rotMat.makeRotationZ(-Math.PI / 2);
          }
          const flipY = new THREE.Matrix4().makeRotationY(Math.PI);
          rotMat.premultiply(flipY);

          const normBox = new THREE.Box3();
          bakedGeometries.forEach((geom) => {
            geom.applyMatrix4(rotMat);
            geom.computeBoundingBox();
            if (geom.boundingBox) normBox.union(geom.boundingBox);
          });

          const center = new THREE.Vector3();
          const normSize = new THREE.Vector3();
          normBox.getCenter(center);
          normBox.getSize(normSize);
          const maxLen = Math.max(normSize.x, normSize.y, normSize.z, 1e-4);
          const scaleInv = 1 / maxLen;

          koiMaterial = new THREE.MeshPhysicalMaterial({
            color: baseTex ? 0xc9b4ff : 0xb8a4ff,
            map: baseTex,
            emissiveMap: baseTex,
            roughness: 0.18,
            metalness: 0.15,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            iridescence: 0.85,
            iridescenceIOR: 1.4,
            iridescenceThicknessRange: [260, 700],
            emissive: new THREE.Color(0x7a46ff),
            emissiveIntensity: 0.55,
            sheen: 0.25,
            sheenColor: new THREE.Color(0xff9ce6),
            transparent: true,
            opacity: 0.95,
            envMapIntensity: 0.75,
            side: THREE.DoubleSide,
          });

          koiMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uSwimTime = swimUniforms.uSwimTime;
            shader.uniforms.uSwimFreq = swimUniforms.uSwimFreq;
            shader.uniforms.uSwimSpeed = swimUniforms.uSwimSpeed;
            shader.uniforms.uSwimAmp = swimUniforms.uSwimAmp;

            shader.vertexShader =
              `uniform float uSwimTime;\nuniform float uSwimFreq;\nuniform float uSwimSpeed;\nuniform float uSwimAmp;\n` +
              shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
               float tail = clamp((0.32 - position.x) / 0.82, 0.0, 1.0);
               transformed.z += sin(position.x * uSwimFreq - uSwimTime * uSwimSpeed) * uSwimAmp * (0.15 + 1.6 * tail * tail);
               transformed.y += cos(position.x * uSwimFreq * 0.5 - uSwimTime * uSwimSpeed * 0.5) * uSwimAmp * 0.12 * tail;`,
            );
          };

          const koiGroup = new THREE.Group();
          bakedGeometries.forEach((geom) => {
            geom.translate(-center.x, -center.y, -center.z);
            geom.scale(scaleInv, scaleInv, scaleInv);
            geom.computeVertexNormals();
            const mesh = new THREE.Mesh(geom, koiMaterial!);
            koiGroup.add(mesh);
          });

          // Dispose original untouched geometries/materials
          meshes.forEach((m) => {
            m.geometry?.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => mat.dispose());
            } else {
              m.material?.dispose();
            }
          });

          loadedKoiRoot = koiGroup;
          body.add(koiGroup);
          sceneRef.current?.setAttribute('data-koi-ready', 'true');

          if (isReduced) {
            requestReducedRender();
          }
        },
        undefined,
        () => {
          sceneRef.current?.setAttribute('data-koi-ready', 'error');
        },
      );

      let lastTickTs = performance.now();
      let elapsed = 0;

      const tickKoi = () => {
        if (disposed || !renderer) return;
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTickTs) / 1000));
        lastTickTs = now;
        elapsed += dt;

        // Scroll velocity
        const sy = window.scrollY;
        const instantVel = (sy - lastScrollY) / dt;
        lastScrollY = sy;
        scrollVel += (instantVel - scrollVel) * 0.1;
        const speedUp = Math.min(Math.abs(scrollVel) / 1800, 1.4);

        swimUniforms.uSwimTime.value += dt * (1 + speedUp);
        swimUniforms.uSwimAmp.value = 0.07 + 0.03 * speedUp;

        const target = interpolateKoiPose(sy, anchors, window.innerWidth <= 820);
        const kPose = 1 - Math.exp(-3.2 * dt);
        currentPose.x += (target.x - currentPose.x) * kPose;
        currentPose.y += (target.y - currentPose.y) * kPose;
        currentPose.s += (target.s - currentPose.s) * kPose;
        currentPose.yaw += (target.yaw - currentPose.yaw) * kPose;
        currentPose.pitch += (target.pitch - currentPose.pitch) * kPose;
        currentPose.roll += (target.roll - currentPose.roll) * kPose;

        applyPoseToScene(currentPose, elapsed);

        // Pointer camera tilt (1 degree max)
        const kCam = 1 - Math.exp(-dt / 0.1);
        const targetCamY = -sharedPointer.tx * 0.01745;
        const targetCamX = sharedPointer.ty * 0.01745;
        camera.rotation.y += (targetCamY - camera.rotation.y) * kCam;
        camera.rotation.x += (targetCamX - camera.rotation.x) * kCam;

        renderer.render(scene, camera);

        if (isSoftwareGl) {
          afterDraw(tickKoi);
        } else {
          koiLoopId = requestAnimationFrame(tickKoi);
        }
      };

      const onResize = () => {
        if (!renderer) return;
        const w = window.innerWidth;
        const h = Math.max(1, window.innerHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        anchors = getSectionAnchors();
        applyCrossfade();
        if (isReduced) requestReducedRender();
      };

      const onScroll = () => {
        applyCrossfade();
        if (isReduced) requestReducedRender();
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('scroll', onScroll, { passive: true });

      // Recompute anchors once layout/fonts settle
      const anchorTimer = window.setTimeout(() => {
        anchors = getSectionAnchors();
        applyCrossfade();
        if (isReduced) requestReducedRender();
      }, 450);

      if (isReduced) {
        requestReducedRender();
      } else {
        koiLoopId = requestAnimationFrame(tickKoi);
      }

      return () => {
        disposed = true;
        window.clearTimeout(anchorTimer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(koiLoopId);
        clearTimeout(koiLoopId);
        cancelAnimationFrame(pondRaf);
        if (pondCanvas) {
          const fn = (pondCanvas as unknown as { _cleanupResize?: () => void })._cleanupResize;
          fn?.();
        }
        if (gl1) {
          if (pondTex) gl1.deleteTexture(pondTex);
          if (pondBuf) gl1.deleteBuffer(pondBuf);
          if (pondProg) gl1.deleteProgram(pondProg);
        }
        if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
        cleanupKoiResources();
      };
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(pondRaf);
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, []);

  return (
    <div ref={sceneRef} className="scene" aria-hidden="true" data-testid="scene-backdrop">
      <div ref={dayRef} className="scene-layer scene-day">
        <video
          ref={videoRef}
          className="pond-video"
          muted
          loop
          playsInline
          preload="auto"
        />
        <canvas id="pondfx" ref={pondCanvasRef} />
      </div>
      <div ref={violetRef} className="scene-layer scene-violet" />
      <div ref={nightRef} className="scene-layer scene-night" />
      <canvas id="koicanvas" ref={koiCanvasRef} />
    </div>
  );
};
