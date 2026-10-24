import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Lock, RotateCcw, Eye, Sparkles } from 'lucide-react';

/**
 * EscrowVaultVisual3D
 * Procedural 3D Tripartite Escrow Vault Visualizer
 * Represents the 3-party cryptographic custody between:
 * 1. Technical Institution (Outer Sovereign Ring)
 * 2. Commercial Bank (Intermediate Gyro Ring)
 * 3. AICTE Regulatory Authority (Inner Golden Custody Node)
 *
 * Implements Three.js PBR rendering standards with software-WebGL guard,
 * zero external dependencies, exponential damping, and studio lighting.
 */
export function EscrowVaultVisual3D({
  title = "Tripartite Digital Escrow Architecture",
  subtitle = "Cryptographic multi-party sovereign custody: College · Bank · AICTE",
  height = "260px",
  interactive = true,
}) {
  const mountRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [activeInspectLayer, setActiveInspectLayer] = useState('all'); // 'all', 'institution', 'bank', 'aicte'
  const stateRef = useRef({
    isRotating: true,
    inspectLayer: 'all',
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0.2,
    targetRotationY: 0,
  });

  useEffect(() => {
    stateRef.current.isRotating = isRotating;
    stateRef.current.inspectLayer = activeInspectLayer;
  }, [isRotating, activeInspectLayer]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const heightPx = container.clientHeight || 260;

    // 1. Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f8fa); // Clean neutral section background

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd1d5db, 0.8);
    scene.add(hemiLight);

    // 4. Procedural Contact Shadow Floor
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(17, 24, 39, 0.28)');
    grad.addColorStop(0.5, 'rgba(17, 24, 39, 0.08)');
    grad.addColorStop(1, 'rgba(17, 24, 39, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(canvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.55;
    scene.add(shadowMesh);

    // 5. Build 3-Party Composite Escrow Assembly (THREE.Group)
    const vaultGroup = new THREE.Group();
    vaultGroup.position.y = -0.05;
    scene.add(vaultGroup);

    // Materials Palette (High-contrast, metallic, monochrome with refined gold/platinum)
    const institutionMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937, // Slate 800
      metalness: 0.85,
      roughness: 0.25,
    });

    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate 600
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });

    const aicteMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber/Gold Sovereign Custody Node
      metalness: 0.95,
      roughness: 0.15,
    });

    const latticeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Accent slate
      metalness: 0.7,
      roughness: 0.4,
      wireframe: true,
    });

    // Part 1: Outer Heavy Institutional Ring (Torus)
    const outerTorusGeo = new THREE.TorusGeometry(1.5, 0.1, 24, 64);
    const outerTorus = new THREE.Mesh(outerTorusGeo, institutionMat);
    outerTorus.castShadow = !isSoftwareGl;
    vaultGroup.add(outerTorus);

    // Part 2: Outer Gear/Bolt Teeth (12 nodes around perimeter representing deposit verification)
    const boltGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12);
      const bolt = new THREE.Mesh(boltGeo, bankMat);
      bolt.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
      bolt.rotation.z = angle + Math.PI / 2;
      boltGroup.add(bolt);
    }
    vaultGroup.add(boltGroup);

    // Part 3: Intermediate Bank Gyroscopic Ring (Rotates on Y axis)
    const bankRingGeo = new THREE.TorusGeometry(1.15, 0.07, 20, 48);
    const bankRing = new THREE.Mesh(bankRingGeo, bankMat);
    bankRing.rotation.x = Math.PI / 3;
    vaultGroup.add(bankRing);

    // Part 4: Inner Cryptographic Lattice Cage (Icosahedron wireframe)
    const cageGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const cageMesh = new THREE.Mesh(cageGeo, latticeMat);
    vaultGroup.add(cageMesh);

    // Part 5: Central AICTE Sovereign Gold Core (Octahedron + Core Sphere)
    const coreOctaGeo = new THREE.OctahedronGeometry(0.5, 0);
    const coreMesh = new THREE.Mesh(coreOctaGeo, aicteMat);
    coreMesh.castShadow = !isSoftwareGl;
    vaultGroup.add(coreMesh);

    // Part 6: Inner Gyro Ring (Rotates on X axis)
    const innerRingGeo = new THREE.TorusGeometry(0.68, 0.04, 16, 36);
    const innerRing = new THREE.Mesh(innerRingGeo, aicteMat);
    innerRing.rotation.y = Math.PI / 4;
    vaultGroup.add(innerRing);

    // Pre-allocate math helpers
    let frameId = 0;
    let clock = new THREE.Clock();

    // Mouse Interaction
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      stateRef.current.targetRotationY += deltaX * 0.008;
      stateRef.current.targetRotationX += deltaY * 0.008;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Animation Tick with Exponential Damping
    const animate = () => {
      const delta = clock.getDelta();

      if (stateRef.current.isRotating && !isDragging) {
        stateRef.current.targetRotationY += delta * 0.45;
      }

      // Smooth damping interpolation
      vaultGroup.rotation.y = THREE.MathUtils.damp(
        vaultGroup.rotation.y,
        stateRef.current.targetRotationY,
        8,
        delta
      );
      vaultGroup.rotation.x = THREE.MathUtils.damp(
        vaultGroup.rotation.x,
        stateRef.current.targetRotationX,
        8,
        delta
      );

      // Gyro sub-rotation
      bankRing.rotation.z += delta * 0.6;
      cageMesh.rotation.y -= delta * 0.3;
      cageMesh.rotation.x += delta * 0.2;
      coreMesh.rotation.y += delta * 0.9;
      innerRing.rotation.x -= delta * 0.7;

      // Layer highlights based on inspection
      const layer = stateRef.current.inspectLayer;
      outerTorus.visible = layer === 'all' || layer === 'institution';
      boltGroup.visible = layer === 'all' || layer === 'institution';
      bankRing.visible = layer === 'all' || layer === 'bank';
      cageMesh.visible = layer === 'all' || layer === 'bank';
      coreMesh.visible = layer === 'all' || layer === 'aicte';
      innerRing.visible = layer === 'all' || layer === 'aicte';

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      // Clean disposal of geometries and materials
      [outerTorusGeo, bankRingGeo, cageGeo, coreOctaGeo, innerRingGeo, shadowGeo].forEach((g) =>
        g.dispose()
      );
      [institutionMat, bankMat, aicteMat, latticeMat, shadowMat].forEach((m) => m.dispose());
      shadowTex.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-200 bg-gray-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-900 tracking-tight">{title}</span>
            <span className="text-[11px] font-mono text-gray-500">· 3D Vault Knot</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Layer Filter Buttons & Rotation Toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveInspectLayer('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeInspectLayer === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Layers
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectLayer('institution')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeInspectLayer === 'institution'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Institution
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectLayer('bank')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeInspectLayer === 'bank'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bank
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectLayer('aicte')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeInspectLayer === 'aicte'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AICTE
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isRotating
                ? 'bg-gray-100 border-gray-300 text-gray-900'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'
            }`}
            title={isRotating ? 'Pause 3D rotation' : 'Resume 3D rotation'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        style={{ height }}
        className="relative w-full cursor-grab active:cursor-grabbing bg-[#F7F8FA] select-none"
      />

      {/* Footer Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 border-t border-gray-200 bg-white text-[11px] text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-900 inline-block" />
            <span>Institution Ring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block" />
            <span>Bank Verification Gyro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" />
            <span>AICTE Sovereign Custody Node</span>
          </div>
        </div>

        <span className="font-mono text-gray-400">
          Drag to inspect 360° escrow lock
        </span>
      </div>
    </div>
  );
}

export default EscrowVaultVisual3D;
