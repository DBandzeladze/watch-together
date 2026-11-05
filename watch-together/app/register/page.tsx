import { Suspense } from "react";
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-zinc-950 text-white">
          <div className="mx-auto max-w-5xl space-y-6 p-6">Loading room...</div>
        </main>
      }
    >
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
        <RegisterForm />
      </main>
    </Suspense>
  );
}
