"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SplineChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const label2016Ref = useRef<HTMLDivElement>(null);
  const label2026Ref = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Visibility Observer
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
      opacity: 0.38,
      clearcoat: 0.8,
      flatShading: true,
      depthWrite: false,
    });

    // Spline Points
    const points = [
      new THREE.Vector3(-1.8, -0.6, 0.0),
      new THREE.Vector3(-1.44, -0.5, 0.1),
      new THREE.Vector3(-1.08, -0.3, -0.05),
      new THREE.Vector3(-0.72, -0.4, 0.05),
      new THREE.Vector3(-0.36, -0.05, 0.15),
      new THREE.Vector3(0.0, 0.15, -0.1),
      new THREE.Vector3(0.36, 0.05, 0.05),
      new THREE.Vector3(0.72, 0.4, 0.2),
      new THREE.Vector3(1.08, 0.5, 0.0),
      new THREE.Vector3(1.44, 0.75, 0.1),
      new THREE.Vector3(1.8, 0.85, 0.25),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const segmentsCount = 10;

    // Track tube
    const trackGeometry = new THREE.TubeGeometry(curve, 100, 0.08, 5, false);
    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    trackMesh.position.z = -0.02;
    mainGroup.add(trackMesh);

    // Active growth tube
    const activeMesh = new THREE.Mesh(new THREE.BufferGeometry(), activeMaterial);
    mainGroup.add(activeMesh);

    // Sphere/Dodecahedron nodes
    const nodeGeometry = new THREE.DodecahedronGeometry(0.14, 0);
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < points.length; i++) {
      const nodeMesh = new THREE.Mesh(nodeGeometry, trackMaterial);
      nodeMesh.position.copy(points[i]);
      nodeMesh.position.z += 0.04;
      mainGroup.add(nodeMesh);
      nodes.push(nodeMesh);
    }

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

    // Animation variables
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

    const tempV = new THREE.Vector3();

    // Render loop
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // WebGL Throttle when offscreen
      if (!isVisibleRef.current) return;

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // 1. Dynamic active curve extrusion
      const progress = Math.min(elapsed / duration, 1);
      const timelineProgress = easeOutCubic(progress);
      if (progress <= 1) {
        const subPoints: THREE.Vector3[] = [];
        const subSegments = 100;
        const limit = Math.ceil(timelineProgress * subSegments);
        
        for (let j = 0; j <= limit; j++) {
          const t = (j / subSegments) * timelineProgress;
          subPoints.push(curve.getPointAt(t));
        }

        if (subPoints.length < 2) {
          subPoints.push(points[0].clone());
          subPoints.push(points[0].clone().addScalar(0.001));
        }

        const subCurve = new THREE.CatmullRomCurve3(subPoints);
        activeMesh.geometry.dispose();
        activeMesh.geometry = new THREE.TubeGeometry(subCurve, 64, 0.08, 5, false);

        // Nodes animation scale & material changes
        const activeSegmentsTarget = timelineProgress * segmentsCount;
        for (let i = 0; i < points.length; i++) {
          const nodeProgress = Math.min(Math.max(activeSegmentsTarget - i, 0), 1);
          const nodeMesh = nodes[i];
          if (nodeProgress > 0) {
            nodeMesh.material = activeMaterial;
            const scale = 1.0 + Math.sin(nodeProgress * Math.PI) * 0.45;
            nodeMesh.scale.set(scale, scale, scale);
          } else {
            nodeMesh.material = trackMaterial;
            nodeMesh.scale.set(1.0, 1.0, 1.0);
          }
        }
      }

      // 2. Entrance scaling
      const introProgress = Math.min(elapsed / introDuration, 1);
      const introScale = easeOutBack(introProgress);
      mainGroup.scale.set(introScale, introScale, introScale);
      mainGroup.rotation.z = (1.0 - easeOutCubic(introProgress)) * -0.6;

      // Update shader uniform time
      if (activeMaterial.userData.shader) {
        activeMaterial.userData.shader.uniforms.uTime.value = timestamp * 0.001;
      }

      // 3. Mouse rotation interpolation
      targetRotationX = 0.3 - mouseY * 0.18;
      targetRotationY = -0.2 + mouseX * 0.18;
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
      mainGroup.position.z = Math.sin(timestamp * 0.001) * 0.02;

      renderer.render(scene, camera);

      // 4. Project coordinates to 2D HTML labels on requestAnimationFrame to prevent lagging
      const label2016 = label2016Ref.current;
      const label2026 = label2026Ref.current;
      if (label2016 && label2026) {
        mainGroup.updateMatrixWorld(true);
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 2016 label (points[0])
        tempV.copy(points[0]);
        tempV.y += 0.28;
        tempV.applyMatrix4(mainGroup.matrixWorld);
        tempV.project(camera);
        const x1 = (tempV.x * 0.5 + 0.5) * width;
        const y1 = (tempV.y * -0.5 + 0.5) * height;
        label2016.style.transform = `translate(-50%, -100%) translate(${x1}px, ${y1}px)`;
        label2016.style.opacity = introProgress > 0.5 ? "1" : "0";

        // 2026 label (points[last])
        tempV.copy(points[points.length - 1]);
        tempV.y += 0.28;
        tempV.applyMatrix4(mainGroup.matrixWorld);
        tempV.project(camera);
        const x2 = (tempV.x * 0.5 + 0.5) * width;
        const y2 = (tempV.y * -0.5 + 0.5) * height;
        label2026.style.transform = `translate(-50%, -100%) translate(${x2}px, ${y2}px)`;
        label2026.style.opacity = timelineProgress > 0.9 ? "1" : "0";
      }
    };

    // Resize Handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        renderer.setSize(w, h);
        camera.aspect = w / h;

        const aspect = camera.aspect;
        const objectSize = 4.2;
        const halfFovRad = THREE.MathUtils.degToRad(camera.fov / 2);
        const dist = aspect > 1 
          ? (objectSize / 2) / Math.tan(halfFovRad) 
          : ((objectSize / 2) / Math.tan(halfFovRad)) / aspect;
        
        camera.position.z = Math.max(dist, 5.5);
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(container);

    // Initial Trigger
    requestAnimationFrame(animate);

    // Deep Memory Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      observer.disconnect();

      // Dispose Geometries
      trackGeometry.dispose();
      activeMesh.geometry.dispose();
      nodeGeometry.dispose();

      // Dispose Materials
      activeMaterial.dispose();
      trackMaterial.dispose();

      // Dispose Renderer
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* HTML Projection Labels */}
      <div
        ref={label2016Ref}
        className="absolute top-0 left-0 pointer-events-none select-none font-sans text-[clamp(0.6rem,0.8vw,0.75rem)] font-bold text-brand-gray/60 uppercase bg-brand-light-gray/80 backdrop-blur-sm px-2 py-0.5 rounded-none border border-brand-gray/10 opacity-0 transition-opacity duration-300 will-change-transform z-10"
      >
        2016
      </div>
      <div
        ref={label2026Ref}
        className="absolute top-0 left-0 pointer-events-none select-none font-sans text-[clamp(0.6rem,0.8vw,0.75rem)] font-bold text-brand-orange uppercase bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-none border border-brand-orange/20 opacity-0 transition-opacity duration-300 will-change-transform z-10"
      >
        2026
      </div>
    </div>
  );
}
