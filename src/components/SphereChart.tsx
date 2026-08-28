"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SphereChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    const dirLight1 = new THREE.DirectionalLight(0xffcc44, 1.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff6600, 2.2);
    dirLight2.position.set(-6, -6, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xfff0e0, 2.5, 12);
    pointLight.position.set(1, 3, 4);
    scene.add(pointLight);

    // Shaders & Materials
    const activeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFD4B32,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
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
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      clearcoat: 0.8,
      flatShading: true,
      depthWrite: false,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xeef3ff,
      roughness: 0.05,
      transmission: 0.8,
      thickness: 1.2,
      ior: 1.55,
      transparent: true,
      opacity: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    // Generate Fibonacci Sphere Nodes
    const count = 155;
    const radius = 1.7;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      points.push(new THREE.Vector3(x, y, z));
    }
    // Sort nodes by height so they illuminate from bottom to top
    points.sort((a, b) => a.y - b.y);

    const nodeGeometry = new THREE.DodecahedronGeometry(0.1, 0);
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < count; i++) {
      const nodeMesh = new THREE.Mesh(nodeGeometry, trackMaterial);
      nodeMesh.position.copy(points[i]);
      mainGroup.add(nodeMesh);
      nodes.push(nodeMesh);
    }

    // Inner Glass Sphere
    const glassGeometry = new THREE.IcosahedronGeometry(1.3, 1);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
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
    const duration = 2400;
    const introDuration = 1400;
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

      // Fibonacci sphere nodes entrance animation
      const progress = Math.min(elapsed / duration, 1);
      if (progress <= 1) {
        const timelineProgress = easeOutCubic(progress);
        const activeLimit = timelineProgress * count;

        for (let i = 0; i < count; i++) {
          const nodeMesh = nodes[i];
          if (i < activeLimit) {
            nodeMesh.material = activeMaterial;
            const age = activeLimit - i;
            const scaleFactor = Math.min(Math.max(age * 1.5, 0), 1);
            const springScale = 1.0 + Math.sin(scaleFactor * Math.PI) * 0.45;
            nodeMesh.scale.set(springScale, springScale, springScale);
          } else {
            nodeMesh.material = trackMaterial;
            nodeMesh.scale.set(1.0, 1.0, 1.0);
          }
        }
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

      // Mouse rotation positioning + constant slight spin
      targetRotationX = 0.3 - mouseY * 0.18;
      targetRotationY = -0.2 + mouseX * 0.18;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;
      mainGroup.rotation.y += (targetRotationY + timestamp * 0.0001 - mainGroup.rotation.y) * 0.05;
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
      nodeGeometry.dispose();
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
