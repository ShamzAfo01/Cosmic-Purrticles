import React from 'react';
import { ParticleShape, InteractionState } from '../types';
import { Camera, Activity, Maximize2, Palette } from 'lucide-react';

interface ControlsProps {
  currentShape: ParticleShape;
  setShape: (s: ParticleShape) => void;
  color: string;
  setColor: (c: string) => void;
  interaction: InteractionState;
  isConnected: boolean;
  onConnect: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  setShape,
  color,
  setColor,
  interaction,
  isConnected,
  onConnect
}) => {
  const shapes = Object.values(ParticleShape);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header / Status */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ZenParticles 3D
          </h1>
          <p className="text-xs text-gray-400 mt-1">Interactive Generative Art</p>
        </div>

        <div className="flex flex-col gap-2 items-end">
           <button
            onClick={isConnected ? undefined : onConnect}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              isConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            }`}
          >
            <Camera size={18} />
            {isConnected ? 'Vision Active' : 'Start Camera'}
          </button>

          {isConnected && (
            <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white text-xs w-48">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1 text-gray-300"><Activity size={14}/> Tension</span>
                <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-400 transition-all duration-300" 
                    style={{ width: `${interaction.tension * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-300"><Maximize2 size={14}/> Expansion</span>
                <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-300" 
                    style={{ width: `${interaction.expansion * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pointer-events-auto flex flex-col md:flex-row gap-4 items-end md:items-center justify-center pb-4">
        
        {/* Shape Selector */}
        <div className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex gap-1 overflow-x-auto max-w-[90vw]">
          {shapes.map((shape) => (
            <button
              key={shape}
              onClick={() => setShape(shape)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                currentShape === shape
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center gap-2">
          <Palette size={18} className="text-gray-300 ml-2" />
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent"
          />
        </div>

      </div>
    </div>
  );
};

export default Controls;
