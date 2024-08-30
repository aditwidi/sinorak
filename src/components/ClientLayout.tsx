"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar"; // Ensure this path points to your Sidebar component

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <SessionProvider>
            {/* Layout Wrapper with Off-White Background */}
            <div className="min-h-screen bg-gray-50"> {/* Off-white background */}
                {/* Sidebar Component */}
                <Sidebar>
                    {children} {/* Render the page-specific content */}
                </Sidebar>
            </div>
        </SessionProvider>
    );
}
