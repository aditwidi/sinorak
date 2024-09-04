"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Breadcrumb from "@/components/Breadcrumb"; // Adjust the import path to your Breadcrumb component

interface KegiatanDetail {
    kegiatan_id: number;
    nama_kegiatan: string;
    kode: string;
    penanggung_jawab: string;
    jenis_kegiatan: "Pendataan" | "Pemeriksaan" | "Pengolahan";
    tanggal_mulai: string;
    tanggal_berakhir: string;
    honor_satuan: number;
    satuan_honor: "Dokumen" | "OB" | "BS" | "Rumah Tangga" | "Pasar" | "Keluarga" | "SLS" | "Desa" | "Responden";
}

interface Peserta {
    sobat_id: string;
    nama: string;
    target: number;
    honor: number;
}

interface KegiatanDetailResponse {
    kegiatanDetail: KegiatanDetail | null;
    pesertaList: Peserta[];
    totalHonor: number;
    message?: string; // Optional for error messages
}

export default function DetailKegiatanPage() {
    const { kegiatan_id } = useParams(); // Get dynamic route parameter
    const router = useRouter();

    // Ensure kegiatan_id is a string
    const validKegiatanId = Array.isArray(kegiatan_id) ? kegiatan_id[0] : kegiatan_id;

    const [kegiatanDetail, setKegiatanDetail] = useState<KegiatanDetail | null>(null);
    const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
    const [loadingDetail, setLoadingDetail] = useState<boolean>(true);
    const [loadingPeserta, setLoadingPeserta] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [totalHonor, setTotalHonor] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10; // Define items per page

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Kegiatan Statistik", href: "/admin/daftar-kegiatan" },
        { label: "Detail Kegiatan" }
    ];

    // Fetch Kegiatan Detail and Peserta List
    const fetchKegiatanData = useCallback(async () => {
        if (!validKegiatanId) return;

        setLoadingDetail(true);
        setLoadingPeserta(true);
        try {
            const response = await fetch(`/api/detail-kegiatan?kegiatan_id=${validKegiatanId}`);
            const data: KegiatanDetailResponse = await response.json();

            if (response.ok) {
                if (data.kegiatanDetail) {
                    setKegiatanDetail(data.kegiatanDetail);
                }
                setPesertaList(data.pesertaList);
                setTotalHonor(data.totalHonor);
            } else {
                console.error("Failed to fetch kegiatan details:", data.message);
            }
        } catch (error) {
            console.error("Error fetching kegiatan details:", error);
        } finally {
            setLoadingDetail(false);
            setLoadingPeserta(false);
        }
    }, [validKegiatanId]);

    useEffect(() => {
        fetchKegiatanData();
    }, [fetchKegiatanData]);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage * itemsPerPage < pesertaList.length) setCurrentPage(currentPage + 1);
    };

    // Calculate the visible items for the current page
    const paginatedPesertaList = pesertaList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="w-full text-black px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Title */}
            <h1 className="text-2xl font-bold mt-4 mb-2">Detail Kegiatan Statistik</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Left Column - Kegiatan Details */}
                <div>
                    {loadingDetail ? (
                        <Skeleton height={400} />
                    ) : (
                        kegiatanDetail && (
                            <div className="p-4 border border-gray-300 rounded-md shadow-md">
                                <h2 className="text-lg font-semibold mb-4">Detail Kegiatan</h2>
                                <p className="text-sm sm:text-base"><strong>Nama Kegiatan:</strong> {kegiatanDetail.nama_kegiatan}</p>
                                <p className="text-sm sm:text-base"><strong>Kode Kegiatan:</strong> {kegiatanDetail.kode}</p>
                                <p className="text-sm sm:text-base"><strong>Penanggung Jawab:</strong> {kegiatanDetail.penanggung_jawab}</p>
                                <p className="text-sm sm:text-base"><strong>Jenis Kegiatan:</strong> {kegiatanDetail.jenis_kegiatan}</p>
                                <p className="text-sm sm:text-base"><strong>Tanggal Mulai:</strong> {kegiatanDetail.tanggal_mulai}</p>
                                <p className="text-sm sm:text-base"><strong>Tanggal Berakhir:</strong> {kegiatanDetail.tanggal_berakhir}</p>
                                <p className="text-sm sm:text-base"><strong>Honor Satuan:</strong> Rp {(kegiatanDetail.honor_satuan ?? 0).toLocaleString()}</p>
                                <p className="text-sm sm:text-base"><strong>Satuan Honor:</strong> {kegiatanDetail.satuan_honor}</p>
                            </div>
                        )
                    )}
                </div>

                {/* Right Column - Peserta List */}
                <div>
                    <div className="flex flex-col sm:flex-row mb-4 gap-2 sm:gap-0">
                        {/* Search Bar */}
                        <input
                            type="text"
                            placeholder="Cari SOBAT ID atau Nama"
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loadingPeserta ? (
                        <Skeleton height={200} />
                    ) : (
                        <div className="relative shadow-md sm:rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-2 py-2">SOBAT ID</th>
                                            <th scope="col" className="px-2 py-2">Nama</th>
                                            <th scope="col" className="px-2 py-2">Target</th>
                                            <th scope="col" className="px-2 py-2">Honor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPesertaList.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4">Tidak ada peserta yang ditemukan</td>
                                            </tr>
                                        ) : (
                                            paginatedPesertaList.map((peserta, index) => (
                                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-2 py-4 font-medium text-gray-900">{peserta.sobat_id}</td>
                                                    <td className="px-2 py-4">{peserta.nama}</td>
                                                    <td className="px-2 py-4">{peserta.target}</td>
                                                    <td className="px-2 py-4">Rp {peserta.honor.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Honor Section After Table */}
                            <div className="flex justify-between p-4 bg-white dark:bg-gray-800">
                                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Total Honor Kegiatan:</p>
                                <p className="text-sm font-semibold text-right text-gray-900 dark:text-white">
                                    Rp {totalHonor.toLocaleString()}
                                </p>
                            </div>

                            {/* Pagination Footer */}
                            <nav
                                className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 bg-white rounded-b-lg"
                                aria-label="Table navigation"
                            >
                                <span className="text-sm font-normal text-gray-500">
                                    Menampilkan{" "}
                                    <span className="font-semibold">
                                        {(currentPage - 1) * itemsPerPage + 1} -{" "}
                                        {Math.min(currentPage * itemsPerPage, pesertaList.length)}
                                    </span>{" "}
                                    dari <span className="font-semibold">{pesertaList.length}</span>
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
                                    <li>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={currentPage * itemsPerPage >= pesertaList.length}
                                            className={`flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 ${currentPage * itemsPerPage >= pesertaList.length
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
                    )}
                </div>
            </div>
        </div>
    );
}
