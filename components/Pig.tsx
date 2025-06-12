
import React, { useState, useEffect } from 'react';
import { PIG_SIZE_W, PIG_SIZE_H, PIG_X_POSITION } from '../constants';

interface PigProps {
  pigY: number;
  pigRotation: number;
  isFlapping: boolean;
}

const Pig: React.FC<PigProps> = ({ pigY, pigRotation, isFlapping }) => {
  const [wingRotation, setWingRotation] = useState(0);

  useEffect(() => {
    if (isFlapping) {
      setWingRotation(-45); // Wing up
      const timer = setTimeout(() => setWingRotation(15), 100); // Wing down after short delay
      return () => clearTimeout(timer);
    } else {
      setWingRotation(15); // Default wing position
    }
  }, [isFlapping]);

  return (
    <div
      className="absolute transition-transform duration-50 ease-linear"
      style={{
        width: `${PIG_SIZE_W}px`,
        height: `${PIG_SIZE_H}px`,
        top: `${pigY}px`,
        left: `${PIG_X_POSITION}px`,
        transform: `rotate(${pigRotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <svg viewBox="0 0 60 48" className="w-full h-full pixelated">
        {/* Body */}
        <ellipse cx="30" cy="24" rx="22" ry="16" className="fill-pink-400 stroke-pink-600" strokeWidth="1.5"/>
        {/* Snout */}
        <ellipse cx="50" cy="24" rx="8" ry="6" className="fill-pink-300 stroke-pink-500" strokeWidth="1"/>
        <circle cx="48" cy="24" r="1.5" className="fill-pink-500"/>
        <circle cx="52" cy="24" r="1.5" className="fill-pink-500"/>
        {/* Eye */}
        <ellipse cx="38" cy="18" rx="4" ry="5" className="fill-white stroke-black" strokeWidth="0.5"/>
        <circle cx="39" cy="18" r="1.5" className="fill-black"/>
        {/* Ear */}
        <path d="M 25 10 C 20 2, 30 2, 28 12 Z" className="fill-pink-400 stroke-pink-600" strokeWidth="1"/>
        {/* Wing */}
        <path
          d="M 28 25 Q 5 15, 25 8 Q 40 15, 28 25 Z"
          className="fill-pink-200 stroke-pink-400 transition-transform duration-100 ease-out"
          strokeWidth="1"
          style={{ transform: `rotate(${wingRotation}deg)`, transformOrigin: '28px 25px' }}
        />
        {/* Tiny feet */}
        <rect x="25" y="38" width="5" height="8" rx="2" className="fill-pink-300 stroke-pink-500" strokeWidth="0.5" />
        <rect x="33" y="38" width="5" height="8" rx="2" className="fill-pink-300 stroke-pink-500" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export default Pig;