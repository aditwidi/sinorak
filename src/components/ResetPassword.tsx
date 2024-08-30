// components/ResetPassword.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { LoadingIndicator } from "./LoadingIndicator";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();

  // Redirect if no userId is present
  useEffect(() => {
    if (!userId) {
      router.push("/error"); // Replace with your desired error or redirect page
    }
  }, [userId, router]);

  // If userId is not found, prevent rendering of the component
  if (!userId) {
    return null; // Optionally render a loading spinner or a message here
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });

      setLoading(false);

      if (!response.ok) {
        throw new Error("Failed to update password.");
      }

      // Display SweetAlert on success
      Swal.fire({
        title: "Berhasil!",
        text: "Password berhasil terupdate.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 mt-2",
        },
      }).then(() => {
        router.push("/sign-in"); // Redirect to sign-in page after closing alert
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-xs p-4 space-y-6 bg-white rounded-lg shadow-md sm:max-w-sm md:max-w-md sm:p-6 lg:p-8">
      <div className="flex flex-col items-center">
        <Image
          src="/images/logo2.png"
          alt="Logo"
          width={200}
          height={100}
          className="mb-4"
        />
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2 self-start">
          Reset Password
        </h2>
        <p className="text-sm text-gray-500 sm:text-base">
          Masukkan password baru Anda untuk mengatur ulang kata sandi.
        </p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleResetPassword}>
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700"
          >
            Password Baru
          </label>
          <div className="relative mt-1">
            <input
              id="new-password"
              name="new-password"
              type={showNewPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Masukkan Password Baru Anda"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
              aria-label="Toggle New Password Visibility"
            >
              {showNewPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Konfirmasi Password Baru
          </label>
          <div className="relative mt-1">
            <input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Konfirmasi Password Baru Anda"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
              aria-label="Toggle Confirm Password Visibility"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? <LoadingIndicator /> : "Update Password"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Kembali ke halaman{" "}
        <a
          href="/sign-in"
          className="font-semibold text-blue-600 hover:text-blue-500"
        >
          Masuk
        </a>
      </p>
    </div>
  );
}
