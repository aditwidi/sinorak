"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
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

const LightSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownKegiatanOpen, setIsDropdownKegiatanOpen] = useState(false);
    const [isDropdownMitraOpen, setIsDropdownMitraOpen] = useState(false);
    const [loading, setLoading] = useState(false); // State to handle loading spinner

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const toggleDropdownKegiatan = () => {
        setIsDropdownKegiatanOpen((prev) => !prev);
    };

    const toggleDropdownMitra = () => {
        setIsDropdownMitraOpen((prev) => !prev);
    };

    // Handle logout with SweetAlert confirmation
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
                setLoading(true); // Show the spinner
                // Initiate sign out
                signOut({
                    callbackUrl: "/sign-in", // Redirect URL after sign-out
                });
            }
        });
    };

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            {/* Toggle Button */}
                            <button
                                onClick={toggleSidebar}
                                aria-controls="logo-sidebar"
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                            </button>
                            {/* Logo */}
                            <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                                <Image
                                    src="/images/logo.png"
                                    className="h-8 me-3"
                                    alt="FlowBite Logo"
                                    width={32}
                                    height={32}
                                />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-black">
                                    SINORAK
                                </span>
                            </a>
                        </div>
                        {/* User Menu */}
                        <div className="flex items-center">
                            <div className="flex items-center ms-3">
                                <UserCircleIcon className="w-8 h-8 text-gray-500" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
                    }`}
                aria-label="Sidebar"
            >
                <div className="flex flex-col h-full px-3 pb-4 bg-white">
                    <ul className="flex-grow space-y-2 font-medium overflow-y-auto">
                        <li>
                            <a
                                href="#"
                                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                            >
                                <HomeIcon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                <span className="ms-3">Home</span>
                            </a>
                        </li>

                        {/* Multi-Level Menu Kegiatan Statistik */}
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
                            {/* Sub-menu Daftar */}
                            {isDropdownKegiatanOpen && (
                                <ul id="dropdown-kegiatan" className="py-2 space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 hover:bg-gray-100 group"
                                        >
                                            Daftar Kegiatan
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 hover:bg-gray-100 group"
                                        >
                                            Tambah Kegiatan
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Multi-Level Menu Mitra Statistik */}
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
                            {/* Sub-menu Mitra */}
                            {isDropdownMitraOpen && (
                                <ul id="dropdown-mitra" className="py-2 space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 hover:bg-gray-100 group"
                                        >
                                            Daftar Mitra
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 hover:bg-gray-100 group"
                                        >
                                            Tambah Mitra
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>

                    {/* Logout Button */}
                    <div className="pt-4 border-t border-gray-200">
                        {loading ? (
                            <button
                                type="button"
                                className="flex items-center w-full p-2 text-white bg-indigo-500 transition duration-75 rounded-lg hover:bg-indigo-600 group"
                                disabled
                            >
                                <svg
                                    className="animate-spin h-5 w-5 mr-3 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                Processing...
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full p-2 text-red-600 transition duration-75 rounded-lg hover:bg-red-100 group"
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-600 transition duration-75 group-hover:text-red-800" />
                                <span className="ms-3">Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg mt-14 bg-white">
                    {/* Main content placeholder */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center justify-center h-24 rounded bg-gray-50">
                            <p className="text-2xl text-gray-400">
                                <svg
                                    className="w-3.5 h-3.5"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 18 18"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 1v16M1 9h16"
                                    />
                                </svg>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LightSidebar;
