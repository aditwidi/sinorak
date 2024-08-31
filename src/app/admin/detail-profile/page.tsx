"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2"; // Import SweetAlert2
import Breadcrumb from "@/components/Breadcrumb";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { LoadingIndicator } from "@/components/LoadingIndicator"; // Import the LoadingIndicator component
import Skeleton from "react-loading-skeleton"; // Import the Skeleton component
import "react-loading-skeleton/dist/skeleton.css"; // Import the Skeleton CSS

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function EditProfilePage() {
    const { data: session, status } = useSession(); // Get session data
    const [name, setName] = useState("");
    const [nip, setNip] = useState("");
    const [role, setRole] = useState<"admin" | "user">("user"); // Default role
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Separate loading states
    const [loadingPasswordChange, setLoadingPasswordChange] = useState(false);
    const [loadingRoleChange, setLoadingRoleChange] = useState(false);

    // Separate state variables for each password field
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const breadcrumbItems: BreadcrumbItem[] = [{ label: "Detail Profil" }];

    // Load session data when the session status changes
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setName(session.user.name || "");
            setNip(session.user.nip || "");
            setRole(session.user.role as "admin" | "user");
        }
    }, [session, status]);

    const handleRoleChange = async () => {
        if (!session || !session.user) return; // Ensure session is available

        setLoadingRoleChange(true);
        try {
            const response = await fetch("/api/change-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nip: session.user.nip, newRole: role }),
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Terjadi kesalahan saat memperbarui role.",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Role berhasil diperbarui.",
                }).then(async () => {
                    // Automatically sign the user out after a successful role change
                    await signOut({ redirect: true, callbackUrl: "/sign-in" }); // Redirect to the login page
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan pada server.",
            });
        } finally {
            setLoadingRoleChange(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Password baru dan konfirmasi tidak cocok.",
            });
            return;
        }

        setLoadingPasswordChange(true);

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nip, oldPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Terjadi kesalahan.",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Password berhasil diubah.",
                });
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan.",
            });
        } finally {
            setLoadingPasswordChange(false);
        }
    };

    return (
        <div className="w-full text-black">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Profile Detail Section */}
            <h1 className="text-2xl font-bold mt-4">Detail Profile</h1>

            <div className="mt-6 space-y-8">
                {/* Detail Profile */}
                <section>
                    <form className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            {status === "loading" ? (
                                <Skeleton height={38} style={{ borderRadius: "0.375rem" }} />
                            ) : (
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    readOnly
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>

                        {/* NIP Field */}
                        <div>
                            <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                                NIP
                            </label>
                            {status === "loading" ? (
                                <Skeleton height={38} style={{ borderRadius: "0.375rem" }} />
                            ) : (
                                <input
                                    type="text"
                                    id="nip"
                                    value={nip}
                                    readOnly
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>

                        {/* Role Field */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            {status === "loading" ? (
                                <Skeleton height={38} style={{ borderRadius: "0.375rem" }} />
                            ) : (
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as "admin" | "user")}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            )}
                        </div>

                        {/* Save Role Button */}
                        <button
                            type="button"
                            onClick={handleRoleChange}
                            disabled={loadingRoleChange}
                            className="mt-4 w-auto flex justify-center items-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 relative"
                            style={{ minWidth: "150px" }}
                        >
                            {loadingRoleChange ? <LoadingIndicator /> : "Simpan Perubahan Role"}
                        </button>
                    </form>
                </section>

                {/* Change Password Section */}
                <section>
                    <h2 className="text-xl font-bold mt-8">Ubah Password</h2>
                    <form className="space-y-4 mt-4 py-4">
                        <div>
                            <label htmlFor="old-password" className="block text-sm font-medium text-gray-700">
                                Password Lama
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showOldPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    minLength={4}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    placeholder="Masukkan Password Lama Anda"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
                                    aria-label="Toggle Password Visibility"
                                >
                                    {showOldPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                Password Baru
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showNewPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={4}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    placeholder="Masukkan Password Baru Anda"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
                                    aria-label="Toggle Password Visibility"
                                >
                                    {showNewPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={4}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                    placeholder="Konfirmasi Password Baru Anda"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500 focus:outline-none"
                                    aria-label="Toggle Password Visibility"
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Save Password Button */}
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            disabled={loadingPasswordChange}
                            className="mt-4 w-auto flex justify-center items-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 relative"
                            style={{ minWidth: '150px' }} // Adjust the minWidth as needed to match the desired button size
                        >
                            {loadingPasswordChange ? <LoadingIndicator /> : "Ubah Password"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
