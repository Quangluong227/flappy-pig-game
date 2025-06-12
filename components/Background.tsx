
import React, { useState, useEffect, useMemo } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, CLOUD_COUNT, CLOUD_MIN_Y, CLOUD_MAX_Y, CLOUD_MIN_SPEED, CLOUD_MAX_SPEED, SKY_HEIGHT, INITIAL_PIPE_SPEED } from '../constants';

interface Cloud {
  id: number;
  x: number;
  y: number;
  speed: number;
  parts: { offsetX: number, offsetY: number, size: number }[]; // For complex cloud shapes
}

const createCloudPart = () => ({
  offsetX: Math.random() * 20 - 10, // Small offsets for irregularity
  offsetY: Math.random() * 10 - 5,
  size: Math.random() * 20 + 20, // Size of cloud puffs
});

const generateCloud = (id: number): Cloud => {
  const coreX = Math.random() * GAME_WIDTH;
  const coreY = CLOUD_MIN_Y + Math.random() * (CLOUD_MAX_Y - CLOUD_MIN_Y);
  return {
    id,
    x: coreX,
    y: coreY,
    speed: CLOUD_MIN_SPEED + Math.random() * (CLOUD_MAX_SPEED - CLOUD_MIN_SPEED),
    parts: Array.from({ length: Math.floor(Math.random() * 3) + 3 }, createCloudPart), // 3-5 parts per cloud
  };
};

interface BackgroundProps {
  gameSpeed: number;
}

const Background: React.FC<BackgroundProps> = ({ gameSpeed }) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [groundOffset, setGroundOffset] = useState(0);

  useEffect(() => {
    setClouds(Array.from({ length: CLOUD_COUNT }, (_, i) => generateCloud(i)));
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const update = () => {
      setClouds(prevClouds =>
        prevClouds.map(cloud => {
          let newX = cloud.x - cloud.speed * (gameSpeed / INITIAL_PIPE_SPEED) * 0.5; // Clouds move slower than pipes
          if (newX < -100) { // Reset cloud if it goes off-screen
            return { ...generateCloud(cloud.id), x: GAME_WIDTH + 50 };
          }
          return { ...cloud, x: newX };
        })
      );
      setGroundOffset(prev => (prev - gameSpeed * 0.8) % (GAME_WIDTH / 2)); // Ground scrolls, adjust multiplier for desired effect
      animationFrameId = requestAnimationFrame(update);
    };
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameSpeed]);

  const groundPattern = useMemo(() => {
    const grassBlade = (color: string, height: string, key: number) => (
      <div key={`gb-${key}`} className={`absolute bottom-0 w-2 ${height} ${color} opacity-70 rounded-t-sm`} style={{left: `${key*4}px`}}></div>
    );
    const patternWidth = GAME_WIDTH * 1.5; // Ensure seamless wrapping
    return Array.from({length: Math.ceil(patternWidth / 4)}).map((_, i) =>
      grassBlade(i % 3 === 0 ? 'bg-emerald-700' : (i % 3 === 1 ? 'bg-green-700' : 'bg-lime-700'), 
                 i % 5 === 0 ? 'h-4' : (i % 5 === 1 ? 'h-6' : 'h-5'), i)
    );
  }, []);


  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-sky-400" style={{height: `${SKY_HEIGHT}px`}} />

      {/* Clouds */}
      {clouds.map(cloud => (
        <div key={cloud.id} className="absolute" style={{ top: `${cloud.y}px`, left: `${cloud.x}px` }}>
          {cloud.parts.map((part, index) => (
            <div
              key={index}
              className="absolute bg-white opacity-80 rounded-full"
              style={{
                width: `${part.size}px`,
                height: `${part.size * 0.7}px`, // Make them slightly oval
                left: `${part.offsetX}px`,
                top: `${part.offsetY}px`,
              }}
            />
          ))}
        </div>
      ))}
      
      {/* Ground */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-lime-600 border-t-4 border-green-800"
        style={{ height: `${GROUND_HEIGHT}px` }}
      >
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full flex" style={{ width: `${GAME_WIDTH * 2}px`, transform: `translateX(${groundOffset}px)` }}>
            {/* Simple repeating pattern for ground */}
            <div className="w-1/2 h-full relative">{groundPattern}</div>
            <div className="w-1/2 h-full relative">{groundPattern}</div>
          </div>
        </div>
         {/* A simple decorative strip on top of ground */}
        <div className="absolute top-0 left-0 w-full h-3 bg-green-700 opacity-50"/>
      </div>
    </div>
  );
};

export default Background;