"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { LoadingIndicator } from "./LoadingIndicator";
import Swal from "sweetalert2"; // Import SweetAlert2

export function Register() {
  const [nip, setNip] = useState(""); // State for NIP
  const [name, setName] = useState(""); // State for Name
  const [password, setPassword] = useState(""); // State for Password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for Confirm Password
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility
  const [loading, setLoading] = useState(false); // State to manage loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      Swal.fire({
        title: "Password Tidak Cocok",
        text: "Kata sandi dan konfirmasi kata sandi tidak cocok. Silahkan periksa kembali.",
        icon: "error",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#f87171", // Red color for button
      });
      return;
    }

    setLoading(true);

    // Make a POST request to the registration API with NIP, name, and password
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nip, name, password }),
    });

    setLoading(false);

    if (res.ok) {
      // Show SweetAlert success message
      Swal.fire({
        title: "Pendaftaran Berhasil!",
        text: "Akun Anda telah berhasil dibuat! Silahkan masuk untuk melanjutkan.",
        icon: "success",
        confirmButtonText: "Masuk",
        confirmButtonColor: "#3f83f8", // blue color for button
      }).then(() => {
        router.push("/sign-in"); // Redirect to sign-in page on confirmation
      });
    } else {
      const data = await res.json();
      // Show SweetAlert error message
      Swal.fire({
        title: "Pendaftaran Gagal",
        text: data.error || "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#f87171", // Red color for button
      });
    }
  };

  return (
    <div className="w-full max-w-xs p-4 space-y-6 bg-white rounded-lg shadow-md sm:max-w-sm md:max-w-md sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
      <Image src="/images/logo2.png" alt="Logo" width={200} height={100} className="mb-4" />
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2 self-start">Daftar Akun Baru</h2>
        <p className="text-sm text-gray-500 sm:text-base">
          Silakan masukkan informasi untuk membuat akun baru.
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
            title="NIP harus terdiri dari 9 hingga 18 digit angka."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Masukkan NIP Anda"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nama
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="off"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Masukkan Nama Anda"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Kata Sandi
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Masukkan Kata Sandi Anda"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative mt-1">
            <input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Konfirmasi Kata Sandi Anda"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
              aria-label="Toggle Confirm Password Visibility"
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? <LoadingIndicator /> : "Daftar"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <a href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500">
          Masuk
        </a>
      </p>
    </div>
  );
}
