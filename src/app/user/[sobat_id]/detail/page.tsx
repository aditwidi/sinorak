"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Swal from "sweetalert2";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";


interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface MitraDetail {
    sobat_id: string;
    nik: string;
    nama: string;
    jenis_kelamin: "Laki-laki" | "Perempuan";
    pekerjaan: string;
    jenis_petugas: "Pendataan" | "Pemeriksaan" | "Pengolahan";
    alamat: string;
}

interface Kegiatan {
    kegiatan_id:number;
    nama_kegiatan: string;
    kode: string;
    penanggung_jawab: string;
    honor: number;
    bulan: number; // Add month field
    tahun: number; // Add year field
}

interface HonorMonthlySuccess {
    total_honor: number;
}

interface HonorMonthlyError {
    error: string;
}

type HonorMonthlyResponse = HonorMonthlySuccess | HonorMonthlyError;

export default function MitraDetailPage() {
    const { sobat_id } = useParams(); // Get dynamic route parameter
    const router = useRouter();

    // Ensure sobat_id is always a string
    const validSobatId = Array.isArray(sobat_id) ? sobat_id[0] : sobat_id;

    const [mitraDetail, setMitraDetail] = useState<MitraDetail | null>(null);
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(true); // Separate loading state
    const [loadingKegiatan, setLoadingKegiatan] = useState<boolean>(true); // Separate loading state
    const [loadingTotalHonor, setLoadingTotalHonor] = useState<boolean>(true); // Loading state for total honor
    const [loadingDates, setLoadingDates] = useState<boolean>(true); // Loading state for fetching available dates
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Initialize filters as empty strings to represent "all months" and "all years"
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [filterYear, setFilterYear] = useState<string>("");

    const [totalHonor, setTotalHonor] = useState<number | null>(null); // State for total honor
    const [currentPage, setCurrentPage] = useState<number>(1); // State for pagination
    const itemsPerPage = 10; // Define items per page
    const [availableMonths, setAvailableMonths] = useState<number[]>([]); // Available months
    const [availableYears, setAvailableYears] = useState<number[]>([]); // Available years

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik", href: "/user/daftar-mitra" },
        { label: "Detail Mitra" },
    ];

    // Export function to fetch CSV data from the API
    // Export function to fetch Excel data from the API
    const handleExport = async () => {
        if (!filterMonth || !filterYear) {
            // Show warning if filters are not selected
            Swal.fire({
                icon: "warning",
                title: "Pilih Filter",
                text: "Harap pilih bulan dan tahun sebelum melakukan ekspor data.",
                confirmButtonText: "OK",
            });
            return;
        }

        // Get the name of the Mitra for the file name
        const mitraName = mitraDetail?.nama || "Mitra"; // Default to "Mitra" if the name is unavailable

        // Format the month name
        const monthName = new Date(0, parseInt(filterMonth) - 1).toLocaleString("id-ID", { month: "long" });

        // Construct the file name dynamically
        const fileName = `${mitraName.replace(/\s+/g, "_")}_${monthName}_${filterYear}.xlsx`;

        try {
            const response = await fetch(
                `/api/export-mitra?sobat_id=${validSobatId}&month=${filterMonth}&year=${filterYear}`
            );
            if (!response.ok) {
                throw new Error("Failed to export data");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName; // Set the dynamic file name here
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting data:", error);
        }
    };


    // Fetch available months and years
    const fetchAvailableDates = useCallback(async () => {
        setLoadingDates(true);
        try {
            const response = await fetch("/api/mitra-dates");
            const data = await response.json();

            if (response.ok) {
                setAvailableMonths(data.months);
                setAvailableYears(data.years);

                // Set default filters to all months and all years
                if (data.months.length > 0 && filterMonth === "") {
                    setFilterMonth(""); // Represents all months
                }
                if (data.years.length > 0 && filterYear === "") {
                    setFilterYear(""); // Represents all years
                }
            } else {
                console.error("Failed to fetch available months and years:", data.error);
            }
        } catch (error) {
            console.error("Error fetching available months and years:", error);
        } finally {
            setLoadingDates(false);
        }
    }, [filterMonth, filterYear]);

    // Fetch mitra detail
    const fetchMitraDetail = useCallback(async () => {
        if (!validSobatId) return; // Return early if sobat_id is invalid

        setLoadingDetail(true);
        try {
            const response = await fetch(`/api/get-mitra?sobat_id=${validSobatId}`);
            const data = await response.json();

            if (response.ok) {
                setMitraDetail(data);
            } else {
                console.error("Failed to fetch mitra detail:", data.error);
            }
        } catch (error) {
            console.error("Error fetching mitra detail:", error);
        } finally {
            setLoadingDetail(false);
        }
    }, [validSobatId]);

    // Fetch kegiatan list
    const fetchKegiatanList = useCallback(async () => {
        if (!validSobatId) return; // Return early if sobat_id is invalid

        setLoadingKegiatan(true);
        try {
            const query = new URLSearchParams({
                sobat_id: validSobatId,
                searchTerm,
                filterMonth,
                filterYear,
                page: currentPage.toString(),
                pageSize: itemsPerPage.toString(),
            });

            const response = await fetch(`/api/get-kegiatan?${query.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setKegiatanList(data.kegiatanList);
            } else {
                console.error("Failed to fetch kegiatan list:", data.error);
            }
        } catch (error) {
            console.error("Error fetching kegiatan list:", error);
        } finally {
            setLoadingKegiatan(false);
        }
    }, [validSobatId, searchTerm, filterMonth, filterYear, currentPage]);

    // Fetch total honor for the selected month and year
    const fetchTotalHonor = useCallback(async () => {
        if (!validSobatId) return; // Ensure valid sobat_id is provided

        setLoadingTotalHonor(true);
        try {
            const response = await fetch(
                `/api/get-total-honor?sobat_id=${validSobatId}&month=${filterMonth}&year=${filterYear}`
            );
            const data: HonorMonthlyResponse = await response.json();

            if (response.ok && "total_honor" in data) {
                setTotalHonor(data.total_honor);
            } else if ("error" in data) {
                console.error("Failed to fetch total honor:", data.error);
            }
        } catch (error) {
            console.error("Error fetching total honor:", error);
        } finally {
            setLoadingTotalHonor(false);
        }
    }, [validSobatId, filterMonth, filterYear]);

    useEffect(() => {
        if (validSobatId) {
            fetchMitraDetail();
            fetchKegiatanList();
            fetchAvailableDates(); // Fetch available dates when component mounts
        }
    }, [fetchMitraDetail, fetchKegiatanList, fetchAvailableDates, validSobatId]); // Include the functions and sobat_id in the dependency array

    useEffect(() => {
        fetchTotalHonor();
    }, [fetchTotalHonor, validSobatId, filterMonth, filterYear]); // Fetch total honor whenever relevant values change

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        // Only navigate to next page if there's more data to show
        if (currentPage * itemsPerPage < kegiatanList.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="w-full text-black px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />

            <h1 className="text-2xl font-bold mt-4 mb-2">Detail Mitra Statistik</h1>

            {/* Export Button */}
            <button
                onClick={handleExport}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Export Data
            </button>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column - Mitra Details */}
                <div>
                    {loadingDetail ? (
                        <Skeleton height={400} />
                    ) : (
                        mitraDetail && (
                            <div className="p-4 border border-gray-300 rounded-md shadow-md">
                                <h2 className="text-lg font-semibold mb-4">Informasi Mitra</h2>
                                <p className="text-sm sm:text-base">
                                    <strong>Sobat ID:</strong> {mitraDetail.sobat_id}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>NIK:</strong> {mitraDetail.nik}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>Nama:</strong> {mitraDetail.nama}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>Jenis Kelamin:</strong> {mitraDetail.jenis_kelamin}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>Pekerjaan:</strong> {mitraDetail.pekerjaan}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>Jenis Petugas:</strong> {mitraDetail.jenis_petugas}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>Alamat:</strong> {mitraDetail.alamat}
                                </p>
                            </div>
                        )
                    )}
                </div>

                {/* Right Column - Kegiatan List */}
                <div>
                    <div className="flex flex-col sm:flex-row mb-4 gap-2 sm:gap-0">
                        {/* Search Bar */}
                        <input
                            type="text"
                            placeholder="Cari Nama Kegiatan"
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Filter Month */}
                        <select
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none text-sm"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            <option value="">Semua Bulan</option>
                            {availableMonths.map((month) => (
                                <option key={month} value={month.toString()}>
                                    {new Date(0, month - 1).toLocaleString("id-ID", {
                                        month: "long",
                                    })}
                                </option>
                            ))}
                        </select>
                        {/* Filter Year */}
                        <select
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none text-sm"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                        >
                            <option value="">Semua Tahun</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year.toString()}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loadingKegiatan ? (
                        <Skeleton height={200} />
                    ) : (
                        <div className="relative shadow-md sm:rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-2 py-2">
                                                Nama Kegiatan
                                            </th>
                                            <th scope="col" className="px-2 py-2">
                                                Kode Kegiatan
                                            </th>
                                            <th scope="col" className="px-2 py-2">
                                                Penanggung Jawab
                                            </th>
                                            <th scope="col" className="px-2 py-2">
                                                Honor
                                            </th>
                                            <th scope="col" className="px-2 py-2">
                                                Bulan
                                            </th>
                                            <th scope="col" className="px-2 py-2">
                                                Tahun
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kegiatanList.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4">
                                                    Tidak ada kegiatan yang ditemukan
                                                </td>
                                            </tr>
                                        ) : (
                                            kegiatanList.map((kegiatan, index) => (
                                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-2 py-4 font-medium text-gray-900">
                                                        {/* Wrap nama_kegiatan in a Link */}
                                                        <Link
                                                            href={`/user/kegiatan/${kegiatan.kegiatan_id}/detail-kegiatan`}
                                                            className="text-black hover:text-blue-700"
                                                        >
                                                            {kegiatan.nama_kegiatan}
                                                        </Link>
                                                    </td>
                                                    <td className="px-2 py-4">{kegiatan.kode}</td>
                                                    <td className="px-2 py-4">{kegiatan.penanggung_jawab}</td>
                                                    <td className="px-2 py-4">Rp {kegiatan.honor.toLocaleString()}</td>
                                                    <td className="px-2 py-4">
                                                        {new Date(0, kegiatan.bulan - 1).toLocaleString("id-ID", { month: "long" })}
                                                    </td>
                                                    <td className="px-2 py-4">{kegiatan.tahun}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Honor Section After Table */}
                            <nav className="flex flex-row items-center justify-between p-4 bg-white dark:bg-gray-800">
                                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    Total Honor:
                                </p>
                                <p className="text-sm font-semibold text-right text-gray-900 dark:text-white">
                                    Rp {totalHonor ? totalHonor.toLocaleString() : 0}
                                </p>
                            </nav>

                            {/* Pagination Footer */}
                            <nav
                                className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 bg-white rounded-b-lg"
                                aria-label="Table navigation"
                            >
                                <span className="text-sm font-normal text-gray-500">
                                    Menampilkan{" "}
                                    <span className="font-semibold">
                                        {(currentPage - 1) * itemsPerPage + 1} -{" "}
                                        {Math.min(currentPage * itemsPerPage, kegiatanList.length)}
                                    </span>{" "}
                                    dari <span className="font-semibold">{kegiatanList.length}</span>
                                </span>
                                <ul className="inline-flex items-center -space-x-px ml-auto">
                                    <li>
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className={`flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 ${currentPage === 1
                                                ? "cursor-not-allowed opacity-50"
                                                : "hover:bg-gray-100 hover:text-gray-700"
                                                } rounded-l-md`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            &lt;
                                        </button>
                                    </li>
                                    <li className="hidden sm:flex">
                                        <button
                                            key={currentPage}
                                            onClick={() => setCurrentPage(currentPage)}
                                            className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 ${currentPage
                                                ? "z-10 text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700"
                                                : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                                                }`}
                                        >
                                            {currentPage}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage * itemsPerPage >= kegiatanList.length}
                                            className={`flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 ${currentPage * itemsPerPage >= kegiatanList.length
                                                ? "cursor-not-allowed opacity-50"
                                                : "hover:bg-gray-100 hover:text-gray-700"
                                                } rounded-r-md`}
                                        >
                                            <span className="sr-only">Next</span>
                                            &gt;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
