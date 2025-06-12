import React, {
  forwardRef, useImperativeHandle,
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
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

  const lastPipeId = useRef<number>(0);

  const flapSound = useMemo(() => null, []);
  const scoreSound = useMemo(() => null, []);
  const crashSound = useMemo(() => null, []);

  const playSound = (sound: HTMLAudioElement | null) => {
    // Placeholder: âm thanh có thể thêm sau
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
  }, [status, flapSound]);

  // Gán sự kiện tap/click/space
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (status !== GameStatus.GameOver) {
          handleFlap();
        }
      }
    };

    const handleTouchAnywhere = (e: TouchEvent) => {
      e.preventDefault();
      handleFlap();
    };

    const handleClickAnywhere = (e: MouseEvent) => {
      handleFlap();
    };

    window.addEventListener('keydown', handleKeyPress);
    document.addEventListener('touchstart', handleTouchAnywhere, { passive: false });
    document.addEventListener('click', handleClickAnywhere);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', handleTouchAnywhere);
      document.removeEventListener('click', handleClickAnywhere);
    };
  }, [handleFlap, status]);

  // Game loop
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
        if (newY <= 0 || newY + PIG_SIZE_H >= GAME_HEIGHT - GROUND_HEIGHT) {
          playSound(crashSound);
          setStatus(GameStatus.GameOver);
          return Math.max(0, GAME_HEIGHT - GROUND_HEIGHT - PIG_SIZE_H);
        }
        return newY;
      });

      setPigRotation(Math.min(90, Math.max(-30, pigVelocity * 5)));

      setPipes(prevPipes => {
        const newPipes = prevPipes
          .map(pipe => ({ ...pipe, x: pipe.x - gameSpeed }))
          .filter(pipe => pipe.x + PIPE_WIDTH > 0);

        const lastPipe = newPipes[newPipes.length - 1];
        if (!lastPipe || lastPipe.x < GAME_WIDTH - PIPE_SPACING) {
          lastPipeId.current++;
          const minGapY = PIPE_GAP_HEIGHT / 2 + 30;
          const maxGapY = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP_HEIGHT / 2 - 30;
          const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
          newPipes.push({ id: lastPipeId.current, x: PIPE_SPAWN_X, gapY, scored: false });
        }
        return newPipes;
      });

      pipes.forEach(pipe => {
        const currentPigY = pigY + pigVelocity;
        const pigRect = {
          x: PIG_X_POSITION,
          y: currentPigY,
          width: PIG_SIZE_W * 0.8,
          height: PIG_SIZE_H * 0.8
        };
        const pipeTopRect = {
          x: pipe.x,
          y: 0,
          width: PIPE_WIDTH,
          height: pipe.gapY - PIPE_GAP_HEIGHT / 2
        };
        const pipeBottomRect = {
          x: pipe.x,
          y: pipe.gapY + PIPE_GAP_HEIGHT / 2,
          width: PIPE_WIDTH,
          height: GAME_HEIGHT - (pipe.gapY + PIPE_GAP_HEIGHT / 2)
        };

        const collides = (r1: typeof pigRect, r2: typeof pipeTopRect) =>
          r1.x < r2.x + r2.width &&
          r1.x + r1.width > r2.x &&
          r1.y < r2.y + r2.height &&
          r1.y + r1.height > r2.y;

        if (status === GameStatus.Playing && (collides(pigRect, pipeTopRect) || collides(pigRect, pipeBottomRect))) {
          playSound(crashSound);
          setStatus(GameStatus.GameOver);
        }

        if (!pipe.scored && pipe.x + PIPE_WIDTH < PIG_X_POSITION) {
          setScore(s => s + 1);
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
  }, [status, pigY, pigVelocity, gameSpeed, pipes, crashSound, scoreSound]);

  return (
    <div
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
        </div>
      )}
      {status === GameStatus.GameOver && (
        <GameOverScreen score={score} onRetry={resetGame} />
      )}
    </div>
  );
});

export default GameArea;
