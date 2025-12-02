import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Particles from './components/Particles';
import Controls from './components/Controls';
import { ParticleShape, InteractionState } from './types';
import { DEFAULT_COLOR } from './constants';
import { GeminiLiveService } from './services/gemini';

function App() {
  const [shape, setShape] = useState<ParticleShape>(ParticleShape.HEART);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [isConnected, setIsConnected] = useState(false);
  const [interaction, setInteraction] = useState<InteractionState>({
    tension: 0,
    expansion: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const geminiService = useRef<GeminiLiveService | null>(null);

  const handleConnect = async () => {
    if (!process.env.API_KEY) {
      alert("API_KEY not found in environment.");
      return;
    }

    if (videoRef.current) {
        geminiService.current = new GeminiLiveService(process.env.API_KEY, (newState) => {
            // Smooth updates could happen here, but we pass raw for now
            // React state updates might be too slow for 60fps logic if triggered too fast
            // but for 2-5fps AI updates it's fine.
            setInteraction(prev => ({
                tension: 0.7 * prev.tension + 0.3 * newState.tension, // simple smoothing
                expansion: 0.7 * prev.expansion + 0.3 * newState.expansion
            }));
        });
        
        try {
            await geminiService.current.connect(videoRef.current);
            setIsConnected(true);
        } catch (error) {
            console.error("Connection failed", error);
            alert("Failed to connect to Gemini Live API. Check console.");
        }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Hidden Video Element for Input */}
      <video 
        ref={videoRef} 
        className="absolute opacity-0 pointer-events-none" 
        playsInline 
        muted 
        width="640" 
        height="480"
      />

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Particles 
            shape={shape} 
            color={color} 
            interaction={interaction} 
        />
        
        <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate={!isConnected && interaction.tension < 0.1} 
            autoRotateSpeed={0.5} 
        />
      </Canvas>

      {/* UI Overlay */}
      <Controls 
        currentShape={shape} 
        setShape={setShape} 
        color={color} 
        setColor={setColor}
        interaction={interaction}
        isConnected={isConnected}
        onConnect={handleConnect}
      />
    </div>
  );
}

export default App;
