"use client";

import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
    Bars3Icon,
    UserCircleIcon,
    HomeIcon,
    ChevronDownIcon,
    BriefcaseIcon,
    UserGroupIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { LoadingIndicator } from "./LoadingIndicator";

interface LayoutProps {
    children: ReactNode; // Prop to accept dynamic content
}

const LightSidebar: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isDropdownKegiatanOpen, setIsDropdownKegiatanOpen] = useState<boolean>(false);
    const [isDropdownMitraOpen, setIsDropdownMitraOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

    const { data: session } = useSession();
    const pathname = usePathname();

    const userMenuRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const toggleDropdownKegiatan = () => setIsDropdownKegiatanOpen((prev) => !prev);
    const toggleDropdownMitra = () => setIsDropdownMitraOpen((prev) => !prev);
    const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

    const handleLogout = () => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Anda akan keluar dari akun ini.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            cancelButtonText: "Batal",
            confirmButtonText: "Ya, yakin!",
        }).then((result) => {
            if (result.isConfirmed) {
                setLoading(true);
                signOut({
                    callbackUrl: "/sign-in",
                });
            }
        });
    };

    // Memoize the `isActive` function to avoid re-creation on each render
    const isActive = useCallback((path: string): boolean => pathname === path, [pathname]);

    const handleClickOutside = (event: MouseEvent) => {
        if (
            sidebarRef.current &&
            !sidebarRef.current.contains(event.target as Node) &&
            userMenuRef.current &&
            !userMenuRef.current.contains(event.target as Node)
        ) {
            setIsSidebarOpen(false);
            setIsUserMenuOpen(false);
        }
    };

    // Automatically open the parent dropdown menu if a child menu is active
    useEffect(() => {
        if (isActive("/admin/daftar-kegiatan") || isActive("/admin/tambah-kegiatan")) {
            setIsDropdownKegiatanOpen(true);
        } else {
            setIsDropdownKegiatanOpen(false);
        }

        if (isActive("/admin/daftar-mitra") || isActive("/admin/tambah-mitra")) {
            setIsDropdownMitraOpen(true);
        } else {
            setIsDropdownMitraOpen(false);
        }
    }, [isActive]); // Include isActive in the dependency array

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                onClick={toggleSidebar}
                                aria-controls="logo-sidebar"
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                            </button>
                            <a href="/" className="flex ms-2 md:me-24">
                                <Image
                                    src="/images/logo.png"
                                    className="h-8 me-3"
                                    alt="FlowBite Logo"
                                    width={32}
                                    height={32}
                                />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-black">
                                    SINORA
                                </span>
                            </a>
                        </div>
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center ms-3 focus:outline-none"
                            >
                                <UserCircleIcon className="w-8 h-8 text-gray-500" />
                            </button>

                            {isUserMenuOpen && session && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="p-4 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {session.user?.name || "Username"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {session.user?.nip || "12345678"}
                                        </p>
                                    </div>
                                    <ul className="py-1">
                                        <li>
                                            <a
                                                href="/admin/detail-profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Profile
                                            </a>
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Keluar
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
                    }`}
                aria-label="Sidebar"
                ref={sidebarRef}
            >
                <div className="flex flex-col h-full px-3 pb-4 bg-white">
                    <ul className="flex-grow space-y-2 font-medium overflow-y-auto">
                        <li>
                            <a
                                href="/admin"
                                className={`flex items-center p-2 rounded-lg group ${isActive("/admin")
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-900 hover:bg-gray-100"
                                    }`}
                            >
                                <HomeIcon
                                    className={`w-5 h-5 transition duration-75 ${isActive("/admin")
                                        ? "text-white"
                                        : "text-gray-500 group-hover:text-gray-900"
                                        }`}
                                />
                                <span className="ms-3">Home</span>
                            </a>
                        </li>

                        {/* Kegiatan Dropdown */}
                        <li>
                            <button
                                type="button"
                                onClick={toggleDropdownKegiatan}
                                className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group"
                                aria-controls="dropdown-kegiatan"
                                aria-expanded={isDropdownKegiatanOpen}
                            >
                                <BriefcaseIcon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                <span className="flex-1 ms-3 text-left whitespace-nowrap">
                                    Kegiatan Statistik
                                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transition-transform ${isDropdownKegiatanOpen ? "rotate-180" : ""
                                        }`}
                                    aria-hidden="true"
                                />
                            </button>
                            {isDropdownKegiatanOpen && (
                                <ul id="dropdown-kegiatan" className="py-2 space-y-2">
                                    <li>
                                        <a
                                            href="/admin/daftar-kegiatan"
                                            className={`flex items-center w-full p-2 rounded-lg pl-11 group ${isActive("/admin/daftar-kegiatan")
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-900 hover:bg-gray-100"
                                                }`}
                                        >
                                            Daftar Semua Kegiatan
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/admin/tambah-kegiatan"
                                            className={`flex items-center w-full p-2 rounded-lg pl-11 group ${isActive("/admin/tambah-kegiatan")
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-900 hover:bg-gray-100"
                                                }`}
                                        >
                                            Tambah Kegiatan
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Mitra Dropdown */}
                        <li>
                            <button
                                type="button"
                                onClick={toggleDropdownMitra}
                                className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group"
                                aria-controls="dropdown-mitra"
                                aria-expanded={isDropdownMitraOpen}
                            >
                                <UserGroupIcon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                <span className="flex-1 ms-3 text-left whitespace-nowrap">
                                    Mitra Statistik
                                </span>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transition-transform ${isDropdownMitraOpen ? "rotate-180" : ""
                                        }`}
                                    aria-hidden="true"
                                />
                            </button>
                            {isDropdownMitraOpen && (
                                <ul id="dropdown-mitra" className="py-2 space-y-2">
                                    <li>
                                        <a
                                            href="/admin/daftar-mitra"
                                            className={`flex items-center w-full p-2 rounded-lg pl-11 group ${isActive("/admin/daftar-mitra")
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-900 hover:bg-gray-100"
                                                }`}
                                        >
                                            Daftar Semua Mitra
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/admin/tambah-mitra"
                                            className={`flex items-center w-full p-2 rounded-lg pl-11 group ${isActive("/admin/tambah-mitra")
                                                ? "bg-blue-500 text-white"
                                                : "text-gray-900 hover:bg-gray-100"
                                                }`}
                                        >
                                            Tambah Mitra
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center w-full p-2 transition duration-75 rounded-lg group ${loading
                                ? "bg-blue-500 text-white cursor-not-allowed"
                                : "text-red-600 hover:bg-red-100"
                                }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoadingIndicator />
                                    <span className="ml-2">Memproses</span>
                                </>
                            ) : (
                                <>
                                    <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-600 transition duration-75 group-hover:text-red-800" />
                                    <span className="ms-3">Keluar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 ml-0 sm:ml-64 pt-20 px-4`}> {/* Adjust the main content area */}
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </>
    );
};

export default LightSidebar;
