"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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
}

export default function DaftarMitraPage() {
    // Get the current date, month, and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth().toString(); // Month is zero-based in JavaScript (0 = January)
    const currentYear = currentDate.getFullYear().toString();

    // State management for mitra data and unique months/years
    const [mitraData, setMitraData] = useState<MitraData[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0); // Define state for total count
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterMonth, setFilterMonth] = useState<string>(currentMonth); // Set default to current month
    const [filterYear, setFilterYear] = useState<string>(currentYear); // Set default to current year
    const [filterJenisPetugas, setFilterJenisPetugas] = useState<string>("");
    const [availableMonths, setAvailableMonths] = useState<number[]>([parseInt(currentMonth)]); // Default to current month
    const [availableYears, setAvailableYears] = useState<number[]>([parseInt(currentYear)]); // Default to current year
    const itemsPerPage = 10;

    // Define breadcrumb items
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Mitra Statistik" },
        { label: "Daftar Mitra" },
    ];

    // Fetch available months and years
    useEffect(() => {
        const fetchAvailableDates = async () => {
            try {
                const response = await fetch("/api/mitra-dates");
                const data = await response.json();

                if (response.ok) {
                    setAvailableMonths(data.months.length > 0 ? data.months : [parseInt(currentMonth)]);
                    setAvailableYears(data.years.length > 0 ? data.years : [parseInt(currentYear)]);
                } else {
                    console.error("Failed to fetch available months and years:", data.error);
                }
            } catch (error) {
                console.error("Error fetching available months and years:", error);
            }
        };

        fetchAvailableDates();
    }, [currentMonth, currentYear]); // Include currentMonth and currentYear in dependencies

    // Fetch mitra data on component mount
    useEffect(() => {
        const fetchMitraData = async () => {
            setLoading(true); // Set loading to true before fetching data

            try {
                const query = new URLSearchParams({
                    searchTerm,
                    filterMonth,
                    filterYear,
                    filterJenisPetugas,
                    page: currentPage.toString(),
                    pageSize: itemsPerPage.toString(),
                });

                const response = await fetch(`/api/mitra-data?${query.toString()}`);
                const data = await response.json();

                if (response.ok) {
                    setMitraData(data.mitraData);
                    setTotalCount(data.totalCount); // Ensure totalCount is updated
                } else {
                    console.error("Failed to fetch mitra data:", data.error);
                }
            } catch (error) {
                console.error("Error fetching mitra data:", error);
            } finally {
                setLoading(false); // Set loading to false after data is fetched
            }
        };

        fetchMitraData();
    }, [searchTerm, filterMonth, filterYear, filterJenisPetugas, currentPage, itemsPerPage]);

    // Functions to handle pagination
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Calculate filtered data
    const filteredData = mitraData.filter((mitra) => {
        const matchesSearch = searchTerm ? mitra.nama.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const matchesMonth = filterMonth ? (new Date().getMonth().toString() === filterMonth) : true;
        const matchesYear = filterYear ? (new Date().getFullYear().toString() === filterYear) : true;
        const matchesJenisPetugas = filterJenisPetugas ? mitra.jenis_petugas === filterJenisPetugas : true;

        return matchesSearch && matchesMonth && matchesYear && matchesJenisPetugas;
    });

    // Calculate paginated data
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

    return (
        <div className="w-full text-black">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Title */}
            <h1 className="text-2xl font-bold mt-4 text-black">Data Mitra Statistik BPS Kota Bekasi</h1>

            {/* Responsive Table Header with Search and Filters */}
            <div className="mt-4 mb-2">
                {/* Search Bar */}
                <div className="mb-2">
                    <input
                        type="text"
                        placeholder="Cari Nama Mitra..."
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {/* Month Filter */}
                    <select
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    >
                        {availableMonths.map((month) => (
                            <option key={month} value={month.toString()}>
                                {new Date(0, month).toLocaleString("id-ID", { month: "long" })} {/* Using the correct month format */}
                            </option>
                        ))}
                    </select>

                    {/* Year Filter */}
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

                {/* Jenis Petugas Filter */}
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

            {/* Table */}
            <div className="pb-0">
                <div className="relative shadow-md sm:rounded-lg mt-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            // Loading Skeleton
                            <Skeleton height={200} width="100%" />
                        ) : (
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">SOBAT ID</th>
                                        <th scope="col" className="px-6 py-3">Nama</th>
                                        <th scope="col" className="px-6 py-3">Jenis Petugas</th>
                                        <th scope="col" className="px-6 py-3">Honor Bulanan</th>
                                        <th scope="col" className="px-6 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">Belum ada data mitra</td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((mitra, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {mitra.sobat_id}
                                                </th>
                                                <td className="px-6 py-4">{mitra.nama}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${mitra.jenis_petugas === "Pendataan" ? "text-blue-800 bg-blue-100" :
                                                        mitra.jenis_petugas === "Pemeriksaan" ? "text-green-800 bg-green-100" :
                                                            "text-yellow-800 bg-yellow-100"
                                                        }`}>
                                                        {mitra.jenis_petugas}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {mitra.honor_bulanan !== null ? `Rp ${mitra.honor_bulanan.toLocaleString()}` : "Rp 0"}
                                                </td>
                                                <td className="px-6 py-4 space-x-2 flex">
                                                    {/* Action Icons */}
                                                    <button
                                                        type="button"
                                                        className="text-green-500 hover:text-green-700"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <EyeIcon className="w-5 h-5" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <TrashIcon className="w-5 h-5" aria-hidden="true" />
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

                {/* Pagination Controls */}
                <div className="relative bg-white rounded-b-lg shadow-md mt-0">
                    <nav
                        className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200"
                        aria-label="Table navigation"
                    >
                        <span className="text-sm font-normal text-gray-500">
                            Menampilkan <span className="font-semibold">{startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredData.length)}</span> dari{" "}
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
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 ${currentPage === i + 1
                                            ? "z-10 text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700"
                                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
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
