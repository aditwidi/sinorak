// app/lupa-password/page.tsx
import ForgotPassword from "@/components/LupaPassword"; // Correct the import

// Set page-specific metadata
export const metadata = {
  title: "Lupa Password - SINORA",
  description: "Cari akun anda pada SINORA.",
};

export default function LupaPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:px-6 lg:px-8">
      <ForgotPassword /> {/* Use the imported default component */}
    </div>
  );
}
