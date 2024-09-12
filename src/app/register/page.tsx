// app/register/page.tsx
import { Register } from "@/components/Register";

// Set page-specific metadata
export const metadata = {
  title: "Daftar Akun - SINORA",
  description: "Daftar Akun pada SINORA.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:px-6 lg:px-8">
      <Register />
    </div>
  );
}
