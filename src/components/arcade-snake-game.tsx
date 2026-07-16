'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Cell = {
  x: number;
  y: number;
};

type Direction = Cell;

type GameStatus = 'idle' | 'playing' | 'gameOver';

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const START_SPEED = 190;
const MIN_SPEED = 95;
const SPEED_STEP = 12;

const DIRECTIONS: Record<string, Direction> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

const OPPOSITES: Record<string, string> = {
  ArrowUp: 'ArrowDown',
  ArrowDown: 'ArrowUp',
  ArrowLeft: 'ArrowRight',
  ArrowRight: 'ArrowLeft',
  w: 'ArrowDown',
  s: 'ArrowUp',
  a: 'ArrowRight',
  d: 'ArrowLeft',
};

function cellKey(cell: Cell) {
  return `${cell.x}:${cell.y}`;
}

function isSameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function isInsideBoard(cell: Cell) {
  return cell.x >= 0 && cell.x < BOARD_WIDTH && cell.y >= 0 && cell.y < BOARD_HEIGHT;
}

function createSnake() {
  const startX = Math.floor(BOARD_WIDTH / 2);
  const startY = Math.floor(BOARD_HEIGHT / 2);

  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

function createFood(snake: Cell[]) {
  const occupied = new Set(snake.map(cellKey));

  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    };

    if (!occupied.has(cellKey(candidate))) {
      return candidate;
    }
  }
}

function isOppositeDirection(current: Direction, next: Direction) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

export default function ArcadeSnakeGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [snake, setSnake] = useState<Cell[]>(() => createSnake());
  const [food, setFood] = useState<Cell>(() => createFood(createSnake()));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [speed, setSpeed] = useState(START_SPEED);
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 });

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const statusRef = useRef(status);
  const scoreRef = useRef(score);
  const speedRef = useRef(speed);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const resetGame = () => {
    const initialSnake = createSnake();
    const initialFood = createFood(initialSnake);

    snakeRef.current = initialSnake;
    foodRef.current = initialFood;
    directionRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    speedRef.current = START_SPEED;

    setSnake(initialSnake);
    setFood(initialFood);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setSpeed(START_SPEED);
    setStatus('playing');
  };

  const finishGame = () => {
    setBestScore((previousBest) => Math.max(previousBest, scoreRef.current));
    setStatus('gameOver');
  };

  const handleDirection = (next: Direction, key?: string) => {
    if (statusRef.current !== 'playing') {
      return;
    }

    if (key && OPPOSITES[key]) {
      const currentKey = Object.entries(DIRECTIONS).find(([, value]) => value.x === directionRef.current.x && value.y === directionRef.current.y)?.[0];

      if (currentKey && OPPOSITES[currentKey] === key) {
        return;
      }
    }

    if (isOppositeDirection(directionRef.current, next)) {
      return;
    }

    directionRef.current = next;
    setDirection(next);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const nextDirection = DIRECTIONS[event.key];

      if (!nextDirection) {
        if ((event.key === 'Enter' || event.key === ' ') && statusRef.current !== 'playing') {
          event.preventDefault();
          resetGame();
        }

        return;
      }

      event.preventDefault();
      handleDirection(nextDirection, event.key);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const timer = window.setInterval(() => {
      const currentSnake = snakeRef.current;
      const currentDirection = directionRef.current;
      const currentFood = foodRef.current;
      const currentHead = currentSnake[0];
      const nextHead = {
        x: currentHead.x + currentDirection.x,
        y: currentHead.y + currentDirection.y,
      };

      if (!isInsideBoard(nextHead)) {
        finishGame();
        return;
      }

      const ateFood = isSameCell(nextHead, currentFood);
      const collision = currentSnake.some((segment, index) => {
        if (!ateFood && index === currentSnake.length - 1) {
          return false;
        }

        return isSameCell(segment, nextHead);
      });

      if (collision) {
        finishGame();
        return;
      }

      const nextSnake = ateFood ? [nextHead, ...currentSnake] : [nextHead, ...currentSnake.slice(0, -1)];

      snakeRef.current = nextSnake;
      setSnake(nextSnake);

      if (ateFood) {
        const nextScore = scoreRef.current + 10;
        const nextSpeed = Math.max(MIN_SPEED, START_SPEED - Math.floor(nextScore / 40) * SPEED_STEP);
        const nextFood = createFood(nextSnake);

        scoreRef.current = nextScore;
        speedRef.current = nextSpeed;
        foodRef.current = nextFood;

        setScore(nextScore);
        setSpeed(nextSpeed);
        setFood(nextFood);
        setBestScore((previousBest) => Math.max(previousBest, nextScore));
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [speed, status]);

  const snakeLookup = useMemo(() => new Set(snake.map(cellKey)), [snake]);
  const headKey = cellKey(snake[0]);
  const foodMarker = cellKey(food);

  const gridCells = useMemo(
    () =>
      Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, (_, index) => {
        const x = index % BOARD_WIDTH;
        const y = Math.floor(index / BOARD_WIDTH);
        const key = `${x}:${y}`;
        const isSnake = snakeLookup.has(key);
        const isHead = key === headKey;
        const isFood = key === foodMarker;

        return (
          <div
            key={key}
            className={[
              'relative aspect-square rounded-[0.35rem] border border-white/5 transition-all duration-150',
              isSnake
                ? isHead
                  ? 'bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9),0_0_30px_rgba(34,211,238,0.35)]'
                  : 'bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,0.7),0_0_24px_rgba(217,70,239,0.25)]'
                : 'bg-white/[0.03]',
              isFood
                ? 'border-cyan-200/50 bg-[radial-gradient(circle,_rgba(255,255,255,0.95)_0%,_rgba(34,211,238,0.95)_38%,_rgba(34,211,238,0.08)_74%,_transparent_100%)] shadow-[0_0_16px_rgba(34,211,238,1),0_0_28px_rgba(255,0,204,0.4)]'
                : '',
            ].join(' ')}
          >
            {isSnake && !isHead ? <span className="absolute inset-0 rounded-[0.35rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)]" /> : null}
            {isHead ? <span className="absolute inset-[18%] rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.7)]" /> : null}
          </div>
        );
      }),
    [snakeLookup, headKey, foodMarker]
  );

  const statusLabel =
    status === 'idle' ? 'INSERT COINT / PRESS START' : status === 'playing' ? 'GAME RUNNING' : 'GAME OVER';

  const controlButton = (
    label: string,
    onClick: () => void,
    directionClass?: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        'grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/35 bg-black/35 text-xs font-bold uppercase tracking-[0.28em]',
        'text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.2)] transition duration-150',
        'hover:-translate-y-0.5 hover:border-cyan-200/70 hover:bg-cyan-400/12 hover:shadow-[0_0_22px_rgba(34,211,238,0.38)]',
        'active:translate-y-0 active:scale-95',
        directionClass ?? '',
      ].join(' ')}
    >
      {label}
    </button>
  );

  return (
    <section className="relative w-full max-w-6xl">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(11,5,24,0.92),rgba(2,3,10,0.94))] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.65)] neon-frame sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,0,204,0.18),transparent_34%),radial-gradient(circle_at_right,_rgba(0,255,255,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_30%)]" />
        <div className="scanlines pointer-events-none absolute inset-0 opacity-25" />

        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-[0.63rem] uppercase tracking-[0.45em] text-cyan-200/80">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1">Neo Arcade Console</span>
              <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-400/10 px-3 py-1">Retro Snake</span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1">Neon Mode</span>
            </div>

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.7em] text-fuchsia-200/75">Insert coint</p>
              <h1 className="max-w-xl text-5xl font-black uppercase leading-[0.92] tracking-[0.1em] text-transparent sm:text-6xl lg:text-7xl bg-[linear-gradient(180deg,#ffffff_0%,#dffbff_32%,#73f6ff_56%,#ff58d7_100%)] bg-clip-text drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]">
                Insert coint
              </h1>
              <p className="max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                Pulsa <span className="text-cyan-200">Start Game</span> para encender el cabinet y jugar Snake con brillo
                neon, scanlines y un tablero estilo arcade.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="rounded-full border border-cyan-300/45 bg-cyan-300/12 px-6 py-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-300/18 hover:shadow-[0_0_34px_rgba(34,211,238,0.42)] active:translate-y-0 active:scale-[0.98]"
              >
                Start Game
              </button>
              <div className="flex min-h-[48px] items-center rounded-full border border-white/10 bg-black/25 px-4 text-xs uppercase tracking-[0.32em] text-white/70">
                {statusLabel}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
                <div className="text-[0.62rem] uppercase tracking-[0.35em] text-cyan-200/75">Score</div>
                <div className="mt-2 text-2xl font-black text-white">{score}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
                <div className="text-[0.62rem] uppercase tracking-[0.35em] text-fuchsia-200/75">Best</div>
                <div className="mt-2 text-2xl font-black text-white">{bestScore}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
                <div className="text-[0.62rem] uppercase tracking-[0.35em] text-emerald-200/75">Speed</div>
                <div className="mt-2 text-2xl font-black text-white">{Math.round(1000 / speed)} TPS</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_60%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-cyan-300/35 bg-black/45 p-3 shadow-[0_0_40px_rgba(34,211,238,0.14)]">
              <div className="mb-3 flex items-center justify-between gap-3 px-2">
                <div className="text-[0.6rem] uppercase tracking-[0.45em] text-cyan-100/75">Vector Grid</div>
                <div className="rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1 text-[0.58rem] uppercase tracking-[0.35em] text-fuchsia-100">
                  {BOARD_WIDTH} x {BOARD_HEIGHT}
                </div>
              </div>

              <div
                className={[
                  'relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_34%),linear-gradient(180deg,rgba(8,8,18,0.98),rgba(0,0,0,0.96))] p-3',
                  'shadow-[inset_0_0_26px_rgba(0,0,0,0.55),0_0_30px_rgba(0,255,255,0.08)]',
                ].join(' ')}
              >
                <div className="grid gap-[0.35rem]" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))` }}>
                  {gridCells}
                </div>

                {status !== 'playing' ? (
                  <div className="absolute inset-0 grid place-items-center bg-black/42 backdrop-blur-[2px]">
                    <div className="max-w-xs rounded-[1.4rem] border border-cyan-300/30 bg-black/55 px-5 py-6 text-center shadow-[0_0_28px_rgba(34,211,238,0.18)]">
                      <div className="text-[0.65rem] uppercase tracking-[0.45em] text-cyan-200/75">Arcade Status</div>
                      <div className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-transparent bg-[linear-gradient(180deg,#fff,#68f5ff,#ff58d7)] bg-clip-text">
                        {status === 'gameOver' ? 'Game Over' : 'Press Start'}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/70">
                        {status === 'gameOver'
                          ? 'Perdiste. Presiona Start Game para reiniciar y volver a entrar al cabinet.'
                          : 'Pulsa Start Game o Enter para encender el juego.'}
                      </p>
                    </div>
                  </div>
                ) : null}

                {status === 'gameOver' ? (
                  <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <button
                      type="button"
                      onClick={resetGame}
                      className="rounded-full border border-fuchsia-300/45 bg-fuchsia-300/12 px-5 py-3 text-xs font-black uppercase tracking-[0.35em] text-fuchsia-100 shadow-[0_0_22px_rgba(255,0,204,0.25)] transition hover:-translate-y-0.5 hover:bg-fuchsia-300/18"
                    >
                      Play Again
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-[0.62rem] uppercase tracking-[0.45em] text-cyan-200/75">Controls</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">Arrow Keys</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">WASD</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">Enter / Space</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/68">
              Manten el movimiento limpio: no puedes girar 180 grados de inmediato. Al comer comida, la serpiente crece,
              sube el puntaje y acelera.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between">
              <div className="text-[0.62rem] uppercase tracking-[0.45em] text-fuchsia-200/75">Arcade Pad</div>
              <div className="text-[0.58rem] uppercase tracking-[0.35em] text-white/45">Mobile friendly</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div />
              {controlButton('Up', () => handleDirection({ x: 0, y: -1 }, 'ArrowUp'))}
              <div />
              {controlButton('Left', () => handleDirection({ x: -1, y: 0 }, 'ArrowLeft'))}
              <button
                type="button"
                onClick={resetGame}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-fuchsia-300/35 bg-fuchsia-400/10 text-[0.56rem] font-black uppercase tracking-[0.28em] text-fuchsia-100 shadow-[0_0_18px_rgba(255,0,204,0.18)] transition hover:-translate-y-0.5 hover:bg-fuchsia-300/16 active:translate-y-0 active:scale-95"
              >
                Start
              </button>
              {controlButton('Right', () => handleDirection({ x: 1, y: 0 }, 'ArrowRight'))}
              <div />
              <div />
              {controlButton('Down', () => handleDirection({ x: 0, y: 1 }, 'ArrowDown'))}
              <div />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
