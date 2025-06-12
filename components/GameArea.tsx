
import React, { forwardRef, useImperativeHandle } from 'react';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Pipe, GameStatus } from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, PIG_X_POSITION, PIG_SIZE_W, PIG_SIZE_H,
  GRAVITY, FLAP_VELOCITY, MAX_VELOCITY, MIN_VELOCITY,
  PIPE_WIDTH, PIPE_GAP_HEIGHT, PIPE_SPAWN_X, PIPE_SPACING,
  INITIAL_PIPE_SPEED, PIPE_SPEED_INCREMENT, GROUND_HEIGHT
} from '../constants';
import Pig from './Pig';
import PipeObstacle from './PipeObstacle';
import ScoreDisplay from './ScoreDisplay';
import GameOverScreen from './GameOverScreen';
import Background from './Background';

const GameArea = forwardRef((props, ref) => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.Ready);
  const [pigY, setPigY] = useState<number>(GAME_HEIGHT / 2 - PIG_SIZE_H / 2);
  const [pigVelocity, setPigVelocity] = useState<number>(0);
  const [pigRotation, setPigRotation] = useState<number>(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameSpeed, setGameSpeed] = useState<number>(INITIAL_PIPE_SPEED);
  const [isFlapping, setIsFlapping] = useState<boolean>(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastPipeId = useRef<number>(0);

  // Placeholder audio elements. For a full version, provide actual sound files.
  // For this demo, we'll ensure they are null to prevent network errors.
  const flapSound = useMemo(() => (typeof Audio !== "undefined" ? null /* new Audio("/assets/sounds/flap-placeholder.mp3") */ : null), []);
  const scoreSound = useMemo(() => (typeof Audio !== "undefined" ? null /* new Audio("/assets/sounds/score-placeholder.mp3") */ : null), []);
  const crashSound = useMemo(() => (typeof Audio !== "undefined" ? null /* new Audio("/assets/sounds/crash-placeholder.mp3") */ : null), []);

  const playSound = (sound: HTMLAudioElement | null) => {
    // sound?.play().catch(e => console.warn("Audio play failed (this is expected for placeholder sounds):", e));
    // Playback logic is commented out to ensure no errors with placeholder/null sounds.
  };

  const resetGame = useCallback(() => {
    setStatus(GameStatus.Ready);
    setPigY(GAME_HEIGHT / 2 - PIG_SIZE_H / 2);
    setPigVelocity(0);
    setPigRotation(0);
    setPipes([]);
    setScore(0);
    setGameSpeed(INITIAL_PIPE_SPEED);
    lastPipeId.current = 0;
  }, []);

  const handleFlap = useCallback(() => {
    if (status === GameStatus.Playing) {
      setPigVelocity(v => Math.max(FLAP_VELOCITY, v + FLAP_VELOCITY * 0.2)); 
      setIsFlapping(true);
      playSound(flapSound);
      setTimeout(() => setIsFlapping(false), 100); 
    } else if (status === GameStatus.Ready) {
      setStatus(GameStatus.Playing);
      setPigVelocity(FLAP_VELOCITY);
      setIsFlapping(true);
      playSound(flapSound);
      setTimeout(() => setIsFlapping(false), 100);
    }
  }, [status, flapSound]); // Added flapSound to dependencies, though it's null

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); 
        if (status === GameStatus.GameOver) return; 
        handleFlap();
      }
    };
    
    const gameDiv = gameAreaRef.current;
    // Ensure gameDiv is not null before adding event listener
    if (gameDiv) {
        gameDiv.addEventListener('click', handleFlap);
    }
    window.addEventListener('touchstart', handleFlap);

    return () => {
      if (gameDiv) {
        gameDiv.removeEventListener('click', handleFlap);
      }
      window.removeEventListener('touchstart', handleFlap);
    };
  }, [handleFlap, status]);


  useEffect(() => {
    if (status !== GameStatus.Playing) return;

    let animationFrameId: number;
    const gameLoop = () => {
      setPigVelocity(v => {
        const newV = v + GRAVITY;
        return Math.max(MIN_VELOCITY, Math.min(newV, MAX_VELOCITY));
      });
      setPigY(y => {
        const newY = y + pigVelocity;
        if (newY <= 0) {
          playSound(crashSound);
          setStatus(GameStatus.GameOver);
          return 0;
        }
        if (newY + PIG_SIZE_H >= GAME_HEIGHT - GROUND_HEIGHT) {
          playSound(crashSound);
          setStatus(GameStatus.GameOver);
          return GAME_HEIGHT - GROUND_HEIGHT - PIG_SIZE_H;
        }
        return newY;
      });
      setPigRotation(Math.min(90, Math.max(-30, pigVelocity * 5)));

      setPipes(prevPipes => {
        const newPipes = prevPipes
          .map(pipe => ({ ...pipe, x: pipe.x - gameSpeed }))
          .filter(pipe => pipe.x + PIPE_WIDTH > 0); 

        const lastPipe = newPipes[newPipes.length - 1];
        if (newPipes.length === 0 || (lastPipe && lastPipe.x < GAME_WIDTH - PIPE_SPACING)) {
          lastPipeId.current++;
          const minGapY = PIPE_GAP_HEIGHT / 2 + 30; 
          const maxGapY = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP_HEIGHT / 2 - 30; 
          const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
          newPipes.push({ id: lastPipeId.current, x: PIPE_SPAWN_X, gapY, scored: false });
        }
        return newPipes;
      });

      pipes.forEach(pipe => {
        // Ensure pigY is updated for collision detection in the same frame
        const currentPigY = pigY + pigVelocity; 
        const pigRect = { x: PIG_X_POSITION, y: currentPigY, width: PIG_SIZE_W * 0.8, height: PIG_SIZE_H * 0.8 }; 
        const pipeTopRect = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapY - PIPE_GAP_HEIGHT / 2 };
        const pipeBottomRect = { x: pipe.x, y: pipe.gapY + PIPE_GAP_HEIGHT / 2, width: PIPE_WIDTH, height: GAME_HEIGHT - (pipe.gapY + PIPE_GAP_HEIGHT / 2) };

        const collides = (rect1: typeof pigRect, rect2: typeof pipeTopRect) =>
          rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y;

        if (status === GameStatus.Playing && (collides(pigRect, pipeTopRect) || collides(pigRect, pipeBottomRect))) {
          playSound(crashSound);
          setStatus(GameStatus.GameOver);
          return; 
        }

        if (!pipe.scored && pipe.x + PIPE_WIDTH < PIG_X_POSITION) {
          setScore(s => s + 1);
          // Directly update the specific pipe to avoid stale closure issues with setPipes
          setPipes(prev => prev.map(p => p.id === pipe.id ? { ...p, scored: true } : p));
          setGameSpeed(gs => gs + PIPE_SPEED_INCREMENT);
          playSound(scoreSound);
        }
      });
      
      if (status === GameStatus.Playing) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pigY, pigVelocity, gameSpeed, pipes, crashSound, scoreSound]);


  return (
    <div
      ref={gameAreaRef}
      className="relative bg-sky-400 overflow-hidden cursor-pointer select-none"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0} 
    >
      <Background gameSpeed={status === GameStatus.Playing ? gameSpeed : 0} />
      {pipes.map(pipe => (
        <React.Fragment key={pipe.id}>
          <PipeObstacle
            x={pipe.x}
            y={0}
            height={pipe.gapY - PIPE_GAP_HEIGHT / 2}
            isTopPipe={true}
          />
          <PipeObstacle
            x={pipe.x}
            y={pipe.gapY + PIPE_GAP_HEIGHT / 2}
            height={GAME_HEIGHT - (pipe.gapY + PIPE_GAP_HEIGHT / 2) - GROUND_HEIGHT}
            isTopPipe={false}
          />
        </React.Fragment>
      ))}
      <Pig pigY={pigY} pigRotation={pigRotation} isFlapping={isFlapping} />
      <ScoreDisplay score={score} />
      {status === GameStatus.Ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
          <p className="text-4xl font-bold text-white mb-4" style={{ WebkitTextStroke: '2px black', textShadow: '2px 2px #000' }}>Tap to Fly!</p>
          <div className="w-16 h-16 mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white opacity-75 animate-pulse">
              <path d="M11.9999 1.5C12.5522 1.5 12.9999 1.94772 12.9999 2.5V5.5H16.4999C17.0522 5.5 17.4999 5.94772 17.4999 6.5C17.4999 7.05228 17.0522 7.5 16.4999 7.5H12.9999V10.5H15.4999C16.0522 10.5 16.4999 10.9477 16.4999 11.5C16.4999 12.0523 16.0522 12.5 15.4999 12.5H12.9999V13.5701L14.4178 15.3038C15.0063 15.6194 15.8456 16.0932 16.1458 17.0569C16.2307 17.3499 16.2732 17.6599 16.2732 17.9739C16.2732 19.081 15.3816 20 14.2732 20H9.72669C8.61827 20 7.72669 19.081 7.72669 17.9739C7.72669 17.6599 7.76918 17.3499 7.85408 17.0569C8.15431 16.0932 8.99362 15.6194 9.58211 15.3038L11.0001 13.57V2.5C11.0001 1.94772 11.4478 1.5 11.9999 1.5Z"/>
              <path d="M4.70711 16.2929C4.31658 15.9024 4.31658 15.2692 4.70711 14.8787L6.12132 13.4645C6.51184 13.0739 7.14501 13.0739 7.53553 13.4645C7.92606 13.855 7.92606 14.4882 7.53553 14.8787L6.12132 16.2929C5.7308 16.6834 5.09763 16.6834 4.70711 16.2929Z"/>
              <path d="M19.2929 16.2929C19.6834 15.9024 19.6834 15.2692 19.2929 14.8787L17.8787 13.4645C17.4882 13.0739 16.855 13.0739 16.4645 13.4645C16.0739 13.855 16.0739 14.4882 16.4645 14.8787L17.8787 16.2929C18.2692 16.6834 18.9024 16.6834 19.2929 16.2929Z"/>
            </svg>
          </div>
        </div>
      )}
      {status === GameStatus.GameOver && (
        <GameOverScreen score={score} onRetry={resetGame} />
      )}
    </div>
  );
}

export default GameArea;
