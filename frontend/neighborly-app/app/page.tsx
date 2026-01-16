import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-24">
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-bold text-white mb-2">Neighborly 🏡</h1>
        <p className="text-slate-400 text-lg">
          Help your neighbors, help yourself.
        </p>
      </div>

      <LoginForm />
    </main>
  );
}
