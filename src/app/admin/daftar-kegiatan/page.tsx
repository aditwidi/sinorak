"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { PencilSquareIcon, EyeIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ClipLoader } from "react-spinners"; // Import a spinner component

// Initialize SweetAlert2
const MySwal = withReactContent(Swal);

// Define interfaces for data
interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface KegiatanData {
    kegiatan_id: number;
    nama_kegiatan: string;
    kode: string;
    penanggung_jawab: string;
    jenis_kegiatan: "Lapangan" | "Pengolahan"; // Updated ENUM
}

export default function DaftarKegiatanPage() {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    const currentYear = currentDate.getFullYear().toString();

    const [kegiatanData, setKegiatanData] = useState<KegiatanData[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false); // State for delete loading indicator
    const [deletingId, setDeletingId] = useState<number | null>(null); // Track which item is being deleted
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
    const [filterYear, setFilterYear] = useState<string>(currentYear);
    const [filterJenisKegiatan, setFilterJenisKegiatan] = useState<string>("");
    const [availableMonths, setAvailableMonths] = useState<number[]>([parseInt(currentMonth)]);
    const [availableYears, setAvailableYears] = useState<number[]>([parseInt(currentYear)]);
    const itemsPerPage = 10;

    const router = useRouter();

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Kegiatan Statistik" },
        { label: "Daftar Semua Kegiatan" },
    ];

    useEffect(() => {
        const fetchAvailableDates = async () => {
            try {
                const response = await fetch("/api/kegiatan-dates");
                const data = await response.json();

                if (response.ok) {
                    const months = data.months.length > 0 ? data.months : [parseInt(currentMonth)];
                    const years = data.years.length > 0 ? data.years : [parseInt(currentYear)];

                    setAvailableMonths(months);
                    setAvailableYears(years);

                    // Set the smallest month and year as the default filter
                    setFilterMonth(Math.min(...months).toString());
                    setFilterYear(Math.min(...years).toString());
                } else {
                    console.error("Failed to fetch available months and years:", data.error);
                }
            } catch (error) {
                console.error("Error fetching available months and years:", error);
            }
        };

        fetchAvailableDates();
    }, [currentMonth, currentYear]);

    useEffect(() => {
        const fetchKegiatanData = async () => {
            setLoading(true);

            try {
                const query = new URLSearchParams({
                    searchTerm,
                    filterMonth,
                    filterYear,
                    filterJenisKegiatan,
                    page: currentPage.toString(),
                    pageSize: itemsPerPage.toString(),
                });

                const response = await fetch(`/api/kegiatan-data?${query.toString()}`);
                const data = await response.json();

                if (response.ok) {
                    setKegiatanData(data.kegiatanData);
                    setTotalCount(data.totalCount);
                } else {
                    console.error("Failed to fetch kegiatan data:", data.error);
                }
            } catch (error) {
                console.error("Error fetching kegiatan data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchKegiatanData();
    }, [searchTerm, filterMonth, filterYear, filterJenisKegiatan, currentPage, itemsPerPage]);

    const handleDeleteKegiatan = async (kegiatan_id: number) => {
        // Show confirmation dialog
        const result = await MySwal.fire({
            title: 'Konfirmasi',
            text: 'Apakah Anda yakin ingin menghapus data kegiatan ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            confirmButtonColor:"#3f83f8",
            cancelButtonText: 'Batal',
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return; // If the user cancels, do nothing

        setDeleting(true); // Set deleting state to true
        setDeletingId(kegiatan_id); // Track the ID being deleted
        try {
            // First, update honor in mitra_honor_monthly
            const updateHonorResponse = await fetch('/api/update-honor-mitra-monthly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kegiatan_id }),
            });

            if (!updateHonorResponse.ok) {
                throw new Error('Failed to update honor_mitra_monthly');
            }

            // Second, delete entries in kegiatan_mitra
            const deleteKegiatanMitraResponse = await fetch('/api/delete-mitra-kegiatan', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kegiatan_id }),
            });

            if (!deleteKegiatanMitraResponse.ok) {
                throw new Error('Failed to delete kegiatan_mitra entries');
            }

            // Third, delete the kegiatan
            const deleteKegiatanResponse = await fetch('/api/delete-kegiatan', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kegiatan_id }),
            });

            if (!deleteKegiatanResponse.ok) {
                throw new Error('Failed to delete kegiatan');
            }

            // Show success message
            MySwal.fire({
                title: 'Berhasil',
                text: 'Kegiatan berhasil dihapus.',
                icon: 'success',
                confirmButtonText: 'OK',
            }).then(() => {
                router.push("/admin/daftar-kegiatan"); // Redirect back to the main page after success
            });

        } catch (error) {
            console.error('Error deleting kegiatan:', error);
            // Show error message
            MySwal.fire({
                title: 'Gagal',
                text: 'Gagal menghapus kegiatan.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setDeleting(false); // Reset deleting state
            setDeletingId(null); // Clear the deleting ID state
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Helper function to generate pagination items
    const getPaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5;

        // Show the first page and ellipses if necessary
        if (currentPage > maxPagesToShow) {
            items.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                        currentPage === 1 ? "text-primary-600 bg-primary-50 border-primary-300" : ""
                    }`}
                >
                    1
                </button>
            );
            items.push(<span key="start-dots" className="px-2">...</span>);
        }

        // Calculate start and end page numbers
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 ${
                        currentPage === i
                            ? "z-10 text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700"
                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Show the last page and ellipses if necessary
        if (currentPage < totalPages - maxPagesToShow + 1) {
            items.push(<span key="end-dots" className="px-2">...</span>);
            items.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                        currentPage === totalPages ? "text-primary-600 bg-primary-50 border-primary-300" : ""
                    }`}
                >
                    {totalPages}
                </button>
            );
        }

        return items;
    };

    return (
        <div className="w-full text-black">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-2xl font-bold mt-4 text-black">Daftar Semua Kegiatan Statistik BPS Kota Bekasi</h1>

            <div className="mt-4 mb-2">
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Cari Nama Kegiatan, Kode, atau Penanggung Jawab"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <select
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    >
                        {availableMonths.map((month) => (
                            <option key={month} value={month.toString()}>
                                {new Date(0, month - 1).toLocaleString("id-ID", { month: "long" })}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    >
                        {availableYears.map((year) => (
                            <option key={year} value={year.toString()}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        value={filterJenisKegiatan}
                        onChange={(e) => setFilterJenisKegiatan(e.target.value)}
                    >
                        <option value="">Jenis Kegiatan</option>
                        <option value="Lapangan">Lapangan</option>
                        <option value="Pengolahan">Pengolahan</option>
                    </select>
                </div>
            </div>

            <div className="pb-0">
                <div className="relative shadow-md sm:rounded-lg mt-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <Skeleton height={200} width="100%" />
                        ) : (
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nama Kegiatan</th>
                                        <th scope="col" className="px-6 py-3">Kode Kegiatan</th>
                                        <th scope="col" className="px-6 py-3">Penanggung Jawab</th>
                                        <th scope="col" className="px-6 py-3">Jenis Kegiatan</th>
                                        <th scope="col" className="px-6 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kegiatanData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">Belum ada data kegiatan</td>
                                        </tr>
                                    ) : (
                                        kegiatanData.map((kegiatan) => (
                                            <tr key={kegiatan.kegiatan_id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4">{kegiatan.nama_kegiatan}</td>
                                                <td className="px-6 py-4">{kegiatan.kode}</td>
                                                <td className="px-6 py-4">{kegiatan.penanggung_jawab}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${kegiatan.jenis_kegiatan === "Lapangan"
                                                            ? "text-blue-800 bg-blue-100"
                                                            : "text-yellow-800 bg-yellow-100"
                                                        }`}
                                                    >
                                                        {kegiatan.jenis_kegiatan}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 flex items-center justify-center space-x-2">
                                                    <button
                                                        type="button"
                                                        className="text-green-500 hover:text-green-700"
                                                        onClick={() => router.push(`/admin/kegiatan/${kegiatan.kegiatan_id}/edit-kegiatan`)}
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={() => router.push(`/admin/kegiatan/${kegiatan.kegiatan_id}/detail-kegiatan`)}
                                                    >
                                                        <EyeIcon className="w-5 h-5" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`text-red-500 hover:text-red-700 ${deleting && deletingId === kegiatan.kegiatan_id ? "cursor-not-allowed opacity-50" : ""}`}
                                                        onClick={() => handleDeleteKegiatan(kegiatan.kegiatan_id)}
                                                        disabled={deleting && deletingId === kegiatan.kegiatan_id}
                                                    >
                                                        {deleting && deletingId === kegiatan.kegiatan_id ? (
                                                            <ClipLoader size={16} color="#f87171" /> // Use a spinner while deleting
                                                        ) : (
                                                            <TrashIcon className="w-5 h-5" aria-hidden="true" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="relative bg-white rounded-b-lg shadow-md mt-0">
                    <nav
                        className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200"
                        aria-label="Table navigation"
                    >
                        <span className="text-sm font-normal text-gray-500">
                            Menampilkan <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> dari{" "}
                            <span className="font-semibold">{totalCount}</span>
                        </span>
                        <ul className="inline-flex items-center -space-x-px ml-auto">
                            <li>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 ${currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100 hover:text-gray-700"} rounded-l-md`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </li>
                            <li className="hidden sm:flex">
                                {getPaginationItems()}
                            </li>
                            <li>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100 hover:text-gray-700"} rounded-r-md`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}
