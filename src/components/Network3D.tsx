// @ts-nocheck
"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, OrbitControls, Float } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";

function ParticleNetwork(props: any) {
    const ref = useRef<THREE.Points>(null);
    const sphere = useMemo(() => {
        // Generate random points in a sphere
        return random.inSphere(new Float32Array(500 * 3), { radius: 1.5 });
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#d97706" // gold-600
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

function AbstractShapes() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[0.8, 1]} />
                <meshStandardMaterial
                    color="#fcd34d" // gold-300
                    wireframe={true}
                    transparent
                    opacity={0.3}
                    emissive="#d97706"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </Float>
    );
}

export default function Network3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
            <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#fcd34d" />
                <ParticleNetwork />
                <AbstractShapes />
            </Canvas>
        </div>
    );
}
