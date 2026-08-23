"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function RingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // IntersectionObserver visibility throttle
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Three.js Setup
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Main Group
    const mainGroup = new THREE.Group();
    mainGroup.rotation.x = 0.3;
    mainGroup.rotation.y = -0.2;
    scene.add(mainGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffe4c0, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffcc44, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff6600, 2.5);
    dirLight2.position.set(-6, -6, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xfff0e0, 2.5, 15);
    pointLight.position.set(1, 3, 4);
    scene.add(pointLight);

    // Shaders & Materials
    const activeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFD4B32,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      flatShading: true,
      reflectivity: 0.9,
    });

    activeMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      activeMaterial.userData.shader = shader;
      shader.vertexShader = "varying vec3 vLocalPosition;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLocalPosition = vec3(position);"
      );
      shader.fragmentShader = "varying vec3 vLocalPosition;\nuniform float uTime;\nvec3 vDynamicColor;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float angle = atan(vLocalPosition.y, vLocalPosition.x);
        float wave1 = sin(angle * 2.5 + uTime * 1.5) * 0.5 + 0.5;
        float wave2 = cos(angle * 4.0 - uTime * 2.0) * 0.5 + 0.5;
        float blend = clamp(wave1 * 0.6 + wave2 * 0.4, 0.0, 1.0);
        
        vec3 colBase = vec3(1.0, 0.42, 0.0);           
        vec3 colShimmer1 = vec3(1.0, 0.75, 0.1);       
        vec3 colShimmer2 = vec3(1.0, 0.28, 0.0);       
        
        vDynamicColor = mix(colBase, mix(colShimmer1, colShimmer2, wave2), blend * 0.35);
        diffuseColor.rgb = vDynamicColor;
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec3 totalEmissiveRadiance = emissive;",
        "vec3 totalEmissiveRadiance = vDynamicColor * 0.12;"
      );
    };

    const trackMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xD4C8B0,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.38,
      clearcoat: 0.8,
      flatShading: true,
      depthWrite: false,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xeef3ff,
      roughness: 0.04,
      transmission: 0.75,
      thickness: 1.2,
      ior: 1.58,
      transparent: true,
      opacity: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    // Helper to generate progress ring geometries
    const createRingGeometry = (progress: number) => {
      const currentProgress = Math.max(progress, 0.001);
      const shape = new THREE.Shape();
      const innerRadius = 1.45;
      const outerRadius = 1.95;
      shape.absarc(0, 0, outerRadius, 0, Math.PI * 2 * currentProgress, false);
      shape.absarc(0, 0, innerRadius, Math.PI * 2 * currentProgress, 0, true);
      return new THREE.ExtrudeGeometry(shape, {
        depth: 0.35,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.03,
        bevelThickness: 0.03,
        curveSegments: 24,
      });
    };

    // Track Ring (Background 100%)
    const trackGeometry = createRingGeometry(1.0);
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    trackMesh.position.z = -0.05;
    mainGroup.add(trackMesh);

    // Active progress ring mesh
    const activeMesh = new THREE.Mesh(createRingGeometry(0.001), activeMaterial);
    mainGroup.add(activeMesh);

    // Glass cylinder background prism
    const glassGeometry = new THREE.CylinderGeometry(1.44, 1.44, 0.08, 6);
    glassGeometry.rotateX(Math.PI / 2);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.position.z = -0.12;
    mainGroup.add(glassMesh);

    // Interactive cursor tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.3;
    let targetRotationY = -0.2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Anim configuration
    const targetPercent = 83;
    const duration = 3600;
    const introDuration = 1800;
    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easeOutBack = (x: number) => {
      const c1 = 1.4;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    // Render loop
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Visibility check
      if (!isVisibleRef.current) return;

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Ring extrusion growth
      const progress = Math.min(elapsed / duration, 1);
      const currentPercent = easeOutCubic(progress) * targetPercent;
      if (progress <= 1) {
        activeMesh.geometry.dispose();
        activeMesh.geometry = createRingGeometry(currentPercent / 100);
      }

      // Entrance scaling
      const introProgress = Math.min(elapsed / introDuration, 1);
      const introScale = easeOutBack(introProgress);
      mainGroup.scale.set(introScale, introScale, introScale);
      mainGroup.rotation.z = (1.0 - easeOutCubic(introProgress)) * -0.6;

      // Update shader uniform time
      if (activeMaterial.userData.shader) {
        activeMaterial.userData.shader.uniforms.uTime.value = timestamp * 0.001;
      }

      // Mouse rotation positioning
      targetRotationX = 0.3 - mouseY * 0.18;
      targetRotationY = -0.2 + mouseX * 0.18;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.position.z = Math.sin(timestamp * 0.001) * 0.02;

      renderer.render(scene, camera);
    };

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        renderer.setSize(w, h);
        camera.aspect = w / h;

        const aspect = camera.aspect;
        const objectSize = 4.8;
        const halfFovRad = THREE.MathUtils.degToRad(camera.fov / 2);
        const dist = aspect > 1 
          ? (objectSize / 2) / Math.tan(halfFovRad) 
          : ((objectSize / 2) / Math.tan(halfFovRad)) / aspect;
        
        camera.position.z = Math.max(dist, 6.2);
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(container);

    requestAnimationFrame(animate);

    // Cleanup resources
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      observer.disconnect();

      // Dispose Geometries
      trackGeometry.dispose();
      activeMesh.geometry.dispose();
      glassGeometry.dispose();

      // Dispose Materials
      activeMaterial.dispose();
      trackMaterial.dispose();
      glassMaterial.dispose();

      // Dispose Renderer
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="w-full h-full" ref={containerRef} />;
}
