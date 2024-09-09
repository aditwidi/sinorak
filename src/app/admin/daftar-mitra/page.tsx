"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import Swal from "sweetalert2";
import {
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Define interfaces for data
interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface MitraData {
    sobat_id: string;
    nama: string;
    jenis_petugas: "Pendataan" | "Pemeriksaan" | "Pengolahan";
    honor_bulanan: number | null; // honor_bulanan can be null
    month: number | null; // Include month to allow filtering
    year: number | null; // Include year to allow filtering
}

export default function DaftarMitraPage() {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    const currentYear = currentDate.getFullYear().toString();

    // State management
    const [mitraData, setMitraData] = useState<MitraData[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false); // State for delete loading
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
    const [filterYear, setFilterYear] = useState<string>(currentYear);
    const [filterJenisPetugas, setFilterJenisPetugas] = useState<string>("");
    const [availableMonths, setAvailableMonths] = useState<number[]>([
        parseInt(currentMonth),
    ]);
    const [availableYears, setAvailableYears] = useState<number[]>([
        parseInt(currentYear),
    ]);
    const [sortColumn, setSortColumn] = useState<string>("nama"); // Default sort column
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Default sort direction
    const itemsPerPage = 10;

    const router = useRouter();

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik" },
        { label: "Daftar Mitra" },
    ];

    useEffect(() => {
        const fetchAvailableDates = async () => {
            try {
                const response = await fetch("/api/mitra-dates");
                const data = await response.json();

                if (response.ok) {
                    const months =
                        data.months.length > 0 ? data.months : [parseInt(currentMonth)];
                    const years =
                        data.years.length > 0 ? data.years : [parseInt(currentYear)];

                    setAvailableMonths(months);
                    setAvailableYears(years);

                    // Set the smallest month and year as the default filter
                    setFilterMonth(Math.min(...months).toString());
                    setFilterYear(Math.min(...years).toString());
                } else {
                    console.error(
                        "Failed to fetch available months and years:",
                        data.error
                    );
                }
            } catch (error) {
                console.error("Error fetching available months and years:", error);
            }
        };

        fetchAvailableDates();
    }, [currentMonth, currentYear]);

    useEffect(() => {
        const fetchMitraData = async () => {
            setLoading(true);

            try {
                const query = new URLSearchParams({
                    searchTerm,
                    filterMonth,
                    filterYear,
                    filterJenisPetugas,
                    page: currentPage.toString(),
                    pageSize: itemsPerPage.toString(),
                    sortColumn,
                    sortDirection,
                });

                const response = await fetch(`/api/mitra-data?${query.toString()}`);
                const data = await response.json();

                if (response.ok) {
                    setMitraData(data.mitraData);
                    setTotalCount(data.totalCount);
                } else {
                    console.error("Failed to fetch mitra data:", data.error);
                }
            } catch (error) {
                console.error("Error fetching mitra data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMitraData();
    }, [
        searchTerm,
        filterMonth,
        filterYear,
        filterJenisPetugas,
        currentPage,
        itemsPerPage,
        sortColumn,
        sortDirection,
    ]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            // If already sorting by this column, toggle the direction
            setSortDirection((prevDirection) =>
                prevDirection === "asc" ? "desc" : "asc"
            );
        } else {
            // Otherwise, set to this column and default to ascending
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handleEdit = (sobat_id: string) => {
        router.push(`/admin/${sobat_id}/edit`);
    };

    const handleView = (sobat_id: string) => {
        router.push(`/admin/${sobat_id}/detail`);
    };

    const handleDelete = async (sobat_id: string) => {
        const confirmed = await Swal.fire({
            title: "Konfirmasi",
            text: "Apakah Anda yakin ingin menghapus data mitra ini?",
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            cancelButtonText: "Batal",
            confirmButtonText: "Ya, Saya Yakin!",
            confirmButtonColor: "#3F83F8",
        });

        if (!confirmed.isConfirmed) return;

        setDeleteLoading(true); // Set delete loading to true

        try {
            // Step 1: Delete from kegiatan_mitra
            let response = await fetch(
                `/api/delete-kegiatan-mitra?sobat_id=${sobat_id}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok) throw new Error("Failed to delete kegiatan_mitra.");

            // Step 2: Delete from mitra_honor_monthly
            response = await fetch(
                `/api/delete-honor-mitra-monthly?sobat_id=${sobat_id}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok) throw new Error("Failed to delete mitra_honor_monthly.");

            // Step 3: Delete from mitra
            response = await fetch(`/api/delete-mitra?sobat_id=${sobat_id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete mitra.");

            Swal.fire("Berhasil!", "Data mitra berhasil dihapus.", "success");

            // Remove the deleted mitra from the UI
            setMitraData((prevData) =>
                prevData.filter((mitra) => mitra.sobat_id !== sobat_id)
            );
            setTotalCount((prevCount) => prevCount - 1);
        } catch (error) {
            console.error("Error deleting mitra:", error);
            Swal.fire("Error!", "Gagal menghapus data mitra.", "error");
        } finally {
            setDeleteLoading(false); // Set delete loading to false
        }
    };

    // Helper function to generate the pagination buttons
    const getPaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5;

        // Show the first page and dots if current page is greater than maxPagesToShow
        if (currentPage > maxPagesToShow) {
            items.push(
                <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${currentPage === 1
                            ? "text-primary-600 bg-primary-50 border-primary-300"
                            : ""
                        }`}
                >
                    1
                </button>
            );
            items.push(<span key="start-dots" className="px-2">...</span>);
        }

        // Calculate the start and end page numbers
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 ${currentPage === i
                            ? "z-10 text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700"
                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Show the last page and dots if current page is less than total pages minus maxPagesToShow
        if (currentPage < totalPages - maxPagesToShow + 1) {
            items.push(<span key="end-dots" className="px-2">...</span>);
            items.push(
                <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${currentPage === totalPages
                            ? "text-primary-600 bg-primary-50 border-primary-300"
                            : ""
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
            <h1 className="text-2xl font-bold mt-4 text-black">
                Data Mitra Statistik BPS Kota Bekasi
            </h1>

            {/* Filters and Search */}
            <div className="mt-4 mb-2">
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Cari Nama Mitra"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters for month, year, and jenis petugas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <select
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    >
                        {availableMonths.map((month) => (
                            <option key={month} value={month.toString()}>
                                {new Date(0, month - 1).toLocaleString("id-ID", {
                                    month: "long",
                                })}
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

                {/* Filter by jenis petugas */}
                <div className="mb-2">
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        value={filterJenisPetugas}
                        onChange={(e) => setFilterJenisPetugas(e.target.value)}
                    >
                        <option value="">Jenis Petugas</option>
                        <option value="Pendataan">Pendataan</option>
                        <option value="Pemeriksaan">Pemeriksaan</option>
                        <option value="Pengolahan">Pengolahan</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="pb-0">
                <div className="relative shadow-md sm:rounded-lg mt-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <Skeleton height={200} width="100%" />
                        ) : (
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 cursor-pointer"
                                            onClick={() => handleSort("sobat_id")}
                                        >
                                            SOBAT ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 cursor-pointer"
                                            onClick={() => handleSort("nama")}
                                        >
                                            Nama
                                            {sortColumn === "nama" && (
                                                <span>
                                                    {sortDirection === "asc" ? " ▲" : " ▼"}
                                                </span>
                                            )}
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Jenis Petugas
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 cursor-pointer"
                                            onClick={() => handleSort("honor_bulanan")}
                                        >
                                            Honor Bulanan
                                            {sortColumn === "honor_bulanan" && (
                                                <span>
                                                    {sortDirection === "asc" ? " ▲" : " ▼"}
                                                </span>
                                            )}
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mitraData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">
                                                Belum ada data mitra
                                            </td>
                                        </tr>
                                    ) : (
                                        mitraData.map((mitra, index) => (
                                            <tr
                                                key={index}
                                                className="bg-white border-b hover:bg-gray-50"
                                            >
                                                <th
                                                    scope="row"
                                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                >
                                                    {mitra.sobat_id}
                                                </th>
                                                <td className="px-6 py-4">{mitra.nama}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded-full ${mitra.jenis_petugas === "Pendataan"
                                                                ? "text-blue-800 bg-blue-100"
                                                                : mitra.jenis_petugas === "Pemeriksaan"
                                                                    ? "text-green-800 bg-green-100"
                                                                    : "text-yellow-800 bg-yellow-100"
                                                            }`}
                                                    >
                                                        {mitra.jenis_petugas}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {mitra.honor_bulanan !== null
                                                        ? `Rp ${mitra.honor_bulanan.toLocaleString()}`
                                                        : "Rp 0"}
                                                </td>
                                                <td className="px-6 py-4 space-x-2 flex">
                                                    <button
                                                        type="button"
                                                        className="text-green-500 hover:text-green-700"
                                                        onClick={() => handleEdit(mitra.sobat_id)}
                                                    >
                                                        <PencilSquareIcon
                                                            className="w-5 h-5"
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={() => handleView(mitra.sobat_id)}
                                                    >
                                                        <EyeIcon className="w-5 h-5" aria-hidden="true" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`text-red-500 hover:text-red-700 ${deleteLoading
                                                                ? "cursor-not-allowed opacity-50"
                                                                : ""
                                                            }`}
                                                        onClick={() => handleDelete(mitra.sobat_id)}
                                                        disabled={deleteLoading}
                                                    >
                                                        {deleteLoading ? (
                                                            <svg
                                                                className="animate-spin h-5 w-5 text-red-500"
                                                                viewBox="0 0 24 24"
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
                                                                    d="M4 12a8 8 0 018-8v8h8"
                                                                ></path>
                                                            </svg>
                                                        ) : (
                                                            <TrashIcon
                                                                className="w-5 h-5"
                                                                aria-hidden="true"
                                                            />
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

                {/* Pagination */}
                <div className="relative bg-white rounded-b-lg shadow-md mt-0">
                    <nav
                        className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200"
                        aria-label="Table navigation"
                    >
                        <span className="text-sm font-normal text-gray-500">
                            Menampilkan{" "}
                            <span className="font-semibold">
                                {(currentPage - 1) * itemsPerPage + 1}-
                                {Math.min(currentPage * itemsPerPage, totalCount)}
                            </span>{" "}
                            dari <span className="font-semibold">{totalCount}</span>
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
                                    <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                                </button>
                            </li>
                            <li className="hidden sm:flex">{getPaginationItems()}</li>
                            <li>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 ${currentPage === totalPages
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:bg-gray-100 hover:text-gray-700"
                                        } rounded-r-md`}
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
