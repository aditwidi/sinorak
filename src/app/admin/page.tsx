// app/admin/page.tsx
"use client";

import Sidebar from "@/components/Sidebar"; // Ensure this path points to your Sidebar component

export default function AdminPage() {
  return (
    <div className="flex bg-gray-50 min-h-screen"> {/* Added bg-gray-50 for off-white background */}
      {/* Sidebar Component */}
      <Sidebar />
    </div>
  );
}
