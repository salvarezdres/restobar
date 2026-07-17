'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type GameStatus = 'idle' | 'playing' | 'gameOver' | 'levelComplete';

type SurfaceKind = 'cold' | 'warm';

type Segment = {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  surface: SurfaceKind;
};

type Crystal = {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
};

type Hazard = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: -1 | 1;
};

type RuntimeState = {
  player: Player;
  crystals: Crystal[];
  score: number;
  startX: number;
  melt: number;
  elapsed: number;
  lastGroundedAt: number;
  jumpQueuedUntil: number;
  message: string;
};

type ViewportSize = {
  width: number;
  height: number;
};

const WORLD_WIDTH = 4880;
const WORLD_HEIGHT = 920;
const PLAYER_SIZE = 44;
const FINISH_X = 4600;

const GRAVITY = 1920;
const MAX_FALL_SPEED = 1400;
const GROUND_ACCEL = 2400;
const AIR_ACCEL = 1500;
const MAX_RUN_SPEED = 360;
const BASE_FRICTION = 8.5;
const AIR_DRAG = 1.35;
const SLOPE_PULL = 1250;
const JUMP_SPEED = 760;
const JUMP_BUFFER_MS = 130;
const COYOTE_TIME_MS = 112;
const MELT_LIMIT = 100;

const LEVEL_SEGMENTS: Segment[] = [
  { id: 'start-flat', x1: 0, x2: 520, y1: 636, y2: 636, surface: 'cold' },
  { id: 'descent-1', x1: 520, x2: 1010, y1: 636, y2: 760, surface: 'cold' },
  { id: 'ascent-1', x1: 1010, x2: 1460, y1: 760, y2: 552, surface: 'cold' },
  { id: 'ridge-warm', x1: 1460, x2: 1750, y1: 552, y2: 552, surface: 'warm' },
  { id: 'landing-1', x1: 1910, x2: 2380, y1: 520, y2: 520, surface: 'cold' },
  { id: 'descent-2', x1: 2380, x2: 2870, y1: 520, y2: 718, surface: 'cold' },
  { id: 'ascent-2', x1: 2870, x2: 3320, y1: 718, y2: 472, surface: 'cold' },
  { id: 'warm-run', x1: 3320, x2: 3590, y1: 472, y2: 472, surface: 'warm' },
  { id: 'descent-3', x1: 3590, x2: 4070, y1: 472, y2: 712, surface: 'cold' },
  { id: 'ascent-3', x1: 4070, x2: 4490, y1: 712, y2: 596, surface: 'cold' },
  { id: 'final-run', x1: 4490, x2: 4880, y1: 596, y2: 556, surface: 'cold' },
];

const HAZARDS: Hazard[] = [
  { id: 'spikes-1', x: 2050, y: 484, width: 150, height: 36 },
  { id: 'spikes-2', x: 3760, y: 672, width: 120, height: 40 },
  { id: 'spikes-3', x: 4680, y: 544, width: 84, height: 34 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function surfaceY(segment: Segment, x: number) {
  const span = segment.x2 - segment.x1;
  if (span === 0) {
    return segment.y1;
  }

  const ratio = (x - segment.x1) / span;
  return segment.y1 + ratio * (segment.y2 - segment.y1);
}

function slopeFor(segment: Segment) {
  const span = segment.x2 - segment.x1;
  if (span === 0) {
    return 0;
  }

  return (segment.y2 - segment.y1) / span;
}

function getSegmentAtX(x: number) {
  return LEVEL_SEGMENTS.find((segment) => x >= segment.x1 && x <= segment.x2) ?? null;
}

function createCrystals(): Crystal[] {
  return [
    { id: 'c-1', x: 860, y: 512, value: 100, collected: false },
    { id: 'c-2', x: 1320, y: 612, value: 100, collected: false },
    { id: 'c-3', x: 2220, y: 398, value: 150, collected: false },
    { id: 'c-4', x: 3160, y: 362, value: 150, collected: false },
    { id: 'c-5', x: 4330, y: 540, value: 200, collected: false },
  ];
}

function createInitialRuntime(): RuntimeState {
  const startSegment = LEVEL_SEGMENTS[0];
  const startX = 120;
  const groundY = surfaceY(startSegment, startX);

  return {
    player: {
      x: startX,
      y: groundY - PLAYER_SIZE,
      vx: 0,
      vy: 0,
      grounded: true,
      facing: 1,
    },
    crystals: createCrystals(),
    score: 0,
    startX,
    melt: 0,
    elapsed: 0,
    lastGroundedAt: 0,
    jumpQueuedUntil: 0,
    message: 'Press Start Game to wake the ice cube.',
  };
}

function makeSegmentPolygon(segment: Segment) {
  const floorY = WORLD_HEIGHT - 40;
  return `${segment.x1},${segment.y1} ${segment.x2},${segment.y2} ${segment.x2},${floorY} ${segment.x1},${floorY}`;
}

export default function IcePlatformerGame() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [bestScore, setBestScore] = useState(0);
  const [, forceRender] = useState(0);
  const [viewport, setViewport] = useState<ViewportSize>({ width: 0, height: 0 });

  const runtimeRef = useRef<RuntimeState>(createInitialRuntime());
  const inputRef = useRef({
    left: false,
    right: false,
    jumpQueuedUntil: 0,
  });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const runtime = runtimeRef.current;
  const player = runtime.player;

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setViewport({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const resetGame = () => {
    runtimeRef.current = {
      ...createInitialRuntime(),
      message: 'Build momentum on the slopes and reach the neon gate.',
    };
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.jumpQueuedUntil = 0;
    lastTimeRef.current = null;
    setStatus('playing');
    forceRender((value) => value + 1);
  };

  const respawn = (message: string) => {
    setBestScore((previousBest) => Math.max(previousBest, runtimeRef.current.score));
    runtimeRef.current = {
      ...createInitialRuntime(),
      score: runtimeRef.current.score,
      message,
    };
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.jumpQueuedUntil = 0;
    lastTimeRef.current = null;
    setStatus('playing');
    forceRender((value) => value + 1);
  };

  const triggerGameOver = (message: string) => {
    setBestScore((previousBest) => Math.max(previousBest, runtimeRef.current.score));
    runtimeRef.current.message = message;
    setStatus('gameOver');
    forceRender((value) => value + 1);
  };

  const queueJump = (now: number) => {
    inputRef.current.jumpQueuedUntil = now + JUMP_BUFFER_MS;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'a') {
        event.preventDefault();
        inputRef.current.left = true;
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'd') {
        event.preventDefault();
        inputRef.current.right = true;
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'w' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        queueJump(performance.now());
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (status === 'playing') {
          return;
        }
        resetGame();
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        resetGame();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a') {
        inputRef.current.left = false;
      }

      if (event.key === 'ArrowRight' || event.key === 'd') {
        inputRef.current.right = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const step = (time: number) => {
      const runtime = runtimeRef.current;
      const dt = lastTimeRef.current === null ? 0 : Math.min((time - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = time;

      if (dt > 0) {
        runtime.elapsed += dt;

        const playerState = runtime.player;
        const previousGrounded = playerState.grounded;
        const centerX = playerState.x + PLAYER_SIZE / 2;
        const segment = getSegmentAtX(centerX);
        const supportY = segment ? surfaceY(segment, centerX) : null;
        const slope = segment ? slopeFor(segment) : 0;

        const moveLeft = inputRef.current.left && !inputRef.current.right;
        const moveRight = inputRef.current.right && !inputRef.current.left;
        const accel = playerState.grounded ? GROUND_ACCEL : AIR_ACCEL;

        if (moveLeft) {
          playerState.vx -= accel * dt;
          playerState.facing = -1;
        }

        if (moveRight) {
          playerState.vx += accel * dt;
          playerState.facing = 1;
        }

        if (playerState.grounded) {
          const friction = segment?.surface === 'warm' ? BASE_FRICTION * 0.7 : BASE_FRICTION;

          if (!moveLeft && !moveRight) {
            const reduction = Math.max(0, 1 - friction * dt);
            playerState.vx *= reduction;
          }

          if (segment) {
            playerState.vx += slope * SLOPE_PULL * dt;
          }
        } else {
          const airReduction = Math.max(0, 1 - AIR_DRAG * dt);
          playerState.vx *= airReduction;
        }

        playerState.vx = clamp(playerState.vx, -MAX_RUN_SPEED, MAX_RUN_SPEED);

        const jumpReady = inputRef.current.jumpQueuedUntil >= time;
        const coyoteReady = time - runtime.lastGroundedAt <= COYOTE_TIME_MS;

        if (jumpReady && (playerState.grounded || coyoteReady)) {
          playerState.vy = -JUMP_SPEED;
          playerState.grounded = false;
          inputRef.current.jumpQueuedUntil = 0;
        }

        playerState.vy = clamp(playerState.vy + GRAVITY * dt, -JUMP_SPEED, MAX_FALL_SPEED);

        playerState.x += playerState.vx * dt;
        playerState.y += playerState.vy * dt;

        if (playerState.x < 0) {
          playerState.x = 0;
          playerState.vx = 0;
        }

        if (playerState.x + PLAYER_SIZE > WORLD_WIDTH) {
          playerState.x = WORLD_WIDTH - PLAYER_SIZE;
        }

        const supportSegment = getSegmentAtX(playerState.x + PLAYER_SIZE / 2);
        let groundedNow = false;

        if (supportSegment && playerState.vy >= 0) {
          const groundY = surfaceY(supportSegment, playerState.x + PLAYER_SIZE / 2);
          const bottomY = playerState.y + PLAYER_SIZE;
          const withinReach = bottomY >= groundY - 8 && bottomY <= groundY + 48;

          if (withinReach || previousGrounded) {
            playerState.y = groundY - PLAYER_SIZE;
            playerState.vy = 0;
            groundedNow = true;
            runtime.lastGroundedAt = time;
          }
        }

        playerState.grounded = groundedNow;

        if (!supportSegment && playerState.y > WORLD_HEIGHT + 120) {
          triggerGameOver('The cube slipped off the course.');
          return;
        }

        for (const crystal of runtime.crystals) {
          if (crystal.collected) {
            continue;
          }

          const crystalRect = { x: crystal.x - 16, y: crystal.y - 16, width: 32, height: 32 };
          const playerRect = { x: playerState.x, y: playerState.y, width: PLAYER_SIZE, height: PLAYER_SIZE };

          if (rectsOverlap(playerRect, crystalRect)) {
            crystal.collected = true;
            runtime.melt = Math.max(0, runtime.melt - 12);
          }
        }

        const playerRect = { x: playerState.x, y: playerState.y, width: PLAYER_SIZE, height: PLAYER_SIZE };

        const activeSegment = supportSegment && playerState.grounded ? supportSegment : null;
        const warmBoost = activeSegment?.surface === 'warm' ? 5.9 : 0;
        const coldRecover = activeSegment?.surface === 'cold' && Math.abs(playerState.vx) < 110 ? -1.3 : 0;
        const speedHeat = clamp(Math.abs(playerState.vx) / MAX_RUN_SPEED, 0, 1) * 1.15;

        runtime.melt = clamp(runtime.melt + (0.95 + warmBoost + speedHeat + coldRecover) * dt * 10, 0, MELT_LIMIT);
        runtime.score = Math.max(runtime.score, playerState.x - runtime.startX);

        if (playerState.x + PLAYER_SIZE >= FINISH_X) {
          setBestScore((previousBest) => Math.max(previousBest, runtime.score));
          runtime.message = 'Line complete. The ice cube survived the route.';
          setStatus('levelComplete');
          forceRender((value) => value + 1);
          return;
        }

        for (const hazard of HAZARDS) {
          if (
            rectsOverlap(playerRect, {
              x: hazard.x,
              y: hazard.y,
              width: hazard.width,
              height: hazard.height,
            })
          ) {
            respawn('The cube shattered on the spikes. Respawning...');
            return;
          }
        }

        if (runtime.melt >= MELT_LIMIT) {
          triggerGameOver('The cube melted completely.');
          return;
        }
      }

      forceRender((value) => value + 1);
      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [status]);

  const progress = clamp(((player.x + PLAYER_SIZE / 2) / FINISH_X) * 100, 0, 100);
  const collectedShards = runtime.crystals.filter((crystal) => crystal.collected).length;
  const totalShards = runtime.crystals.length;

  const cameraX = viewport.width > 0 ? clamp(player.x + PLAYER_SIZE / 2 - viewport.width * 0.44, 0, WORLD_WIDTH - viewport.width) : 0;
  const cameraY = viewport.height > 0 ? clamp(player.y + PLAYER_SIZE / 2 - viewport.height * 0.58, 0, WORLD_HEIGHT - viewport.height) : 0;

  const surfacePolygons = useMemo(() => LEVEL_SEGMENTS.map((segment) => ({ id: segment.id, points: makeSegmentPolygon(segment), surface: segment.surface })), []);

  const message =
    status === 'idle'
      ? 'Press Start Game or Enter to wake the ice cube.'
      : runtime.message;

  const handleStart = () => {
    resetGame();
  };

  const hold = (key: 'left' | 'right', value: boolean) => {
    inputRef.current[key] = value;
  };

  const requestJump = () => {
    queueJump(performance.now());
  };

  return (
    <section className="relative w-full max-w-7xl">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(11,5,24,0.95),rgba(2,3,10,0.98))] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.65)] neon-frame sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,0,204,0.16),transparent_34%),radial-gradient(circle_at_right,_rgba(0,255,255,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_30%)]" />
        <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

        <div className="relative grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-[0.63rem] uppercase tracking-[0.45em] text-cyan-200/80">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1">Retro Platformer</span>
              <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-400/10 px-3 py-1">Ice Cube</span>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1">Slope Runner</span>
            </div>

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.7em] text-fuchsia-200/75">Insert coint</p>
              <h1 className="max-w-xl text-5xl font-black uppercase leading-[0.9] tracking-[0.1em] text-transparent sm:text-6xl lg:text-7xl bg-[linear-gradient(180deg,#ffffff_0%,#dffbff_28%,#73f6ff_58%,#ff58d7_100%)] bg-clip-text drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]">
                Frost Cube
              </h1>
              <p className="max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                Controla un cubo de hielo con inercia, salta entre rampas y domina pendientes multiples sin que se derrita
                antes de llegar al portal final.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStart}
                className="rounded-full border border-cyan-300/45 bg-cyan-300/12 px-6 py-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 hover:bg-cyan-300/18 hover:shadow-[0_0_34px_rgba(34,211,238,0.42)] active:translate-y-0 active:scale-[0.98]"
              >
                Start Game
              </button>
              <div className="flex min-h-[48px] items-center rounded-full border border-white/10 bg-black/25 px-4 text-xs uppercase tracking-[0.32em] text-white/70">
                {status === 'playing' ? 'RUNNING' : status === 'gameOver' ? 'GAME OVER' : status === 'levelComplete' ? 'CLEAR!' : 'READY'}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
                <div className="text-[0.62rem] uppercase tracking-[0.35em] text-cyan-200/75">Distance</div>
                <div className="mt-2 text-2xl font-black text-white">{Math.floor(runtime.score)}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
                <div className="text-[0.62rem] uppercase tracking-[0.35em] text-fuchsia-200/75">Best</div>
                <div className="mt-2 text-2xl font-black text-white">{bestScore}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
                <div className="text-[0.62rem] uppercase tracking-[0.35em] text-emerald-200/75">Melt</div>
                <div className="mt-2 text-2xl font-black text-white">{Math.round(runtime.melt)}%</div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between">
                <div className="text-[0.62rem] uppercase tracking-[0.45em] text-cyan-200/75">Status</div>
                <div className="text-[0.58rem] uppercase tracking-[0.35em] text-white/45">Keyboard + Touch</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">{message}</p>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#74f8ff_0%,#ff58d7_100%)] shadow-[0_0_18px_rgba(34,211,238,0.32)] transition-[width] duration-200"
                  style={{ width: `${runtime.melt}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.35em] text-white/45">
                <span>
                  Crystals {collectedShards}/{totalShards}
                </span>
                <span>Progress {Math.floor(progress)}%</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_60%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-cyan-300/35 bg-black/45 p-3 shadow-[0_0_40px_rgba(34,211,238,0.14)]">
              <div className="mb-3 flex items-center justify-between gap-3 px-2">
                <div className="text-[0.6rem] uppercase tracking-[0.45em] text-cyan-100/75">Slope Circuit</div>
                <div className="rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1 text-[0.58rem] uppercase tracking-[0.35em] text-fuchsia-100">
                  {WORLD_WIDTH}px course
                </div>
              </div>

              <div
                ref={viewportRef}
                className="relative h-[min(68vh,640px)] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_34%),linear-gradient(180deg,rgba(8,8,18,0.98),rgba(0,0,0,0.96))] shadow-[inset_0_0_26px_rgba(0,0,0,0.55),0_0_30px_rgba(0,255,255,0.08)]"
              >
                <div
                  className="absolute left-0 top-0 will-change-transform"
                  style={{
                    transform: `translate3d(${-cameraX}px, ${-cameraY}px, 0)`,
                    width: `${WORLD_WIDTH}px`,
                    height: `${WORLD_HEIGHT}px`,
                  }}
                >
                  <svg width={WORLD_WIDTH} height={WORLD_HEIGHT} className="absolute inset-0">
                    <defs>
                      <linearGradient id="iceFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                        <stop offset="45%" stopColor="rgba(115,246,255,0.85)" />
                        <stop offset="100%" stopColor="rgba(9,16,32,0.98)" />
                      </linearGradient>
                      <linearGradient id="warmFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,230,120,0.65)" />
                        <stop offset="100%" stopColor="rgba(255,88,215,0.3)" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    <rect x="0" y="0" width={WORLD_WIDTH} height={WORLD_HEIGHT} fill="transparent" />

                    <g opacity="0.14">
                      {Array.from({ length: 68 }, (_, index) => {
                        const x = (index * 173) % WORLD_WIDTH;
                        const y = 80 + ((index * 89) % 560);
                        return <circle key={`star-${index}`} cx={x} cy={y} r={1.4 + (index % 3) * 0.6} fill="rgba(255,255,255,0.85)" />;
                      })}
                    </g>

                    <g filter="url(#glow)">
                      {surfacePolygons.map((segment) => (
                        <polygon
                          key={segment.id}
                          points={segment.points}
                          fill={segment.surface === 'warm' ? 'url(#warmFill)' : 'url(#iceFill)'}
                          opacity={segment.surface === 'warm' ? 0.86 : 0.92}
                          stroke={segment.surface === 'warm' ? 'rgba(255,206,88,0.7)' : 'rgba(140,248,255,0.76)'}
                          strokeWidth={3}
                        />
                      ))}
                    </g>

                    <g opacity="0.4">
                      {LEVEL_SEGMENTS.map((segment) => (
                        <line
                          key={`${segment.id}-top`}
                          x1={segment.x1}
                          y1={segment.y1}
                          x2={segment.x2}
                          y2={segment.y2}
                          stroke={segment.surface === 'warm' ? 'rgba(255,206,88,0.7)' : 'rgba(115,246,255,0.6)'}
                          strokeWidth={5}
                          strokeLinecap="round"
                        />
                      ))}
                    </g>

                    <g opacity="0.72">
                      {HAZARDS.map((hazard) => (
                        <polygon
                          key={hazard.id}
                          points={`${hazard.x},${hazard.y + hazard.height} ${hazard.x + hazard.width / 2},${hazard.y} ${hazard.x + hazard.width},${hazard.y + hazard.height}`}
                          fill="rgba(255,88,215,0.88)"
                          stroke="rgba(255,255,255,0.7)"
                          strokeWidth={2}
                          filter="url(#glow)"
                        />
                      ))}
                    </g>

                    <g opacity="0.92">
                      {runtime.crystals.map((crystal) => {
                        if (crystal.collected) {
                          return null;
                        }

                        return (
                          <g key={crystal.id} filter="url(#glow)">
                            <polygon
                              points={`${crystal.x},${crystal.y - 18} ${crystal.x + 16},${crystal.y} ${crystal.x},${crystal.y + 18} ${crystal.x - 16},${crystal.y}`}
                              fill="rgba(255,255,255,0.92)"
                              stroke="rgba(115,246,255,0.7)"
                              strokeWidth={2}
                            />
                          </g>
                        );
                      })}
                    </g>

                    <g filter="url(#glow)">
                      <rect
                        x={FINISH_X}
                        y={410}
                        width={16}
                        height={340}
                        rx={8}
                        fill="rgba(255,88,215,0.82)"
                      />
                      <rect
                        x={FINISH_X - 18}
                        y={392}
                        width={52}
                        height={56}
                        rx={18}
                        fill="rgba(115,246,255,0.22)"
                        stroke="rgba(115,246,255,0.9)"
                        strokeWidth={3}
                      />
                    </g>
                  </svg>

                  <div
                    className="absolute rounded-[1rem] border border-cyan-100/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(115,246,255,0.82),rgba(17,34,65,0.96))] shadow-[0_0_24px_rgba(115,246,255,0.52),0_0_48px_rgba(255,88,215,0.2)]"
                    style={{
                      left: `${player.x}px`,
                      top: `${player.y}px`,
                      width: `${PLAYER_SIZE}px`,
                      height: `${PLAYER_SIZE}px`,
                      transform: `rotate(${player.facing === 1 ? 3 : -3}deg)`,
                    }}
                  >
                    <div className="absolute inset-[10%] rounded-[0.75rem] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(255,255,255,0.06))]" />
                    <div className="absolute left-[12%] top-[18%] h-[18%] w-[18%] rounded-full bg-white/95 shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                    <div className="absolute right-[12%] top-[18%] h-[18%] w-[18%] rounded-full bg-white/95 shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
                    <div className="absolute inset-x-[18%] bottom-[12%] h-[20%] rounded-full bg-cyan-100/45 blur-sm" />
                  </div>

                  {player.grounded ? (
                    <div
                      className="absolute h-2 rounded-full bg-[radial-gradient(circle,rgba(115,246,255,0.75),transparent_70%)] blur-[2px]"
                      style={{
                        left: `${player.x + 4}px`,
                        top: `${player.y + PLAYER_SIZE - 4}px`,
                        width: `${PLAYER_SIZE - 8}px`,
                      }}
                    />
                  ) : null}
                </div>

                {status !== 'playing' ? (
                  <div className="absolute inset-0 grid place-items-center bg-black/42 backdrop-blur-[2px]">
                    <div className="max-w-xs rounded-[1.4rem] border border-cyan-300/30 bg-black/55 px-5 py-6 text-center shadow-[0_0_28px_rgba(34,211,238,0.18)]">
                      <div className="text-[0.65rem] uppercase tracking-[0.45em] text-cyan-200/75">Arcade Status</div>
                      <div className="mt-3 text-3xl font-black uppercase tracking-[0.12em] text-transparent bg-[linear-gradient(180deg,#fff,#68f5ff,#ff58d7)] bg-clip-text">
                        {status === 'idle' ? 'Press Start' : status === 'gameOver' ? 'Game Over' : 'Level Clear'}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/70">{message}</p>
                      <div className="mt-4 flex justify-center gap-3">
                        {status === 'gameOver' || status === 'levelComplete' ? (
                          <button
                            type="button"
                            onClick={handleStart}
                            className="rounded-full border border-cyan-300/45 bg-cyan-300/12 px-5 py-3 text-xs font-black uppercase tracking-[0.35em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5 hover:bg-cyan-300/18"
                          >
                            {status === 'gameOver' ? 'Retry' : 'Replay'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-[0.62rem] uppercase tracking-[0.45em] text-cyan-200/75">Controls</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">Arrow Keys</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">WASD</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">Space / Up</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">R restart</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/68">
              El cubo tiene poca friccion, cae rapido y gana impulso en pendientes. El control importante no es correr
              mucho, sino conservar el ritmo correcto entre rampas y saltos.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between">
              <div className="text-[0.62rem] uppercase tracking-[0.45em] text-fuchsia-200/75">Arcade Pad</div>
              <div className="text-[0.58rem] uppercase tracking-[0.35em] text-white/45">Touch friendly</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div />
              <button
                type="button"
                onClick={requestJump}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/35 bg-cyan-400/10 text-[0.56rem] font-black uppercase tracking-[0.28em] text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:bg-cyan-300/16 active:translate-y-0 active:scale-95"
              >
                Jump
              </button>
              <div />
              <button
                type="button"
                onPointerDown={() => hold('left', true)}
                onPointerUp={() => hold('left', false)}
                onPointerLeave={() => hold('left', false)}
                onPointerCancel={() => hold('left', false)}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-black/35 text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-100 shadow-[0_0_18px_rgba(255,88,215,0.18)] transition hover:-translate-y-0.5 hover:border-fuchsia-200/70 hover:bg-fuchsia-400/12"
              >
                Left
              </button>
              <button
                type="button"
                onClick={handleStart}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-fuchsia-300/35 bg-fuchsia-400/10 text-[0.56rem] font-black uppercase tracking-[0.28em] text-fuchsia-100 shadow-[0_0_18px_rgba(255,0,204,0.18)] transition hover:-translate-y-0.5 hover:bg-fuchsia-300/16 active:translate-y-0 active:scale-95"
              >
                Start
              </button>
              <button
                type="button"
                onPointerDown={() => hold('right', true)}
                onPointerUp={() => hold('right', false)}
                onPointerLeave={() => hold('right', false)}
                onPointerCancel={() => hold('right', false)}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-black/35 text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-100 shadow-[0_0_18px_rgba(255,88,215,0.18)] transition hover:-translate-y-0.5 hover:border-fuchsia-200/70 hover:bg-fuchsia-400/12"
              >
                Right
              </button>
              <div />
              <div />
              <button
                type="button"
                onClick={() => {
                  runtimeRef.current = createInitialRuntime();
                  setStatus('idle');
                  forceRender((value) => value + 1);
                }}
                className="grid h-12 w-full place-items-center rounded-2xl border border-white/12 bg-black/35 px-4 text-[0.56rem] font-black uppercase tracking-[0.28em] text-white/80 shadow-[0_0_18px_rgba(255,255,255,0.1)] transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/8 active:translate-y-0 active:scale-95"
              >
                Reset
              </button>
              <div />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-4 top-4 animate-float-particle rounded-full bg-cyan-200/30 px-3 py-1 text-[0.55rem] uppercase tracking-[0.45em] text-cyan-50">
          Ice Mode
        </div>
      </div>
    </section>
  );
}
