// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Network3D() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // Particle sphere — reduced count for performance
        const particleCount = 400;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.5;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xd97706,
            size: 0.015,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Wirframe icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(0.8, 1);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0xfcd34d,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
        });
        const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        scene.add(icosahedron);

        // Ambient & point light (for future solid meshes)
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        // Animation
        let animId: number;
        const animate = () => {
            animId = requestAnimationFrame(animate);
            particles.rotation.x -= 0.001;
            particles.rotation.y -= 0.0007;
            icosahedron.rotation.x += 0.003;
            icosahedron.rotation.y += 0.004;
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
            mount.removeChild(renderer.domElement);
            renderer.dispose();
            particleGeometry.dispose();
            particleMaterial.dispose();
            icoGeometry.dispose();
            icoMaterial.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-70" />;
}
