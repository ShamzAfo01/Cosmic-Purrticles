import { ParticleShape } from './types';
import * as THREE from 'three';

export const PARTICLE_COUNT = 3000;
export const DEFAULT_COLOR = '#4f46e5'; // Indigo 600

// Helper to get point on sphere
const getSpherePoint = () => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 2;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper for Heart shape
const getHeartPoint = () => {
  const t = Math.random() * Math.PI * 2;
  const u = Math.random() * Math.PI; // distribution
  // Parametric heart
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
  const scale = 0.15;
  // Extrude slightly for 3D volume
  const z = (Math.random() - 0.5) * 5; 
  
  return new THREE.Vector3(x * scale, y * scale, z * scale);
};

// Helper for Flower
const getFlowerPoint = () => {
  const u = Math.random() * Math.PI * 2;
  const v = Math.random() * Math.PI;
  const r = 2 + Math.sin(5 * u) * Math.sin(5 * v); // 5 petals
  return new THREE.Vector3(
    r * Math.sin(v) * Math.cos(u),
    r * Math.sin(v) * Math.sin(u),
    r * Math.cos(v)
  ).multiplyScalar(0.8);
};

// Helper for Saturn
const getSaturnPoint = () => {
  const isRing = Math.random() > 0.4;
  if (isRing) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 3 + Math.random() * 1.5;
    return new THREE.Vector3(
      Math.cos(angle) * dist,
      (Math.random() - 0.5) * 0.1, // Flat ring
      Math.sin(angle) * dist
    );
  } else {
    // Planet body
    const p = getSpherePoint();
    return p.multiplyScalar(0.7); // Smaller sphere
  }
};

// Helper for Meditator (Approximate Buddha with primitives)
const getMeditatorPoint = () => {
  const r = Math.random();
  // Simple stacked spheres/ovals approximation
  // Base (Legs)
  if (r < 0.4) {
    const theta = Math.random() * Math.PI * 2;
    const rad = 1.5;
    const h = (Math.random()) * 0.5;
    return new THREE.Vector3(rad * Math.cos(theta) * Math.sqrt(Math.random()), h - 1.5, rad * Math.sin(theta) * Math.sqrt(Math.random()));
  } 
  // Torso
  else if (r < 0.7) {
    const p = getSpherePoint().multiplyScalar(0.6);
    return p.add(new THREE.Vector3(0, -0.2, 0));
  }
  // Head
  else {
    const p = getSpherePoint().multiplyScalar(0.35);
    return p.add(new THREE.Vector3(0, 0.9, 0));
  }
};

// Helper for Fireworks
const getFireworksPoint = () => {
  // Just a sphere but we will animate expansion heavily in the shader/loop
  return getSpherePoint();
};

export const generateShapePositions = (shape: ParticleShape, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const dummy = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let p = new THREE.Vector3();
    switch (shape) {
      case ParticleShape.HEART: p = getHeartPoint(); break;
      case ParticleShape.FLOWER: p = getFlowerPoint(); break;
      case ParticleShape.SATURN: p = getSaturnPoint(); break;
      case ParticleShape.MEDITATOR: p = getMeditatorPoint(); break;
      case ParticleShape.FIREWORKS: p = getFireworksPoint(); break;
      case ParticleShape.SPHERE:
      default: p = getSpherePoint(); break;
    }
    
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }
  return positions;
};
