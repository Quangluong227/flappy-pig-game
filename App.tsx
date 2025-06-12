import React from 'react';
import GameArea from './components/GameArea';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <header className="my-4">
        <h1 className="text-4xl font-bold text-white tracking-wide">Flappy Pig</h1>
      </header>
      <div
        className="game-container shadow-2xl border-4 border-amber-300"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        <GameArea />
      </div>
      <footer className="my-4 text-center text-white text-sm">
        <p>Tap or Click to Fly!</p>
        <p>Deployed by Cao Quang Luong</p>
      </footer>
    </div>
  );
};

export default App;
