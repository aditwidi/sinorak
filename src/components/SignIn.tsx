// components/SignIn.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { LoadingIndicator } from "./LoadingIndicator";

export function SignIn() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", { redirect: false, nip, password });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      const session = await fetch("/api/auth/session").then((res) => res.json());

      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else if (session?.user?.role === "user") {
        router.push("/user");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="w-full max-w-xs p-4 space-y-6 bg-white rounded-lg shadow-md sm:max-w-sm md:max-w-md sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
        <Image src="/images/logo2.png" alt="Logo" width={200} height={100} className="mb-4" />
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2 self-start">
          Selamat Datang di SINORA!
        </h2>
        <p className="text-sm text-gray-500 sm:text-base">
          Masukan informasi akun anda yang telah terdaftar.
        </p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
            NIP
          </label>
          <input
            id="nip"
            name="nip"
            type="text"
            autoComplete="off"
            required
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            pattern="\d{9,18}"
            title="NIP harus terdiri dari 9 sampai 18 angka."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Masukkan NIP Anda"
          />
          {error === "NIP anda tidak terdaftar." && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Masukkan Password Anda"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {error === "Password salah." && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <a href="/lupa-password" className="text-sm text-blue-600 hover:text-blue-500">
            Lupa Password?
          </a>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? <LoadingIndicator /> : "Masuk"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Tidak punya akun?{" "}
        <a href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
          Daftar
        </a>
      </p>
    </div>
  );
}