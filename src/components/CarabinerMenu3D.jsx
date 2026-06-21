import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Center, Text, RoundedBox, ContactShadows, OrbitControls } from '@react-three/drei';
import { Leva, useControls, button, folder } from 'leva';
import * as THREE from 'three';
import './CarabinerMenu.css';

function CarabinerModel(props) {
    const modelPath = import.meta.env.BASE_URL + 'carabiner+clip+3d+model.glb';
    const { nodes } = useGLTF(modelPath);
    const meshName = Object.keys(nodes).find(key => nodes[key].type === 'Mesh');
    if (!meshName) return null;
    return (
        <group {...props} dispose={null}>
            <mesh geometry={nodes[meshName].geometry} castShadow receiveShadow raycast={() => null}>
                <meshPhysicalMaterial metalness={1.0} roughness={0.12} color="#78716c" envMapIntensity={2.5} />
            </mesh>
        </group>
    );
}

function PillRing({ radius, straightLength, tubeRadius }) {
    const halfL = straightLength / 2;
    return (
        <group rotation={[0, Math.PI / 2, 0]}>
            <mesh position={[0, halfL, 0]} castShadow raycast={() => null}><torusGeometry args={[radius, tubeRadius, 16, 32, Math.PI]} /><meshPhysicalMaterial metalness={1.0} roughness={0.05} color="#ffffff" /></mesh>
            <mesh position={[0, -halfL, 0]} rotation={[0, 0, Math.PI]} castShadow raycast={() => null}><torusGeometry args={[radius, tubeRadius, 16, 32, Math.PI]} /><meshPhysicalMaterial metalness={1.0} roughness={0.05} color="#ffffff" /></mesh>
            <mesh position={[radius, 0, 0]} castShadow raycast={() => null}><cylinderGeometry args={[tubeRadius, tubeRadius, straightLength, 32]} /><meshPhysicalMaterial metalness={1.0} roughness={0.05} color="#ffffff" /></mesh>
            <mesh position={[-radius, 0, 0]} castShadow raycast={() => null}><cylinderGeometry args={[tubeRadius, tubeRadius, straightLength, 32]} /><meshPhysicalMaterial metalness={1.0} roughness={0.05} color="#ffffff" /></mesh>
        </group>
    );
}

function Tag3D({ id, label, isHovered, activeTagId, onPointerEnter, onPointerLeave, onClick, config }) {
    const scaleFactor = 0.0078;
    const tagScale = 0.75;
    const swingRef = useRef();
    const mainPivotRef = useRef();

    const pillRadius = 13 * scaleFactor;
    const pillStraight = 36 * scaleFactor;
    const pillTube = 3 * scaleFactor;
    const pinH = 15 * scaleFactor;
    const plateH = (220 * scaleFactor) * tagScale;
    const hingePos = -pillRadius - (pillStraight / 2);

    const { x, y, rotation, rx, ry, rz, textSize } = config;

    useFrame((state, delta) => {
        if (!swingRef.current || !mainPivotRef.current) return;

        let targetRotationZ = rotation * (Math.PI / 180);
        if (activeTagId !== null && !isHovered) {
            const side = id < activeTagId ? 1 : -1;
            targetRotationZ += side * (10 * (Math.PI / 180));
        }

        // Slower for initial fanning, snappier for hover interaction
        const lerpFactor = isHovered || activeTagId !== null ? 0.07 : 0.02;

        mainPivotRef.current.rotation.z = THREE.MathUtils.lerp(mainPivotRef.current.rotation.z, targetRotationZ, lerpFactor);

        let targetSwingY = isHovered ? 0 : 65 * (Math.PI / 180);
        let targetScale = isHovered ? 1.05 : 1.0;
        swingRef.current.rotation.y = THREE.MathUtils.lerp(swingRef.current.rotation.y, targetSwingY, lerpFactor);
        swingRef.current.scale.setScalar(THREE.MathUtils.lerp(swingRef.current.scale.x, targetScale, lerpFactor));
    });

    return (
        <group ref={mainPivotRef} position={[x, y, 0]}>
            <group rotation={[rx * (Math.PI / 180), ry * (Math.PI / 180), rz * (Math.PI / 180)]}>
                <PillRing radius={pillRadius} straightLength={pillStraight} tubeRadius={pillTube} />
            </group>
            <group ref={swingRef} position={[0, hingePos, 0]}
                onPointerOver={(e) => { e.stopPropagation(); onPointerEnter(e); }}
                onPointerOut={(e) => { e.stopPropagation(); onPointerLeave(e); }}
                onClick={(e) => { e.stopPropagation(); onClick(e); }}
            >
                <group position={[0, -hingePos, 0]}>
                    {/* Unified rotationally-symmetric invisible hitbox (prevents animation jitter) */}
                    <mesh position={[0, -(pinH + plateH) / 2, 0]}>
                        <cylinderGeometry args={[(85 * scaleFactor) * tagScale * 0.8, (85 * scaleFactor) * tagScale * 0.8, -2 * hingePos + pinH + plateH, 16]} />
                        <meshBasicMaterial visible={false} />
                    </mesh>
                    {/* Visual elements */}
                    <mesh position={[0, hingePos - (pinH / 2), 0]} castShadow raycast={() => null}>
                        <cylinderGeometry args={[5 * scaleFactor * tagScale, 5 * scaleFactor * tagScale, pinH, 32]} />
                        <meshPhysicalMaterial metalness={1.0} roughness={0.05} color="#ffffff" />
                    </mesh>
                    <mesh position={[0, hingePos - pinH - (plateH / 2), 0]} castShadow receiveShadow raycast={() => null}>
                        <RoundedBox args={[(85 * scaleFactor) * tagScale, plateH, (10 * scaleFactor) * tagScale]} radius={0.02} smoothness={5}>
                            <meshPhysicalMaterial metalness={0.9} roughness={0.2} color="#E8E3D9" envMapIntensity={2.0} />
                        </RoundedBox>
                    </mesh>
                    <Text position={[0, hingePos - pinH - plateH + (12 * scaleFactor), (10 * scaleFactor * tagScale / 2) + 0.015]}
                        font={import.meta.env.BASE_URL + 'Roboto-Light.woff'}
                        fontSize={textSize * scaleFactor} color={isHovered ? "#000000" : "#1A1A1A"}
                        anchorX="right" anchorY="middle" rotation={[0, 0, -Math.PI / 2]}
                        letterSpacing={0.15} maxWidth={plateH * 0.9}
                        raycast={() => null}
                    >
                        {label.toUpperCase()}
                    </Text>
                </group>
            </group>
        </group>
    );
}

function ResponsiveWrapper({ children, endX, endY }) {
    const groupRef = useRef();
    const { viewport } = useThree();
    const [bounds, setBounds] = useState(null);

    useEffect(() => {
        const handle = requestAnimationFrame(() => {
            if (!groupRef.current) return;
            
            const parent = groupRef.current.parent;
            if (!parent) return;
            
            const parentRot = parent.rotation.clone();
            const parentScale = parent.scale.clone();
            
            const originalScale = groupRef.current.scale.clone();
            const originalPosition = groupRef.current.position.clone();
            
            // Set parent to its FINAL animation state for measurement
            parent.rotation.set(endX, endY, 0);
            parent.scale.set(1, 1, 1);
            
            // Set self to baseline
            groupRef.current.scale.set(1, 1, 1);
            groupRef.current.position.set(0, 0, 0);
            
            // Update matrices
            parent.updateMatrixWorld(true);
            groupRef.current.updateMatrixWorld(true);
            
            // Calculate bounding box in world space
            const box = new THREE.Box3().setFromObject(groupRef.current);
            
            // Restore parent's state
            parent.rotation.copy(parentRot);
            parent.scale.copy(parentScale);
            parent.updateMatrixWorld(true);
            
            // Restore self state
            groupRef.current.scale.copy(originalScale);
            groupRef.current.position.copy(originalPosition);
            groupRef.current.updateMatrixWorld(true);
            
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            // Avoid issues if size is 0
            if (size.x > 0.1) {
                setBounds({
                    width: size.x,
                    height: size.y,
                    center: center
                });
            }
        });
        
        return () => cancelAnimationFrame(handle);
    }, [endX, endY]);

    useFrame(() => {
        if (!groupRef.current || !bounds) return;
        
        const padding = 0.85; // fit inside 85% of viewport
        const scaleX = (viewport.width * padding) / bounds.width;
        const scaleY = (viewport.height * padding) / bounds.height;
        const targetScale = Math.min(scaleX, scaleY);
        
        const targetPos = bounds.center.clone().multiplyScalar(-targetScale);
        
        // Smoothly lerp towards target scale and position
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1));
        groupRef.current.position.lerp(targetPos, 0.1);
    });

    return (
        <group ref={groupRef}>
            {children}
        </group>
    );
}

const CarabinerMenu3D = () => {
    const [activeTag, setActiveTag] = useState(null);
    const enterGroupRef = useRef();

    // Forward scroll events to the parent Wix page so iFrame doesn't trap them
    useEffect(() => {
        const handleWheel = (e) => {
            if (window.top !== window.self) {
                window.top.scrollBy(0, e.deltaY);
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    const rootControl = useControls({
        global: folder({ globalPos: [-0.067, 1.121, 0.025], globalRot: [0.91, 1.68, 39.36] }),
        carabiner: folder({ rotation: 36.18, scale: 0.97, yOffset: 1.018, modelRot: [0.35, -1.55, 0.45], modelPos: [-1.0981, 0.9023, -0.26], modelScale: 2.809 }),
        tag1: folder({ l1: { value: 'Home', editable: false }, x1: -0.7649, y1: 0.108, rot1: 23, rx1: 0, ry1: -25.98, rz1: 0, size1: 14 }),
        tag2: folder({ l2: { value: 'About Me', editable: false }, x2: -1.0218, y2: -0.0386, rot2: 6.32, rx2: 0, ry2: -34, rz2: 0, size2: 14 }),
        tag3: folder({ l3: { value: 'Advertising', editable: false }, x3: -1.311, y3: -0.062, rot3: -12.78, rx3: 0, ry3: -29.68, rz3: 0, size3: 14 }),
        tag4: folder({ l4: { value: 'Side Projects', editable: false }, x4: -1.5902, y4: 0.0352, rot4: -31, rx4: 0, ry4: -37.65, rz4: 0, size4: 14 }),
        tag5: folder({ l5: { value: 'Contact', editable: false }, x5: -1.81, y5: 0.23, rot5: -46, rx5: 0, ry5: -38.34, rz5: 0, size5: 14 }),
        fan: folder({ fx: -0.25, fy: -0.43, fz: -0.13 }),
        intro: folder({ startX: 0.769, startY: 1.21, endX: -0.1615, endY: -0.1712, speed: 0.012, startScale: 0.663, endScale: 1.03 })
    });

    const latestValues = useRef(rootControl);
    latestValues.current = rootControl;

    const { showTags } = useControls({
        showTags: { value: true, label: 'Show Tags' },
        'Copy Master JSON': button(() => {
            navigator.clipboard.writeText(JSON.stringify(latestValues.current, null, 2));
            alert("ALIGNED NUMBERS COPIED TO CLIPBOARD!");
        }),
        'Download Image': button(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'carabiner-custom.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        })
    });

    const FRAMER_BASE = 'https://shannonnorthcott-comer.framer.website';
    const tags = [
        { id: 1, label: 'Home', x: rootControl.x1, y: rootControl.y1, rotation: rootControl.rot1, rx: rootControl.rx1, ry: rootControl.ry1, rz: rootControl.rz1, textSize: rootControl.size1, url: FRAMER_BASE + '/' },
        { id: 2, label: 'About Me', x: rootControl.x2, y: rootControl.y2, rotation: rootControl.rot2, rx: rootControl.rx2, ry: rootControl.ry2, rz: rootControl.rz2, textSize: rootControl.size2, url: FRAMER_BASE + '/about' },
        { id: 3, label: 'Advertising', x: rootControl.x3, y: rootControl.y3, rotation: rootControl.rot3, rx: rootControl.rx3, ry: rootControl.ry3, rz: rootControl.rz3, textSize: rootControl.size3, url: FRAMER_BASE + '/advertising' },
        { id: 4, label: 'Side Projects', x: rootControl.x4, y: rootControl.y4, rotation: rootControl.rot4, rx: rootControl.rx4, ry: rootControl.ry4, rz: rootControl.rz4, textSize: rootControl.size4, url: FRAMER_BASE + '/sideprojects' },
        { id: 5, label: 'Contact Me', x: rootControl.x5, y: rootControl.y5, rotation: rootControl.rot5, rx: rootControl.rx5, ry: rootControl.ry5, rz: rootControl.rz5, textSize: rootControl.size5, url: FRAMER_BASE + '/contactme' }
    ];

    return (
        <div className="carabiner-container">
            <Leva hidden />
            <div className="carabiner-wrapper">
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
                    <Canvas shadows camera={{ position: [0, 0, 7.0], fov: 45 }} gl={{ alpha: true, preserveDrawingBuffer: true }} style={{ pointerEvents: 'auto' }}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.8} />
                            <Environment preset="city" />
                            <EnterAnimation startX={rootControl.startX} startY={rootControl.startY} endX={rootControl.endX} endY={rootControl.endY} speed={rootControl.speed} startScale={rootControl.startScale} endScale={rootControl.endScale}>
                                <ResponsiveWrapper endX={rootControl.endX} endY={rootControl.endY}>
                                    <group rotation={[rootControl.globalRot[0] * (Math.PI / 180), rootControl.globalRot[1] * (Math.PI / 180), rootControl.globalRot[2] * (Math.PI / 180)]} position={rootControl.globalPos} scale={rootControl.scale} >
                                        <Center position={rootControl.modelPos}><CarabinerModel scale={rootControl.modelScale} rotation={rootControl.modelRot} /></Center>
                                        <group position={[rootControl.fx, rootControl.fy, rootControl.fz]}>
                                            {showTags && tags.map(tag => (
                                                <Tag3D key={tag.id} {...tag} config={tag} isHovered={activeTag === tag.id} activeTagId={activeTag} onPointerEnter={() => setActiveTag(tag.id)} onPointerLeave={() => setActiveTag(null)}
                                                    onClick={(e) => {
                                                        if (!tag.url) return;
                                                        
                                                        // Always an absolute Framer URL — safe to use in every context
                                                        const finalUrl = tag.url;
                                                        
                                                        // Try navigating the top-level window
                                                        try { window.top.location.href = finalUrl; return; } catch (e) { }
                                                        // Fallback: open in parent frame
                                                        try { window.open(finalUrl, '_top'); return; } catch (e) { }
                                                        // Fallback: anchor click targeting parent
                                                        try {
                                                            const link = document.createElement('a');
                                                            link.href = finalUrl;
                                                            link.target = '_top';
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        } catch (e) { }
                                                    }}
                                                />
                                            ))}
                                        </group>
                                    </group>
                                </ResponsiveWrapper>
                            </EnterAnimation>
                        </Suspense>
                        <OrbitControls enableZoom={false} />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};

function EnterAnimation({ children, startX, startY, endX, endY, speed, startScale, endScale }) {
    const ref = useRef();
    useFrame(() => {
        if (!ref.current) return;
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, endX, speed);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, endY, speed);
        ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, endScale, speed));
    });

    return (
        <group ref={ref} rotation={[startX, startY, 0]} scale={startScale}>
            {children}
        </group>
    );
}

export default CarabinerMenu3D;
