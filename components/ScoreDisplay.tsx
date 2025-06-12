
import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <p className="text-5xl font-bold text-white" style={{ WebkitTextStroke: '2px black', textShadow: '3px 3px 0 #000' }}>
        {score}
      </p>
    </div>
  );
};

export default ScoreDisplay;