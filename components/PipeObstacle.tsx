
import React from 'react';
import { PIPE_WIDTH } from '../constants';

interface PipeObstacleProps {
  x: number;
  y: number; // Top Y position of this pipe segment
  height: number;
  isTopPipe: boolean;
}

const PipeObstacle: React.FC<PipeObstacleProps> = ({ x, y, height, isTopPipe }) => {
  return (
    <div
      className="absolute bg-green-600 border-2 border-green-800"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${PIPE_WIDTH}px`,
        height: `${height}px`,
      }}
    >
      {/* Pipe cap for a bit more detail */}
      <div 
        className={`absolute w-full bg-green-700 border-x-2 border-green-800 ${isTopPipe ? 'bottom-0 h-6 rounded-b-md' : 'top-0 h-6 rounded-t-md'}`}
        style={{ left: '-2px', right:'-2px', width: `calc(100% + 4px)`}}
      />
    </div>
  );
};

export default PipeObstacle;