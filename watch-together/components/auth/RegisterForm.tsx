"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function RegisterForm() {
  const { signUp } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await signUp({ username, email, password });
      setSuccess("Account created successfully. You can now log in.");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <div>
        <label htmlFor="username" className="mb-1 block text-sm">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded border border-zinc-600 bg-zinc-900 p-2 text-white"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="mb-1 block text-sm">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border border-zinc-600 bg-zinc-900 p-2 text-white"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="mb-1 block text-sm">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded border border-zinc-600 bg-zinc-900 p-2 text-white"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
      >
        {isSubmitting ? "Creating account..." : "Register"}
      </button>

      <p className="text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-white underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
