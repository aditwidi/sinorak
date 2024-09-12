// app/sign-in/page.tsx
import { SignIn } from "@/components/SignIn";

// Set page-specific metadata
export const metadata = {
  title: "Sign In - SINORA",
  description: "Masuk untuk memulai SINORA.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 py-12 sm:px-6 lg:px-8">
      <SignIn />
    </div>
  );
}
