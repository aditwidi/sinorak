// app/admin/[sobat_id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2"; // Import SweetAlert2
import Skeleton from "react-loading-skeleton"; // Import Skeleton component
import "react-loading-skeleton/dist/skeleton.css"; // Import Skeleton styles
import Breadcrumb from "@/components/Breadcrumb"; // Import Breadcrumb component
import { LoadingIndicator } from "@/components/LoadingIndicator"; // Import LoadingIndicator component

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function EditMitraPage() {
    const router = useRouter();
    const params = useParams(); // Get dynamic route parameters
    const { sobat_id } = params; // Extract the sobat_id from the URL

    // State for form fields
    const [sobatId, setSobatId] = useState(sobat_id || ""); // Corresponds to 'sobat_id' in schema
    const [nik, setNik] = useState(""); // Corresponds to 'nik' in schema
    const [jenisPetugas, setJenisPetugas] = useState<"Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan">("Pendataan"); // Default value
    const [nama, setNama] = useState(""); // Corresponds to 'nama' in schema
    const [pekerjaan, setPekerjaan] = useState(""); // Corresponds to 'pekerjaan' in schema
    const [alamat, setAlamat] = useState(""); // Corresponds to 'alamat' in schema
    const [jenisKelamin, setJenisKelamin] = useState<"Laki-laki" | "Perempuan">("Laki-laki"); // Default value
    const [loading, setLoading] = useState(false); // Loading state for form submission

    // Define breadcrumb items
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik", href: "/admin/daftar-mitra" },
        { label: "Edit Data Mitra Statistik" },
    ];

    // Fetch existing data on component mount
    useEffect(() => {
        if (sobatId) {
            const fetchData = async () => {
                setLoading(true); // Start loading
                try {
                    const response = await fetch(`/api/get-mitra?sobat_id=${sobatId}`); // Fetch existing mitra data
                    const data = await response.json();

                    if (response.ok) {
                        // Pre-fill the form fields with existing data
                        setNik(data.nik);
                        setJenisPetugas(data.jenis_petugas);
                        setNama(data.nama);
                        setPekerjaan(data.pekerjaan);
                        setAlamat(data.alamat);
                        setJenisKelamin(data.jenis_kelamin);
                    } else {
                        console.error("Failed to fetch mitra data:", data.error);
                        // Redirect or show error if needed
                    }
                } catch (error) {
                    console.error("Error fetching mitra data:", error);
                } finally {
                    setLoading(false); // Stop loading
                }
            };

            fetchData();
        }
    }, [sobatId]); // Dependency on sobatId to fetch data

    // Input validation functions
    const handleSobatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            // Only allow numbers
            setSobatId(value);
        }
    };

    const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            // Only allow numbers
            setNik(value);
        }
    };

    const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s.,-]*$/.test(value)) {
            // Only allow letters and spaces
            setNama(value);
        }
    };

    const handlePekerjaanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""); // Remove special characters
        setPekerjaan(value);
    };

    const handleAlamatChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, ""); // Allow letters, numbers, spaces, commas, periods, and hyphens
        setAlamat(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/edit-mitra?sobat_id=${sobatId}`, {
                method: "PUT", // Use PUT for updating data
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nik,
                    jenis_petugas: jenisPetugas,
                    nama,
                    pekerjaan,
                    alamat,
                    jenis_kelamin: jenisKelamin,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show error alert with SweetAlert2
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Terjadi kesalahan saat memperbarui mitra.",
                });
            } else {
                // Show success alert with SweetAlert2
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Mitra berhasil diperbarui.",
                }).then(() => {
                    router.push("/admin/daftar-mitra"); // Redirect back to the main page after success
                });
            }
        } catch (error) {
            console.error("Error:", error);
            // Show error alert with SweetAlert2
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan pada server.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full text-black">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Title */}
            <h1 className="text-2xl font-bold mt-4">Edit Data Mitra Statistik</h1>

            {/* Form Section */}
            <div className="mt-6 space-y-8">
                <section>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Sobat ID - NIK */}
                        <div>
                            <label htmlFor="sobat_id" className="block text-sm font-medium text-gray-700">
                                Sobat ID
                            </label>
                            {loading ? (
                                <Skeleton height={40} />
                            ) : (
                                <input
                                    type="text"
                                    id="sobat_id"
                                    value={sobatId}
                                    onChange={handleSobatIdChange}
                                    required
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan Sobat ID"
                                    disabled // Sobat ID should be disabled to prevent changes
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
                                NIK
                            </label>
                            {loading ? (
                                <Skeleton height={40} />
                            ) : (
                                <input
                                    type="text"
                                    id="nik"
                                    value={nik}
                                    onChange={handleNikChange}
                                    required
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan NIK Mitra"
                                />
                            )}
                        </div>

                        {/* Jenis Petugas - Jenis Kelamin */}
                        <div>
                            <label htmlFor="jenis-petugas" className="block text-sm font-medium text-gray-700">
                                Jenis Petugas
                            </label>
                            {loading ? (
                                <Skeleton height={40} />
                            ) : (
                                <select
                                    id="jenis-petugas"
                                    value={jenisPetugas}
                                    onChange={(e) => setJenisPetugas(e.target.value as "Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan")}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Pendataan">Pendataan</option>
                                    <option value="Pengolahan">Pengolahan</option>
                                    <option value="Pendataan dan Pengolahan">Pendataan dan Pengolahan</option>
                                </select>
                            )}
                        </div>
                        <div>
                            <label htmlFor="jenis-kelamin" className="block text-sm font-medium text-gray-700">
                                Jenis Kelamin
                            </label>
                            {loading ? (
                                <Skeleton height={40} />
                            ) : (
                                <select
                                    id="jenis-kelamin"
                                    value={jenisKelamin}
                                    onChange={(e) => setJenisKelamin(e.target.value as "Laki-laki" | "Perempuan")}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            )}
                        </div>

                        {/* Nama - Pekerjaan */}
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            {loading ? (
                                <Skeleton height={40} />
                            ) : (
                                <input
                                    type="text"
                                    id="nama"
                                    value={nama}
                                    onChange={handleNamaChange}
                                    required
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan Nama Mitra"
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">
                                Pekerjaan
                            </label>
                            {loading ? (
                                <Skeleton height={40} />
                            ) : (
                                <input
                                    type="text"
                                    id="pekerjaan"
                                    value={pekerjaan}
                                    onChange={handlePekerjaanChange}
                                    required
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan Pekerjaan Mitra"
                                />
                            )}
                        </div>

                        {/* Alamat Field - Single Column */}
                        <div className="md:col-span-2">
                            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                                Alamat
                            </label>
                            {loading ? (
                                <Skeleton height={80} />
                            ) : (
                                <textarea
                                    id="alamat"
                                    value={alamat}
                                    onChange={handleAlamatChange}
                                    required
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Masukkan Alamat Mitra"
                                ></textarea>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2 flex pb-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-auto flex justify-center items-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                                style={{ minWidth: "150px" }}
                            >
                                {loading ? <LoadingIndicator /> : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
