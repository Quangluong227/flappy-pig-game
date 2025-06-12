
import React from 'react';
import GameArea from './components/GameArea';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-400 game-font">
      <header className="my-4">
        <h1 className="text-4xl font-bold text-white tracking-wider" style={{textShadow: '2px 2px #f87171'}}>Flappy Pig</h1>
      </header>
      <div
        className="game-container shadow-2xl border-4 border-amber-800 rounded-lg"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        <GameArea />
      </div>
      <footer className="my-4 text-center text-white text-sm">
        <p>Tap or Click to Fly!</p>
        <p>Inspired by Cao Quang Luong's Flappy Big</p>
      </footer>
    </div>
  );
};

export default App;