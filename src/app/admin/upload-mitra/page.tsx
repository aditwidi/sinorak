"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // Import SweetAlert2
import Breadcrumb from "@/components/Breadcrumb"; // Import Breadcrumb component
import { LoadingIndicator } from "@/components/LoadingIndicator"; // Import LoadingIndicator component
import * as XLSX from "sheetjs-style"; // Import XLSX from sheetjs-style
import "react-loading-skeleton/dist/skeleton.css"; // Import the Skeleton CSS
import "sweetalert2/dist/sweetalert2.min.css"; // Import SweetAlert2 CSS

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function UploadMitra() {
    const { data: session, status } = useSession(); // Get session data
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false); // Loading state for form submission
    const [processing, setProcessing] = useState(false); // Processing state for file upload

    // Define expected headers
    const expectedHeaders = [
        "sobat_id",
        "nik",
        "nama",
        "jenis_petugas",
        "pekerjaan",
        "jenis_kelamin",
        "alamat"
    ];

    // Define breadcrumb items
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik", href: "/admin/daftar-mitra" },
        { label: "Upload Data Mitra" }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Check file extension
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (fileExtension !== "xlsx") {
                Swal.fire({
                    icon: "warning",
                    title: "File Tidak Didukung",
                    text: "Hanya file dengan ekstensi .xlsx yang diperbolehkan."
                });
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
        }
    };

    const validateHeaders = (headers: string[]): boolean => {
        // Check if all expected headers are present in the file
        return expectedHeaders.every(header => headers.includes(header));
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Swal.fire({
                icon: "warning",
                title: "File Tidak Ditemukan",
                text: "Silakan pilih file Excel untuk diupload."
            });
            return;
        }

        Swal.fire({
            title: "Mengupload...",
            text: "Mohon tunggu, file sedang diupload.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        setLoading(true);
        setProcessing(true);

        try {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const binaryStr = e.target?.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const headers = jsonData[0] as string[];
                if (!validateHeaders(headers)) {
                    Swal.fire({
                        icon: "error",
                        title: "Header Tidak Valid",
                        text: "File Excel harus memiliki header kolom yang sesuai: " + expectedHeaders.join(", ")
                    });
                    setLoading(false);
                    setProcessing(false);
                    return;
                }

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i] as string[];
                    const rowData = headers.reduce((acc, key, index) => {
                        acc[key] = row[index];
                        return acc;
                    }, {} as Record<string, any>);

                    // Check for required fields before uploading
                    if (!rowData["jenis_petugas"]) {
                        console.warn("Skipping row due to missing 'jenis_petugas'");
                        continue;
                    }

                    try {
                        await uploadRow(rowData);
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui";

                        Swal.fire({
                            icon: "error",
                            title: "Upload Gagal",
                            text: "Kesalahan saat mengupload baris: " + errorMessage
                        });
                        setLoading(false);
                        setProcessing(false);
                        return;
                    }
                }

                Swal.fire({
                    icon: "success",
                    title: "Upload Berhasil",
                    text: "Semua baris telah berhasil diupload."
                });
            };

            fileReader.readAsBinaryString(selectedFile);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Gagal membaca file.";

            console.error("Kesalahan saat membaca file:", errorMessage);
            Swal.fire({
                icon: "error",
                title: "Kesalahan",
                text: errorMessage
            });
        } finally {
            setLoading(false);
            setProcessing(false);
        }
    };

    const uploadRow = async (rowData: any) => {
        try {
            const response = await fetch("/api/upload-mitra", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(rowData)
            });

            if (!response.ok) {
                const data = await response.json();
                console.error("Gagal mengupload baris:", data.error || response.statusText);
                throw new Error(data.error || "Gagal mengupload baris");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Kesalahan saat mengupload baris:", error.message);
                throw error;
            } else {
                console.error("Kesalahan tidak diketahui saat mengupload baris:", error);
                throw new Error("Terjadi kesalahan tidak diketahui selama upload");
            }
        }
    };

    return (
        <div className="w-full text-black">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Page Title */}
            <h1 className="text-2xl font-bold mt-4">Upload Data Mitra</h1>

            {/* Information List */}
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Informasi Penting!</h2>
                <p>File Excel harus memiliki nama kolom berikut:</p>
                <ul className="list-disc list-inside mt-2">
                    <li><strong>sobat_id</strong></li>
                    <li><strong>nik</strong></li>
                    <li><strong>nama</strong></li>
                    <li><strong>jenis_petugas</strong></li>
                    <li><strong>pekerjaan</strong></li>
                    <li><strong>jenis_kelamin</strong></li>
                    <li><strong>alamat</strong></li>
                </ul>
            </div>

            {/* File Upload Section */}
            <div className="mt-6 flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="block w-full sm:w-auto"
                />

                {/* Button with Loading Indicator beside the file input */}
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`bg-blue-600 text-white py-2 px-4 rounded-md shadow-md flex items-center justify-center transition-opacity duration-300 w-full sm:w-auto ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? (
                        <>
                            <LoadingIndicator />
                            <span className="ml-2">Mengupload...</span>
                        </>
                    ) : (
                        "Upload"
                    )}
                </button>
            </div>
        </div>
    );
}
