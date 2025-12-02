import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleShape, InteractionState } from '../types';
import { generateShapePositions, PARTICLE_COUNT } from '../constants';

interface ParticlesProps {
  shape: ParticleShape;
  color: string;
  interaction: InteractionState;
}

const Particles: React.FC<ParticlesProps> = ({ shape, color, interaction }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Current positions of particles
  const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Target positions based on shape
  const targetPositions = useMemo(() => {
    return generateShapePositions(shape, PARTICLE_COUNT);
  }, [shape]);

  // Initialize current positions
  useEffect(() => {
    // Start from random if first load, or just morph
    if (currentPositions.current.length === 0) {
       currentPositions.current.set(targetPositions);
    }
  }, [targetPositions]);

  // Reusable vectors/colors
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    // Lerp factors
    const morphSpeed = 3.0 * delta;
    
    // Interaction smoothing
    // We assume interaction props update less frequently, so we might want to internalize smoothing here if needed
    // But for now, we use them directly as targets.
    
    const expansionFactor = 1 + interaction.expansion * 2.0; // Scale 1x to 3x
    const tensionJitter = interaction.tension * 0.1; // Jitter amount

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // 1. Get Base Target
      const tx = targetPositions[ix];
      const ty = targetPositions[iy];
      const tz = targetPositions[iz];

      // 2. Apply Expansion (Scale target)
      // Special case for Fireworks: animate out from center
      let sx = tx, sy = ty, sz = tz;
      
      if (shape === ParticleShape.FIREWORKS) {
         const explosion = (Math.sin(time * 0.5) + 1) * 2; // Pulse
         sx *= (explosion + interaction.expansion * 3);
         sy *= (explosion + interaction.expansion * 3);
         sz *= (explosion + interaction.expansion * 3);
      } else {
         sx *= expansionFactor;
         sy *= expansionFactor;
         sz *= expansionFactor;
      }

      // 3. Apply Tension (Noise/Vibration)
      if (interaction.tension > 0.05) {
         sx += (Math.random() - 0.5) * tensionJitter;
         sy += (Math.random() - 0.5) * tensionJitter;
         sz += (Math.random() - 0.5) * tensionJitter;
      }

      // 4. Update Current Position (Morphing)
      currentPositions.current[ix] += (sx - currentPositions.current[ix]) * morphSpeed;
      currentPositions.current[iy] += (sy - currentPositions.current[iy]) * morphSpeed;
      currentPositions.current[iz] += (sz - currentPositions.current[iz]) * morphSpeed;

      // 5. Apply "Floating" idle animation
      const floatX = Math.sin(time * 0.5 + i * 0.1) * 0.02;
      const floatY = Math.cos(time * 0.3 + i * 0.1) * 0.02;

      positions[ix] = currentPositions.current[ix] + floatX;
      positions[iy] = currentPositions.current[iy] + floatY;
      positions[iz] = currentPositions.current[iz];
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate entire group slowly
    pointsRef.current.rotation.y += delta * 0.1 * (1 + interaction.tension * 5); // Spin faster with tension
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={threeColor}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Particles;
