"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import Link from "next/link"; // Import the Link component from Next.js
import {
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Define interfaces for data
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Activity {
  kegiatan_id: number;
  nama_kegiatan: string;
  kode: string;
  penanggung_jawab: string;
  jenis_kegiatan: string;
}

// AdminPage component
export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]); // State for activities data
  const [loading, setLoading] = useState<boolean>(true); // Loading state for fetching activities
  const [lapanganCount, setLapanganCount] = useState<number>(0);
  const [pengolahanCount, setPengolahanCount] = useState<number>(0);
  const [totalHonor, setTotalHonor] = useState<number>(0); // State for total honor
  const [loadingCounts, setLoadingCounts] = useState<boolean>(true);

  const breadcrumbItems: BreadcrumbItem[] = [];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State for filter
  const [filter, setFilter] = useState<string>("Semua");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Automatically calculate the current month and year
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString(); // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear().toString();

  // Fetch kegiatan data when the component mounts
  useEffect(() => {
    const fetchKegiatanData = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams({
          filterMonth: currentMonth,
          filterYear: currentYear,
        });

        const response = await fetch(`/api/kegiatan-data?${query.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setActivities(data.kegiatanData || []);
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
  }, [currentMonth, currentYear]); // Run effect when component mounts or current month/year changes

  // Fetch total honor on component mount
  useEffect(() => {
    const fetchTotalHonor = async () => {
      try {
        const response = await fetch("/api/total-honor-count");
        const data = await response.json();

        if (response.ok) {
          setTotalHonor(data.totalHonor ?? 0);
        } else {
          console.error("Failed to fetch total honor:", data.error);
        }
      } catch (error) {
        console.error("Error fetching total honor:", error);
      }
    };

    fetchTotalHonor();
  }, []);

  // Calculate paginated data
  const filteredData = activities.filter((activity) =>
    filter === "Semua" ? true : activity.jenis_kegiatan === filter
  );

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Functions to handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Handle filter change
  const handleFilterChange = (filterType: string) => {
    setFilter(filterType);
    setCurrentPage(1); // Reset to page 1 whenever filter changes
    setIsFilterOpen(false); // Close the dropdown after selecting a filter
  };

  // Fetch mitra counts on component mount
  useEffect(() => {
    const fetchKegiatanCounts = async () => {
      try {
        const response = await fetch("/api/kegiatan-count");
        const data = await response.json();

        if (response.ok) {
          setLapanganCount(data.lapanganCount ?? 0);
          setPengolahanCount(data.pengolahanCount ?? 0);
        } else {
          console.error("Failed to fetch kegiatan counts:", data.error);
        }
      } catch (error) {
        console.error("Error fetching kegiatan counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchKegiatanCounts();
  }, []);

  return (
    <div className="w-full text-black">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Greeting */}
      <h1 className="text-2xl font-bold mt-4 text-black">
        {status === "loading" ? (
          <Skeleton width={325} height={24} />
        ) : (
          <>Halo, {session?.user?.name}!</>
        )}
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 w-full"> {/* Adjusted grid-cols-3 to make cards align properly */}
        {loadingCounts ? (
          <>
            {/* Skeleton for Stat Cards */}
            <Skeleton height={150} width="100%" />
            <Skeleton height={150} width="100%" />
            <Skeleton height={150} width="100%" />
          </>
        ) : (
          <>
            {/* Updated Stat Cards */}
            <StatCard
              title="Total Kegiatan Lapangan"
              subtitle="Bulan Ini"
              value={lapanganCount.toString()}
              icon={<ClipboardDocumentIcon className="w-6 h-6 text-blue-500" />}
            />
            <StatCard
              title="Total Kegiatan Pengolahan"
              subtitle="Bulan Ini"
              value={pengolahanCount.toString()}
              icon={<ClipboardDocumentIcon className="w-6 h-6 text-yellow-500" />}
            />
            <StatCard
              title="Total Honor Semua Mitra"
              subtitle="Bulan Ini"
              value={`Rp ${totalHonor.toLocaleString("id-ID")}`}
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
              <Link href="/admin/daftar-kegiatan">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none w-full sm:w-auto"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Lihat Semua Kegiatan
                </button>
              </Link>

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
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a 1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isFilterOpen && (
                  <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-lg shadow-lg">
                    <ul className="py-1 text-sm text-gray-700">
                      {["Semua", "Lapangan", "Pengolahan"].map((type) => (
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
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      <Skeleton height={20} width="100%" />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? ( // Check if there is no data to display
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      Belum ada data kegiatan bulan ini.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((activity, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {activity.nama_kegiatan}
                      </th>
                      <td className="px-6 py-4">{activity.kode}</td>
                      <td className="px-6 py-4">{activity.penanggung_jawab}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${activity.jenis_kegiatan === "Lapangan"
                            ? "text-blue-800 bg-blue-100"
                              : "text-yellow-800 bg-yellow-100"
                          }`}>
                          {activity.jenis_kegiatan}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
