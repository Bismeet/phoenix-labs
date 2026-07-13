import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getPerformanceTier } from "../utils/performanceProfile";
import "./PhoenixEnergyBackground.css";

interface MutableNumberRef {
  current: number;
}

interface PointerPosition {
  x: number;
  y: number;
}

interface PhoenixEnergyBackgroundProps {
  progressRef: MutableNumberRef;
  sectionRef: React.RefObject<HTMLElement | null>;
}

interface SceneLayerProps {
  progressRef: MutableNumberRef;
  pointerRef: React.RefObject<PointerPosition>;
  reducedMotion: boolean;
}

const VORTEX_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform vec2 uCenter;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.54;
    mat2 turn = mat2(0.81, -0.58, 0.58, 0.81);
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = turn * p * 2.04 + 7.31;
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - uCenter;
    p.x *= 1.62;
    p += uPointer * vec2(0.022, 0.014);

    float stageTwo = smoothstep(0.22, 0.53, uProgress);
    float resolved = smoothstep(0.68, 0.98, uProgress);
    float time = uTime * 0.035;
    float radius = length(p);
    float angle = atan(p.y, p.x);
    vec2 polarFlow = vec2(angle * 1.15 - time * 1.8, log(radius + 0.08) * 3.7 - time);
    vec2 warp = vec2(
      fbm(polarFlow * 1.18 + vec2(1.4, -time)),
      fbm(polarFlow * 1.07 + vec2(8.2, time * 0.72))
    ) - 0.5;

    float foldedSmoke = fbm(polarFlow * 1.72 + warp * 2.2);
    float billow = fbm(p * vec2(4.8, 5.7) + warp * 2.8 + vec2(-time * 1.4, time * 0.42));
    float fineSmoke = fbm(p * 9.5 - warp * 3.1 + vec2(time * 0.7, -time * 0.4));
    float vortexMask = 1.0 - smoothstep(0.11, 0.92, radius);
    float tornEdge = smoothstep(0.34, 0.79, foldedSmoke * 0.68 + billow * 0.48);
    float smoke = tornEdge * vortexMask * (0.52 + fineSmoke * 0.48);

    vec2 plumeP = uv - vec2(mix(0.16, 0.25, stageTwo), mix(0.89, 0.76, stageTwo));
    plumeP = mat2(0.86, -0.51, 0.51, 0.86) * plumeP;
    float plumeNoise = fbm(plumeP * vec2(3.1, 8.4) + vec2(-time * 1.1, time * 0.5));
    float plume = smoothstep(0.3, 0.83, plumeNoise) * exp(-length(plumeP * vec2(1.0, 0.56)) * 2.4);

    float distantHaze = fbm(uv * vec2(2.8, 3.6) + vec2(time * 0.16, -time * 0.11));
    distantHaze = smoothstep(0.48, 0.82, distantHaze) * (1.0 - smoothstep(0.22, 0.98, length(uv - vec2(0.5, 0.55))));

    float density = smoke * mix(0.58, 1.06, stageTwo) + plume * 0.42 + distantHaze * 0.11;
    density *= mix(0.92, 0.82, resolved);
    vec3 soot = vec3(0.018, 0.006, 0.004);
    vec3 emberFog = vec3(0.31, 0.022, 0.003);
    vec3 hotFog = vec3(0.94, 0.115, 0.008);
    vec3 color = mix(soot, emberFog, smoothstep(0.08, 0.48, density));
    color = mix(color, hotFog, smoothstep(0.48, 0.93, density) * (0.55 + stageTwo * 0.45));
    color *= 0.72 + foldedSmoke * 0.48;

    float alpha = clamp(density * 0.62, 0.0, 0.64);
    alpha *= 1.0 - smoothstep(0.56, 1.08, length((uv - vec2(0.42, 0.61)) * vec2(0.86, 1.0)));
    gl_FragColor = vec4(color, alpha);
  }
`;

const VORTEX_FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform vec2 uCenter;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.53;
    mat2 rotation = mat2(0.79, -0.61, 0.61, 0.79);
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.02 + 8.13;
      amplitude *= 0.47;
    }
    return value;
  }

  float ridge(float value) {
    return 1.0 - abs(value * 2.0 - 1.0);
  }

  void main() {
    vec2 p = vUv - uCenter;
    p.x *= 1.32;
    p += uPointer * vec2(0.018, 0.012);

    float formed = smoothstep(0.18, 0.58, uProgress);
    float resolved = smoothstep(0.66, 0.98, uProgress);
    p *= mix(1.28, 0.91, formed);
    float time = uTime * 0.055;

    vec2 firstWarp = vec2(
      fbm(p * 3.15 + vec2(time * 0.75, -time * 0.36)),
      fbm(p * 3.15 + vec2(7.6 - time * 0.42, 2.8 + time * 0.61))
    ) - 0.5;
    vec2 warpedP = p + firstWarp * mix(0.23, 0.14, formed);
    float radius = length(warpedP);
    float angle = atan(warpedP.y, warpedP.x);
    float granular = fbm(warpedP * 10.4 + firstWarp * 3.0 - vec2(time * 0.62, time * 0.28));
    float turbulent = fbm(vec2(angle * 1.4, radius * 8.6) + firstWarp * 2.6 - vec2(time * 2.4, time * 0.5));
    float spiral = angle * mix(2.35, 3.15, formed) + radius * mix(15.0, 20.0, formed) - time * 6.2 + (turbulent - 0.5) * 4.1;

    float broadRibbon = pow(max(0.0, 0.5 + 0.5 * sin(spiral)), mix(3.2, 5.8, resolved));
    float splitRibbon = pow(max(0.0, 0.5 + 0.5 * sin(spiral * 1.63 + granular * 4.2 + 1.2)), 10.0);
    float hairline = pow(max(0.0, 0.5 + 0.5 * sin(spiral * 2.7 - radius * 21.0)), 23.0);
    float radialEnvelope = (1.0 - smoothstep(0.09, 0.78, radius)) * smoothstep(0.025, 0.105, radius);
    float brokenEdge = smoothstep(0.25, 0.82, ridge(granular)) * (0.52 + turbulent * 0.48);
    float plasma = (broadRibbon * 0.72 + splitRibbon * 0.54 + hairline * 0.32) * radialEnvelope * brokenEdge;

    float ringOne = exp(-abs(radius - mix(0.22, 0.28, formed)) * mix(16.0, 24.0, resolved));
    float ringTwo = exp(-abs(radius - mix(0.39, 0.44, formed)) * 17.0) * 0.48;
    plasma *= 0.42 + ringOne + ringTwo;

    float coreBreath = 0.94 + sin(uTime * 0.38) * 0.06;
    float coreShape = radius + (granular - 0.5) * 0.072;
    float hotCore = exp(-coreShape * mix(9.8, 13.6, resolved)) * coreBreath;
    float whiteCenter = exp(-coreShape * 29.0) * (0.78 + granular * 0.52);
    float corona = exp(-abs(coreShape - 0.115) * 23.0) * (0.36 + turbulent * 0.64);
    float energy = hotCore * 1.14 + whiteCenter * 2.15 + corona * 0.72 + plasma * mix(0.72, 1.28, formed);
    vec3 deepEmber = vec3(0.18, 0.006, 0.001);
    vec3 bloodOrange = vec3(0.71, 0.038, 0.002);
    vec3 moltenOrange = vec3(1.0, 0.235, 0.012);
    vec3 whiteHeat = vec3(1.0, 0.79, 0.40);
    vec3 color = mix(deepEmber, bloodOrange, smoothstep(0.025, 0.34, energy));
    color = mix(color, moltenOrange, smoothstep(0.28, 0.94, energy));
    color = mix(color, whiteHeat, smoothstep(1.0, 2.1, energy));
    color *= 0.86 + granular * 0.56;

    float alpha = clamp(energy * mix(0.82, 1.14, formed), 0.0, 0.985);
    alpha *= 1.0 - smoothstep(0.48, 0.86, radius);
    gl_FragColor = vec4(color, alpha);
  }
`;

const PARTICLE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    vec3 transformed = position;
    transformed.x += sin(uTime * (0.018 + aSeed * 0.035) + aSeed * 31.0) * (0.022 + uProgress * 0.018);
    transformed.y += cos(uTime * (0.015 + aSeed * 0.028) + aSeed * 17.0) * 0.022;
    transformed.xy += uPointer * (0.035 + aSeed * 0.065) * (1.0 + transformed.z * 0.08);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    float brightStar = step(0.91, aSeed);
    gl_PointSize = (0.92 + aSeed * 1.28 + brightStar * 1.5) * (13.0 / max(2.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PARTICLE_FRAGMENT_SHADER = `
  precision highp float;
  uniform float uProgress;
  varying float vSeed;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float disc = 1.0 - smoothstep(0.06, 0.5, length(point));
    float brightStar = step(0.91, vSeed);
    float emberStar = step(0.72, vSeed) * (1.0 - brightStar);
    vec3 coldWhite = vec3(0.72, 0.84, 0.92);
    vec3 warmWhite = vec3(1.0, 0.83, 0.64);
    vec3 ember = vec3(1.0, 0.16, 0.018);
    vec3 color = mix(coldWhite, warmWhite, step(0.42, vSeed));
    color = mix(color, ember, emberStar);
    float alpha = disc * (0.21 + vSeed * 0.34 + brightStar * 0.44) * mix(0.72, 1.0, uProgress);
    gl_FragColor = vec4(color, alpha);
  }
`;

const TRAIL_VERTEX_SHADER = `
  varying float vTrailPosition;

  void main() {
    vTrailPosition = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TRAIL_FRAGMENT_SHADER = `
  precision highp float;
  uniform float uTime;
  uniform float uProgress;
  uniform float uStrength;
  varying float vTrailPosition;

  void main() {
    float structured = smoothstep(0.2, 0.62, uProgress);
    float resolved = smoothstep(0.68, 0.97, uProgress);
    float head = pow(max(0.0, sin(vTrailPosition * 31.0 - uTime * 0.66)), 14.0);
    float longPulse = pow(max(0.0, sin(vTrailPosition * 8.0 - uTime * 0.19)), 8.0);
    float taper = smoothstep(0.0, 0.16, vTrailPosition) * (1.0 - smoothstep(0.72, 1.0, vTrailPosition));
    float precisionBoost = mix(0.72, 1.0, resolved);
    float alpha = (0.105 + head * 0.84 + longPulse * 0.24) * taper * uStrength * mix(0.3, 1.0, structured) * precisionBoost;
    vec3 color = mix(vec3(0.38, 0.018, 0.002), vec3(1.0, 0.32, 0.055), head + structured * 0.24);
    color = mix(color, vec3(1.0, 0.69, 0.31), head * 0.58);
    gl_FragColor = vec4(color, alpha);
  }
`;

function seededValue(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function AtmospherePlane({ pointerRef, reducedMotion }: SceneLayerProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const smoothedPointer = useRef(new THREE.Vector2());
  const mobile = size.width < 700;

  const uniforms = useMemo(() => ({
    uTime: { value: reducedMotion ? 11.4 : 0 },
    uProgress: { value: 0.52 },
    uPointer: { value: new THREE.Vector2() },
    uCenter: { value: new THREE.Vector2(mobile ? 0.5 : 0.3, mobile ? 0.76 : 0.72) },
  }), [mobile, reducedMotion]);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current || !groupRef.current) return;
    smoothedPointer.current.x = THREE.MathUtils.damp(smoothedPointer.current.x, pointerRef.current.x, 1.8, delta);
    smoothedPointer.current.y = THREE.MathUtils.damp(smoothedPointer.current.y, pointerRef.current.y, 1.8, delta);
    materialRef.current.uniforms.uTime.value = reducedMotion ? 11.4 : clock.elapsedTime;
    materialRef.current.uniforms.uPointer.value.copy(smoothedPointer.current);
    groupRef.current.position.x = smoothedPointer.current.x * 0.045;
    groupRef.current.position.y = smoothedPointer.current.y * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, 0, -2.05]}>
      <mesh scale={[viewport.width * (mobile ? 1.18 : 1.28), viewport.height * (mobile ? 1.18 : 1.28), 1]} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          vertexShader={VORTEX_VERTEX_SHADER}
          fragmentShader={ATMOSPHERE_FRAGMENT_SHADER}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function VortexPlane({ reducedMotion }: SceneLayerProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const mobile = size.width < 700;

  const uniforms = useMemo(() => ({
    uTime: { value: 7.2 },
    uProgress: { value: reducedMotion ? 1 : 0.44 },
    uPointer: { value: new THREE.Vector2() },
    uCenter: { value: new THREE.Vector2(mobile ? 0.5 : 0.285, mobile ? 0.76 : 0.72) },
  }), [mobile, reducedMotion]);

  return (
    <group position={[0, 0, -1.72]}>
      <mesh scale={[viewport.width * (mobile ? 1.15 : 1.24), viewport.height * (mobile ? 1.15 : 1.24), 1]} renderOrder={1}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={VORTEX_VERTEX_SHADER}
          fragmentShader={VORTEX_FRAGMENT_SHADER}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ParticleField({ progressRef, pointerRef, reducedMotion }: SceneLayerProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const size = useThree((state) => state.size);
  const count = size.width < 600 ? 160 : size.width < 1000 ? 360 : 820;
  const smoothedProgress = useRef(reducedMotion ? 1 : 0);

  const { positions, seeds } = useMemo(() => {
    const pointPositions = new Float32Array(count * 3);
    const pointSeeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const x = seededValue(index, 1) * 17 - 8.5;
      const y = seededValue(index, 2) * 9.5 - 4.75;
      const z = seededValue(index, 3) * 3.6 - 2.8;
      pointPositions[index * 3] = x;
      pointPositions[index * 3 + 1] = y;
      pointPositions[index * 3 + 2] = z;
      pointSeeds[index] = seededValue(index, 4);
    }
    return { positions: pointPositions, seeds: pointSeeds };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: reducedMotion ? 4.8 : 0 },
    uProgress: { value: reducedMotion ? 1 : 0 },
    uPointer: { value: new THREE.Vector2() },
  }), [reducedMotion]);

  useFrame(({ clock }, delta) => {
    if (!materialRef.current || !pointsRef.current) return;
    smoothedProgress.current = THREE.MathUtils.damp(smoothedProgress.current, progressRef.current, 3.8, delta);
    materialRef.current.uniforms.uTime.value = reducedMotion ? 4.8 : clock.elapsedTime;
    materialRef.current.uniforms.uProgress.value = smoothedProgress.current;
    materialRef.current.uniforms.uPointer.value.set(pointerRef.current.x, pointerRef.current.y);
    if (!reducedMotion) pointsRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.025) * 0.018;
  });

  return (
    <points ref={pointsRef} position={[0, 0, -1.2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={PARTICLE_VERTEX_SHADER}
        fragmentShader={PARTICLE_FRAGMENT_SHADER}
        uniforms={uniforms}
        toneMapped={false}
      />
    </points>
  );
}

interface EnergyTrailProps extends SceneLayerProps {
  points: THREE.Vector3[];
  strength: number;
}

function EnergyTrail({ points, strength, progressRef, reducedMotion }: EnergyTrailProps) {
  const trailRef = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>>(null);
  const smoothedProgress = useRef(reducedMotion ? 1 : 0);

  const trail = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 72, 0.009 + strength * 0.007, 3, false);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      uniforms: {
        uTime: { value: reducedMotion ? 6.4 : 0 },
        uProgress: { value: reducedMotion ? 1 : 0 },
        uStrength: { value: strength },
      },
      vertexShader: TRAIL_VERTEX_SHADER,
      fragmentShader: TRAIL_FRAGMENT_SHADER,
    });
    return new THREE.Mesh(geometry, material);
  }, [points, reducedMotion, strength]);

  useEffect(() => () => {
    trail.geometry.dispose();
    trail.material.dispose();
  }, [trail]);

  useFrame(({ clock }, delta) => {
    const activeTrail = trailRef.current;
    if (!activeTrail) return;
    smoothedProgress.current = THREE.MathUtils.damp(smoothedProgress.current, progressRef.current, 4, delta);
    activeTrail.material.uniforms.uTime.value = reducedMotion ? 6.4 : clock.elapsedTime;
    activeTrail.material.uniforms.uProgress.value = smoothedProgress.current;
  });

  return <primitive ref={trailRef} object={trail} />;
}

function EnergyTrails({ progressRef, pointerRef, reducedMotion }: SceneLayerProps) {
  const size = useThree((state) => state.size);
  const groupRef = useRef<THREE.Group>(null);
  const isMobile = size.width < 700;
  const trailOne = useMemo(() => [
    new THREE.Vector3(-2.8, 1.7, -0.9),
    new THREE.Vector3(-1.2, 0.7, -0.7),
    new THREE.Vector3(0.15, -0.35, -0.55),
    new THREE.Vector3(3.9, -2.1, -0.8),
  ], []);
  const trailTwo = useMemo(() => [
    new THREE.Vector3(-3.0, 1.35, -1.1),
    new THREE.Vector3(-1.5, 0.2, -0.95),
    new THREE.Vector3(1.2, 0.3, -0.9),
    new THREE.Vector3(4.4, -0.45, -1.0),
  ], []);
  const trailThree = useMemo(() => [
    new THREE.Vector3(-2.45, 1.8, -1.4),
    new THREE.Vector3(-0.7, 1.1, -1.25),
    new THREE.Vector3(1.5, 1.55, -1.25),
    new THREE.Vector3(4.6, 0.85, -1.4),
  ], []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, pointerRef.current.x * 0.025, 2.2, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, pointerRef.current.y * 0.02, 2.2, delta);
  });

  return (
    <group ref={groupRef}>
      <EnergyTrail points={trailOne} strength={1.18} progressRef={progressRef} pointerRef={pointerRef} reducedMotion={reducedMotion} />
      {!isMobile && <EnergyTrail points={trailTwo} strength={0.82} progressRef={progressRef} pointerRef={pointerRef} reducedMotion={reducedMotion} />}
      {!isMobile && size.width >= 1100 && <EnergyTrail points={trailThree} strength={0.56} progressRef={progressRef} pointerRef={pointerRef} reducedMotion={reducedMotion} />}
    </group>
  );
}

function EnergyScene(props: SceneLayerProps) {
  return (
    <>
      <AtmospherePlane {...props} />
      <ParticleField {...props} />
      <VortexPlane {...props} />
      <EnergyTrails {...props} />
    </>
  );
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function useCanvasDprCap() {
  const getCap = () => {
    const tier = getPerformanceTier();
    if (tier === "low") return 1;
    return tier === "balanced" ? 1.1 : 1.2;
  };
  const [dprCap, setDprCap] = useState(getCap);

  useEffect(() => {
    const updateCap = () => setDprCap(getCap());
    window.addEventListener("resize", updateCap, { passive: true });
    return () => window.removeEventListener("resize", updateCap);
  }, []);

  return dprCap;
}

export default function PhoenixEnergyBackground({ progressRef, sectionRef }: PhoenixEnergyBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const dprCap = useCanvasDprCap();
  const [isVisible, setIsVisible] = useState(false);
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: "20% 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef]);

  useEffect(() => {
    const section = sectionRef.current;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!section || !precisePointer || reducedMotion) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      pointerRef.current.x = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(-((event.clientY - rect.top) / window.innerHeight - 0.5) * 2, -1, 1);
    };
    const resetPointer = () => { pointerRef.current = { x: 0, y: 0 }; };
    section.addEventListener("pointermove", handlePointerMove, { passive: true });
    section.addEventListener("pointerleave", resetPointer);
    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", resetPointer);
    };
  }, [reducedMotion, sectionRef]);

  return (
    <div className={`phoenix-energy-background${reducedMotion ? " is-reduced-motion" : ""}${isVisible ? " is-visible" : ""}`} aria-hidden="true">
      <div className="phoenix-energy-static" />
      <div className="phoenix-energy-grid">
        <span className="energy-coordinate energy-coordinate-one" />
        <span className="energy-coordinate energy-coordinate-two" />
        <span className="energy-coordinate energy-coordinate-three" />
      </div>
      <div className="phoenix-energy-stars" />
      {isVisible && !reducedMotion && (
        <Canvas
          className="phoenix-energy-canvas"
          frameloop="always"
          dpr={[1, dprCap]}
          camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 30 }}
          gl={{ alpha: true, antialias: false, powerPreference: dprCap === 1 ? "low-power" : "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1;
          }}
        >
          <EnergyScene progressRef={progressRef} pointerRef={pointerRef} reducedMotion={reducedMotion} />
        </Canvas>
      )}
      <div className="phoenix-energy-mechanics">
        <div className="energy-rail energy-rail-one"><i /><i /><i /></div>
        <div className="energy-rail energy-rail-two"><i /><i /></div>
        <div className="energy-bracket"><span /><span /><span /></div>
      </div>
      <svg className="phoenix-energy-data-overlay" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M38 742 C270 760 430 664 560 568 S850 496 1120 565" />
        <path d="M220 808 C420 760 470 678 635 648 S955 635 1290 720" />
        <g><circle cx="225" cy="802" r="2" /><circle cx="558" cy="570" r="2" /><circle cx="1118" cy="565" r="2" /></g>
      </svg>
      <div className="phoenix-energy-readability" />
      <div className="phoenix-energy-vignette" />
    </div>
  );
}
