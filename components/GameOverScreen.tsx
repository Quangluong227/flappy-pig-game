
import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRetry: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRetry }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20 game-font">
      <div className="bg-amber-100 p-8 rounded-lg shadow-xl border-4 border-amber-700 text-center">
        <h2 className="text-5xl font-bold text-red-600 mb-4" style={{textShadow: '2px 2px #000'}}>Game Over!</h2>
        <p className="text-3xl text-gray-700 mb-2">Your Score:</p>
        <p className="text-6xl font-bold text-yellow-500 mb-8" style={{textShadow: '2px 2px #000'}}>{score}</p>
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-green-500 text-white text-2xl font-semibold rounded-lg shadow-md hover:bg-green-600 active:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;