import { ReactNode } from "react";
import ClientLayout from "@/components/UserClientLayout"; // Use the reusable client layout component

export const metadata = {
    title: "Halaman Beranda - SINORAK",
    description: "Halaman beranda User SINORAK",
};

export default function UserLayout({ children }: { children: ReactNode }) {
    return (
        <ClientLayout>
            <div className="bg-gray-50 min-h-screen"> {/* Set the background to off-white */}
                {children} {/* Pass children to the client layout */}
            </div>
        </ClientLayout>
    );
}
