import GoogleAuthCard from "@/components/google-auth-card";

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#0b0b0b]">
      <div className="flex min-h-dvh items-center justify-center px-6 py-10">
        <GoogleAuthCard />
      </div>
    </main>
  );
}
