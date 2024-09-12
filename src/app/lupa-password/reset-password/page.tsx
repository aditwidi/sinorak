// app/lupa-password/reset-password/page.tsx
import { Suspense } from 'react';
import ResetPassword from "@/components/ResetPassword";

// Set page-specific metadata
export const metadata = {
  title: "Reset Password - SINORA",
  description: "Reset password akun Anda di SINORA.",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  );
}
