import { ReactNode } from "react";
import ClientLayout from "@/components/ClientLayout"; // Use the reusable client layout component

export const metadata = {
  title: "Halaman Beranda - SINORAK",
  description: "Halaman beranda Admin SINORAK",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ClientLayout>
      {children} {/* Pass children to the client layout */}
    </ClientLayout>
  );
}
