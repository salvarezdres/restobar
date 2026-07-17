import IcePlatformerGame from '@/components/ice-platformer-game';

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,0,204,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(0,255,255,0.18),_transparent_28%),linear-gradient(180deg,_#05010d_0%,_#090015_48%,_#020205_100%)] text-white">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
        <div className="pointer-events-none absolute inset-0 arcade-vignette" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <IcePlatformerGame />
        </div>
      </div>
    </main>
  );
}
