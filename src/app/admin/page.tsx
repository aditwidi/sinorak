// app/admin/page.tsx
"use client";

import { useSession, SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar"; // Ensure this path points to your Sidebar component

export default function AdminPage() {
  // Ensure the session provider is included
  return (
    <SessionProvider>
      <div className="flex bg-gray-50 min-h-screen"> {/* Added bg-gray-50 for off-white background */}
        {/* Sidebar Component */}
        <Sidebar />
      </div>
    </SessionProvider>
  );
}
