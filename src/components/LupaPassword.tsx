// components/LupaPassword.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoadingIndicator } from "./LoadingIndicator";

export default function ForgotPassword() {
  const [nip, setNip] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckNip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password/check-nip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip }),
      });

      setLoading(false);

      if (!response.ok) {
        throw new Error('NIP tidak ditemukan.');
      }

      const data = await response.json();
      router.push(`/lupa-password/reset-password?userId=${data.userId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-xs p-4 space-y-6 bg-white rounded-lg shadow-md sm:max-w-sm md:max-w-md sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
        <Image src="/images/logo2.png" alt="Logo" width={200} height={100} className="mb-4" />
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2 self-start">
          Lupa Password
        </h2>
        <p className="text-sm self-start text-gray-500 sm:text-base">
          Masukkan NIP Anda untuk mencari akun Anda.
        </p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleCheckNip}>
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
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? <LoadingIndicator /> : 'Cari Akun'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Kembali ke halaman{" "}
        <a href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500">
          Masuk
        </a>
      </p>
    </div>
  );
}
