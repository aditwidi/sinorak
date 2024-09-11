"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumb";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function TambahMitraPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State for form fields
    const [sobatId, setSobatId] = useState("");
    const [nik, setNik] = useState("");
    const [jenisPetugas, setJenisPetugas] = useState<"Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan">("Pendataan"); // Updated ENUM
    const [nama, setNama] = useState("");
    const [pekerjaan, setPekerjaan] = useState("");
    const [alamat, setAlamat] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
    const [loading, setLoading] = useState(false);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik" },
        { label: "Tambah Data Mitra Statistik" }
    ];

    // Input validation functions
    const handleSobatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setSobatId(value);
        }
    };

    const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setNik(value);
        }
    };

    const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s.,-]*$/.test(value)) {
            setNama(value);
        }
    };

    const handlePekerjaanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
        setPekerjaan(value);
    };

    const handleAlamatChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
        setAlamat(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/tambah-mitra", {
                method: "POST",
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
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Terjadi kesalahan saat menambahkan mitra.",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Mitra berhasil ditambahkan.",
                }).then(() => {
                    router.push("/admin/daftar-mitra");
                });

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
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan pada server.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRedirectToUpload = () => {
        router.push("/admin/upload-mitra");
    };

    return (
        <div className="w-full text-black">
            <Breadcrumb items={breadcrumbItems} />

            <h1 className="text-2xl font-bold mt-4">Tambah Data Mitra Statistik</h1>

            <div className="mt-6 space-y-8">
                <section>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
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

                        <div>
                            <label htmlFor="jenis-petugas" className="block text-sm font-medium text-gray-700">
                                Jenis Petugas
                            </label>
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

            <hr className="my-8 border-gray-300" />

            <h1 className="text-xl font-bold mt-4">Upload Data Mitra</h1>
            <p className="text-sm text-gray-600">Fitur upload data mitra digunakan untuk menambahkan data mitra secara batch.</p>

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
