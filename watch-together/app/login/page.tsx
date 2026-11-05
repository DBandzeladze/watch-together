import { Suspense } from "react";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 text-white">
          <div className="mx-auto max-w-5xl space-y-6 p-6">Loading Page...</div>
        </main>
      }
    >
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
        <LoginForm />
      </main>
    </Suspense>
  );
}
