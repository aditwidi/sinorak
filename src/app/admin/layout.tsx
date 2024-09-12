import { ReactNode } from "react";
import ClientLayout from "@/components/ClientLayout"; // Use the reusable client layout component

export const metadata = {
  title: "Halaman Beranda - SINORA",
  description: "Halaman beranda Admin SINORA",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ClientLayout>
      <div className="bg-gray-50 min-h-screen"> {/* Set the background to off-white */}
        {children} {/* Pass children to the client layout */}
      </div>
    </ClientLayout>
  );
}
