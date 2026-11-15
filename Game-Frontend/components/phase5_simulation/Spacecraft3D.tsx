import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { RedesignConfiguration } from '../../types/mission';

interface Spacecraft3DProps {
  config: RedesignConfiguration;
  isEclipse: boolean;
  orbitAngle?: number; // radians
}

export const Spacecraft3D: React.FC<Spacecraft3DProps> = ({ config, isEclipse }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // dark space slate-950

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // 2. Starfield Background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 200;
      starPositions[i + 1] = (Math.random() - 0.5) * 200;
      starPositions[i + 2] = (Math.random() - 0.5) * 200;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.8 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, isEclipse ? 0.3 : 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, isEclipse ? 0.3 : 2.5);
    sunLight.position.set(40, 20, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 4. Asteroid 3D Mesh (Target Celestial Body)
    const asteroidGeo = new THREE.DodecahedronGeometry(5.5, 2);
    // Perturb vertices for rocky asteroid texture
    const posAttr = asteroidGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const noise = (Math.sin(v.x * 2.5) * Math.cos(v.y * 2.5) * Math.sin(v.z * 2.5)) * 0.6;
      v.addScaledVector(v.clone().normalize(), noise);
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    asteroidGeo.computeVertexNormals();

    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.set(0, 0, 0);
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    scene.add(asteroid);

    // 5. Orbit Trajectory Ring
    const orbitRadius = config.orbit === 'orbit_distant_quasi' ? 18 : (config.orbit === 'orbit_low_terminator' ? 9 : 12);
    const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius * 0.85, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y)));
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = Math.PI / 6;
    scene.add(orbitLine);

    // 6. Spacecraft Group
    const spacecraft = new THREE.Group();

    // Central Bus (Cube with Gold MLI / Spacecraft frame)
    const busColor = config.thermal === 'thermal_passive_minimal' ? 0x94a3b8 : 0xd97706; // silver vs gold kapton MLI
    const busGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const busMat = new THREE.MeshStandardMaterial({
      color: busColor,
      roughness: 0.3,
      metalness: 0.8,
    });
    const busMesh = new THREE.Mesh(busGeo, busMat);
    spacecraft.add(busMesh);

    // Solar Subsystem
    if (config.solar === 'solar_gaas_deployable') {
      // Dual deployable solar array wings
      const wingGeo = new THREE.BoxGeometry(2.5, 0.08, 0.8);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.7 });
      
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-2.0, 0, 0);
      spacecraft.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(2.0, 0, 0);
      spacecraft.add(rightWing);
    } else if (config.solar === 'power_nextgen_rtg') {
      // Cylindrical RTG unit
      const rtgGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
      const rtgMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.8 });
      const rtgMesh = new THREE.Mesh(rtgGeo, rtgMat);
      rtgMesh.position.set(-1.2, 0, 0);
      spacecraft.add(rtgMesh);
    } else {
      // Body-mounted basic silicon panel on top
      const topPanelGeo = new THREE.BoxGeometry(1.2, 0.05, 1.2);
      const topPanelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const topPanel = new THREE.Mesh(topPanelGeo, topPanelMat);
      topPanel.position.set(0, 0.72, 0);
      spacecraft.add(topPanel);
    }

    // Comms Subsystem
    if (config.comms === 'comms_x_band_dish') {
      // Parabolic Dish Antenna
      const dishGeo = new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, side: THREE.DoubleSide });
      const dishMesh = new THREE.Mesh(dishGeo, dishMat);
      dishMesh.position.set(0, 1.1, 0);
      dishMesh.rotation.x = -Math.PI / 2;
      spacecraft.add(dishMesh);
    } else if (config.comms === 'comms_optical_laser') {
      // Laser transceiver emitter tube
      const laserGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.9, 12);
      const laserMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.9 });
      const laserMesh = new THREE.Mesh(laserGeo, laserMat);
      laserMesh.position.set(0, 1.0, 0);
      spacecraft.add(laserMesh);
    }

    // Science Payload Boom
    const boomGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.position.set(0, -1.0, 0.5);
    spacecraft.add(boom);

    scene.add(spacecraft);

    // 7. Mouse Orbit Controls Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let camRotY = 0;
    let camRotX = 0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      camRotY -= deltaX * 0.008;
      camRotX = Math.max(0.1, Math.min(Math.PI / 2.2, camRotX - deltaY * 0.008));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let animationFrameId: number;
    let theta = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate Asteroid
      asteroid.rotation.y += 0.002;
      asteroid.rotation.x += 0.0005;

      // Orbit Spacecraft
      theta += 0.008;
      const x = Math.cos(theta) * orbitRadius;
      const z = Math.sin(theta) * (orbitRadius * 0.85);
      
      // Apply orbit plane tilt
      const tiltedY = z * Math.sin(Math.PI / 6);
      const tiltedZ = z * Math.cos(Math.PI / 6);

      spacecraft.position.set(x, tiltedY, tiltedZ);
      spacecraft.rotation.y = -theta;

      // Camera position from mouse rotations
      const camDist = 28;
      camera.position.x = Math.sin(camRotY) * Math.cos(camRotX) * camDist;
      camera.position.y = Math.sin(camRotX) * camDist;
      camera.position.z = Math.cos(camRotY) * Math.cos(camRotX) * camDist;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [config, isEclipse]);

  return (
    <div className="relative w-full h-80 overflow-hidden bg-slate-950">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
