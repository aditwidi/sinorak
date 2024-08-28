// app/admin/page.tsx
'use client';
import { signOut } from 'next-auth/react';

export default function AdminPage() {
  const handleSignOut = () => {
    signOut({
      callbackUrl: '/sign-in', // Redirect URL after sign-out
    });
  };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to the Admin Page!
      </h1>
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>
    );
  }
  