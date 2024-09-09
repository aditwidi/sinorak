"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // Import SweetAlert2
import Breadcrumb from "@/components/Breadcrumb"; // Import Breadcrumb component
import { LoadingIndicator } from "@/components/LoadingIndicator"; // Import LoadingIndicator component
import Skeleton from "react-loading-skeleton"; // Import the Skeleton component
import "react-loading-skeleton/dist/skeleton.css"; // Import the Skeleton CSS

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function TambahMitraPage() {
    const { data: session, status } = useSession(); // Get session data
    const router = useRouter();
    // State for form fields
    const [sobatId, setSobatId] = useState(""); // Corresponds to 'sobat_id' in schema
    const [nik, setNik] = useState(""); // Corresponds to 'nik' in schema
    const [jenisPetugas, setJenisPetugas] = useState<"Pendataan" | "Pemeriksaan" | "Pengolahan">("Pendataan"); // Default value
    const [nama, setNama] = useState(""); // Corresponds to 'nama' in schema
    const [pekerjaan, setPekerjaan] = useState(""); // Corresponds to 'pekerjaan' in schema
    const [alamat, setAlamat] = useState(""); // Corresponds to 'alamat' in schema
    const [jenisKelamin, setJenisKelamin] = useState<"Laki-laki" | "Perempuan">("Laki-laki"); // Default value
    const [loading, setLoading] = useState(false); // Loading state for form submission

    // Define breadcrumb items
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik" },
        { label: "Tambah Data Mitra Statistik" }
    ];

    // Input validation functions
    const handleSobatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Only allow numbers
            setSobatId(value);
        }
    };

    const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Only allow numbers
            setNik(value);
        }
    };

    const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s.,-]*$/.test(value)) { // Allow letters, spaces, periods, commas, and hyphens
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
            const response = await fetch("/api/tambah-mitra", {
                method: "POST", // Ensure the method is POST
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sobat_id: sobatId,
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
                    text: data.error || "Terjadi kesalahan saat menambahkan mitra.",
                });
            } else {
                // Show success alert with SweetAlert2
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Mitra berhasil ditambahkan.",
                }).then(() => {
                    router.push("/admin/daftar-mitra"); // Redirect back to the main page after success
                });

                // Clear the form fields after successful submission
                setSobatId("");
                setNik("");
                setJenisPetugas("Pendataan");
                setNama("");
                setPekerjaan("");
                setAlamat("");
                setJenisKelamin("Laki-laki");
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

    // Function to handle redirect to the Upload Mitra page
    const handleRedirectToUpload = () => {
        router.push("/admin/upload-mitra");
    };

    return (
        <div className="w-full text-black">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Title */}
            <h1 className="text-2xl font-bold mt-4">Tambah Data Mitra Statistik</h1>

            {/* Form Section */}
            <div className="mt-6 space-y-8">
                <section>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Sobat ID - NIK */}
                        <div>
                            <label htmlFor="sobat_id" className="block text-sm font-medium text-gray-700">
                                Sobat ID
                            </label>
                            <input
                                type="text"
                                id="sobat_id"
                                value={sobatId}
                                onChange={handleSobatIdChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan Sobat ID"
                            />
                        </div>
                        <div>
                            <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
                                NIK
                            </label>
                            <input
                                type="text"
                                id="nik"
                                value={nik}
                                onChange={handleNikChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan NIK Mitra"
                            />
                        </div>

                        {/* Jenis Petugas - Jenis Kelamin */}
                        <div>
                            <label htmlFor="jenis-petugas" className="block text-sm font-medium text-gray-700">
                                Jenis Petugas
                            </label>
                            <select
                                id="jenis-petugas"
                                value={jenisPetugas}
                                onChange={(e) => setJenisPetugas(e.target.value as "Pendataan" | "Pemeriksaan" | "Pengolahan")}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Pendataan">Pendataan</option>
                                <option value="Pemeriksaan">Pemeriksaan</option>
                                <option value="Pengolahan">Pengolahan</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="jenis-kelamin" className="block text-sm font-medium text-gray-700">
                                Jenis Kelamin
                            </label>
                            <select
                                id="jenis-kelamin"
                                value={jenisKelamin}
                                onChange={(e) => setJenisKelamin(e.target.value as "Laki-laki" | "Perempuan")}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>

                        {/* Nama - Pekerjaan */}
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            <input
                                type="text"
                                id="nama"
                                value={nama}
                                onChange={handleNamaChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan Nama Mitra"
                            />
                        </div>
                        <div>
                            <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">
                                Pekerjaan
                            </label>
                            <input
                                type="text"
                                id="pekerjaan"
                                value={pekerjaan}
                                onChange={handlePekerjaanChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan Pekerjaan Mitra"
                            />
                        </div>

                        {/* Alamat Field - Single Column */}
                        <div className="md:col-span-2">
                            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                                Alamat
                            </label>
                            <textarea
                                id="alamat"
                                value={alamat}
                                onChange={handleAlamatChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan Alamat Mitra"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2 flex pb-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-auto flex justify-center items-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                                style={{ minWidth: "150px" }}
                            >
                                {loading ? <LoadingIndicator /> : "Tambah Mitra"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            {/* Divider */}
            <hr className="my-8 border-gray-300" />

            {/* Page Title */}
            <h1 className="text-xl font-bold mt-4">Upload Data Mitra</h1>
            <p className="text-sm text-gray-600">Fitur upload data mitra digunakan untuk menambahkan data mitra secara batch.</p>

            {/* Option to upload data */}
            <div className="mt-6 pb-6">
                <button
                    onClick={handleRedirectToUpload}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Upload Data Mitra
                </button>
            </div>
        </div>
    );
}
