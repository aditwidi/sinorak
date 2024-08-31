"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // Import SWR
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Activity {
  name: string;
  code: string;
  responsible: string;
  type: string;
}

// Fetcher function to use with SWR
const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { data, error } = useSWR("/api/mitra-counts", fetcher, { refreshInterval: 10000 });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const activities: Activity[] = [
    { name: "Pemeriksaan Updating Listing (Susenas Maret 2024)", code: "2898.BMA.007.005.A.521213", responsible: "John Doe", type: "Pemeriksaan" },
    { name: "Pendataan Survey Sosial Ekonomi (Desember 2024)", code: "2898.BMA.007.005.A.521214", responsible: "Jane Smith", type: "Pendataan" },
    { name: "Analisis Data Konsumsi Rumah Tangga (2024)", code: "2898.BMA.007.005.A.521215", responsible: "Michael Johnson", type: "Pengolahan" },
    // Add more data here as needed
  ];
  
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const [filter, setFilter] = useState<string>("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const filteredData = activities.filter((activity) =>
    filter === "Semua" ? true : activity.type === filter
  );

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  // Determine the loading state
  const loadingCounts = !data && !error;
  const pendataanCount = data?.pendataanCount ?? 0;
  const pemeriksaanCount = data?.pemeriksaanCount ?? 0;
  const pengolahanCount = data?.pengolahanCount ?? 0;

  return (
    <div className="w-full text-black">
      <Breadcrumb items={[]} />
      <h1 className="text-2xl font-bold mt-4 text-black">
        {status === "loading" ? (
          <Skeleton width={325} height={24} />
        ) : (
          <>Halo, {session?.user?.name}!</>
        )}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 w-full">
        {loadingCounts ? (
          <>
            <Skeleton height={100} width="100%" />
            <Skeleton height={100} width="100%" />
            <Skeleton height={100} width="100%" />
            <Skeleton height={100} width="100%" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Mitra Pendataan"
              subtitle="Bulan Ini"
              value={pendataanCount.toString()}
              icon={<ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500" />}
            />
            <StatCard
              title="Total Mitra Pemeriksaan"
              subtitle="Bulan Ini"
              value={pemeriksaanCount.toString()}
              icon={<ClipboardDocumentListIcon className="w-6 h-6 text-green-500" />}
            />
            <StatCard
              title="Total Mitra Pengolahan"
              subtitle="Bulan Ini"
              value={pengolahanCount.toString()}
              icon={<ClipboardDocumentIcon className="w-6 h-6 text-yellow-500" />}
            />
            <StatCard
              title="Total Honor Kegiatan"
              subtitle="Bulan Ini"
              value="Rp 10.000.000"
              icon={<CurrencyDollarIcon className="w-6 h-6 text-red-500" />}
            />
          </>
        )}
      </div>

      {/* Table Header and Table */}
      <div className="pb-6">
        <div className="relative shadow-md sm:rounded-lg mt-9">
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
            <div className="mb-4 sm:mb-0">
              <h5 className="font-semibold text-gray-900 mb-2">Kegiatan Bulan Ini</h5>
              <p className="text-sm text-gray-500">
                Kegiatan statistik yang dilakukan oleh BPS Kota Bekasi selama bulan ini.
              </p>
            </div>

            {/* Buttons Container */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-1 sm:mt-0">
              {/* Lihat Semua Kegiatan Button */}
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none w-full sm:w-auto"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Lihat Semua Kegiatan
              </button>

              {/* Filter Button and Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 w-full sm:w-auto"
                  type="button"
                >
                  <FunnelIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Filter
                  <svg
                    className="-mr-1 ml-1.5 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isFilterOpen && (
                  <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-lg shadow-lg">
                    <ul className="py-1 text-sm text-gray-700">
                      {["Semua", "Pendataan", "Pemeriksaan", "Pengolahan"].map((type) => (
                        <li key={type}>
                          <button
                            onClick={() => handleFilterChange(type)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${filter === type ? "font-semibold text-blue-600" : ""
                              }`}
                          >
                            {type}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nama Kegiatan</th>
                  <th scope="col" className="px-6 py-3">Kode Kegiatan</th>
                  <th scope="col" className="px-6 py-3">Penanggung Jawab</th>
                  <th scope="col" className="px-6 py-3">Jenis Kegiatan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((activity, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {activity.name}
                    </th>
                    <td className="px-6 py-4">{activity.code}</td>
                    <td className="px-6 py-4">{activity.responsible}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.type === "Pendataan" ? "text-blue-800 bg-blue-100" :
                        activity.type === "Pemeriksaan" ? "text-green-800 bg-green-100" :
                          "text-yellow-800 bg-yellow-100"
                        }`}>
                        {activity.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer with Real Pagination */}
        <div className="relative bg-white rounded-b-lg shadow-md dark:bg-gray-800">
          <nav
            className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredData.length)}</span> dari{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{filteredData.length}</span>
            </span>
            {/* Adjusted Pagination */}
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
              {/* Show the current page only on smaller screens */}
              <li className="flex items-center justify-center px-3 py-2 text-sm leading-tight border border-gray-300 sm:hidden">
                {currentPage}
              </li>
              {/* Show all page numbers on larger screens */}
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
