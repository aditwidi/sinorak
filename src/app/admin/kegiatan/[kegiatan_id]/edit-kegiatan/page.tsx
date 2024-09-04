"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumb";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import { useCallback } from "react"; // Import useCallback
import Skeleton from "react-loading-skeleton"; // Import Skeleton for skeleton loading
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton CSS

registerLocale("id", id);

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface Mitra {
    sobat_id: string;
    nama: string;
    jenis_petugas: "Pendataan" | "Pemeriksaan" | "Pengolahan";
}

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number | "";
    total_honor?: number;
    jenis_petugas?: string;
}

interface HonorLimit {
    jenis_petugas: string;
    honor_max: number;
}

// Define KegiatanMitraEntry interface to match the expected response from the API
interface KegiatanMitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
    total_honor?: number;
    jenis_petugas?: "Pendataan" | "Pemeriksaan" | "Pengolahan";
    honor_satuan: number;
}

function EditKegiatanPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { kegiatan_id } = useParams(); // Use useParams to get the dynamic route parameter

    // State for form fields
    const [namaKegiatan, setNamaKegiatan] = useState("");
    const [kode, setKode] = useState("");
    const [jenisKegiatan, setJenisKegiatan] = useState<
        "Pendataan" | "Pemeriksaan" | "Pengolahan"
    >("Pendataan");
    const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
    const [tanggalBerakhir, setTanggalBerakhir] = useState<Date | null>(null);
    const [penanggungJawab, setPenanggungJawab] = useState<string>("");
    const [satuanHonor, setSatuanHonor] = useState<
        | "Dokumen"
        | "OB"
        | "BS"
        | "Rumah Tangga"
        | "Pasar"
        | "Keluarga"
        | "SLS"
        | "Desa"
        | "Responden"
    >("Dokumen");
    const [loading, setLoading] = useState(false);
    const [mitras, setMitras] = useState<Mitra[]>([]);
    const [mitraEntries, setMitraEntries] = useState<MitraEntry[]>([
        { sobat_id: "", target_volume_pekerjaan: 0 } // Initialize as a number
    ]);
    const [honorSatuan, setHonorSatuan] = useState<string>("");
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);
    const [honorLimits, setHonorLimits] = useState<HonorLimit[]>([]);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Kegiatan Statistik" },
        { label: "Edit Kegiatan Statistik" }
    ];

    // Fetch initial data when component mounts
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!kegiatan_id) {
                console.error("No kegiatan_id found");
                return;
            }
    
            try {
                setLoading(true);
    
                // Fetch existing kegiatan data
                const response = await fetch(`/api/get-data-kegiatan/${kegiatan_id}`);
                const result = await response.json();
    
                if (response.ok) {
                    const data = result.kegiatan;
                    setNamaKegiatan(data.nama_kegiatan || "");
                    setKode(data.kode || "");
                    setJenisKegiatan(data.jenis_kegiatan || "Pendataan");
                    setTanggalMulai(data.tanggal_mulai ? new Date(data.tanggal_mulai) : null);
                    setTanggalBerakhir(data.tanggal_berakhir ? new Date(data.tanggal_berakhir) : null);
                    setPenanggungJawab(data.penanggung_jawab || "");
                    setSatuanHonor(data.satuan_honor || "Dokumen");
    
                    // Set month and year if available
                    setMonth(data.month || null);
                    setYear(data.year || null);
                } else {
                    Swal.fire("Error", result.error || "Failed to fetch kegiatan data", "error");
                }
    
                // Fetch honor_satuan and mitra entries
                const kegiatanMitraResponse = await fetch(`/api/get-kegiatan-mitra/${kegiatan_id}`);
                const kegiatanMitraData = await kegiatanMitraResponse.json();
    
                if (kegiatanMitraResponse.ok) {
                    const honorSatuan = kegiatanMitraData.kegiatanMitraData[0]?.honor_satuan || "";
                    const mitraEntriesData = kegiatanMitraData.kegiatanMitraData.map(
                        (entry: KegiatanMitraEntry) => ({
                            sobat_id: entry.sobat_id,
                            target_volume_pekerjaan: Number(entry.target_volume_pekerjaan),
                            total_honor: entry.total_honor,
                            jenis_petugas: entry.jenis_petugas,
                        })
                    );
    
                    setHonorSatuan(formatCurrency(honorSatuan.toString()));
                    setMitraEntries(mitraEntriesData);
                } else {
                    Swal.fire("Error", kegiatanMitraData.error || "Failed to fetch kegiatan mitra data", "error");
                }
    
                // Fetch mitras
                const mitrasResponse = await fetch("/api/mitra-data");
                const mitrasData = await mitrasResponse.json();
                if (mitrasResponse.ok) {
                    setMitras(mitrasData.mitraData);
                }
    
                // Fetch honor limits
                const honorLimitResponse = await fetch("/api/honor-limits");
                const honorLimitData = await honorLimitResponse.json();
                if (honorLimitResponse.ok) {
                    setHonorLimits(honorLimitData.honorLimits);
                }
    
                if (session?.user) {
                    setPenanggungJawab(session.user.name || "");
                }
            } catch (error) {
                Swal.fire("Error", "An unexpected error occurred while fetching data.", "error");
            } finally {
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, []); // <-- Empty dependency array to ensure it runs only once
    

    // Honor limit checking function using useCallback
    const checkHonorLimits = useCallback(() => {
        const exceedsLimit = mitraEntries.some((entry) => {
            const honorLimit = honorLimits.find(
                (limit) => limit.jenis_petugas === entry.jenis_petugas
            );
            if (honorLimit) {
                const currentHonor = entry.total_honor || 0;
                const honorPerUnit = parseFloat(honorSatuan.replace(/[^\d]/g, "")) || 0;
                const newHonor =
                    currentHonor + honorPerUnit * (entry.target_volume_pekerjaan || 0);

                if (newHonor > honorLimit.honor_max) {
                    Swal.fire({
                        icon: "warning",
                        title: "Peringatan",
                        text: `Honor untuk mitra jenis ${entry.jenis_petugas} ini melebihi batas maksimum sebesar Rp ${honorLimit.honor_max}.`,
                    });
                    return true;
                }
            }
            return false;
        });

        return exceedsLimit;
    }, [mitraEntries, honorLimits, honorSatuan]);

    // Trigger honor limits check whenever the relevant state changes
    useEffect(() => {
        if (mitraEntries.length > 0 && honorLimits.length > 0) {
            checkHonorLimits();
        }
    }, [mitraEntries, honorLimits, honorSatuan, checkHonorLimits]);

    const handleVolumeChange = (index: number, volume: string) => {
        const numericVolume = parseInt(volume, 10);

        if (isNaN(numericVolume) || numericVolume <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Target volume harus lebih dari nol.",
            });
            return;
        }

        // Update the target volume pekerjaan
        setMitraEntries((prevEntries) => {
            const newEntries = [...prevEntries];
            newEntries[index].target_volume_pekerjaan = numericVolume;
            return newEntries;
        });
    };

    const handleNamaKegiatanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9./\s\-()]*$/.test(value)) {
            setNamaKegiatan(value);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Nama Kegiatan hanya boleh mengandung huruf, angka, titik, strip, garis miring, dan tanda kurung.",
            });
        }
    };

    const handleKodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9.]*$/.test(value) && value.length <= 30) {
            setKode(value);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Kode Kegiatan hanya boleh mengandung huruf, angka, titik, dan maksimal 30 karakter.",
            });
        }
    };

    const handleHonorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, ""); // Remove all non-numeric characters
        const numericValue = parseFloat(value);

        if (!value || numericValue === 0) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Honor Satuan tidak boleh kosong atau nol.",
            });
            setHonorSatuan("");
            return;
        }

        const formattedValue = formatCurrency(value);
        setHonorSatuan(formattedValue);
    };

    const formatCurrency = (value: string) => {
        if (!value) return "Rp ";
        const formattedValue = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(value));
        return formattedValue;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        // Periksa apakah ada mitra yang melebihi batas honor maksimum
        const exceedsLimit = mitraEntries.some(entry => {
            const honorLimit = honorLimits.find(limit => limit.jenis_petugas === entry.jenis_petugas);
            if (honorLimit) {
                const currentHonor = entry.total_honor || 0;
                const newHonor = parseFloat(honorSatuan.replace(/[^\d]/g, "")) * (parseInt(entry.target_volume_pekerjaan as string, 10) || 0);
    
                if (newHonor > honorLimit.honor_max) {
                    return true;
                }
            }
            return false;
        });
    
        if (exceedsLimit) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Terdapat mitra yang melebihi batas honor maksimum! Periksa kembali data yang dimasukkan.",
            });
            setLoading(false); // Stop loading
            return; // Stop submit process
        }
    
        try {
            // Step 1: Deduct the current honor from mitra_honor_monthly
            const deductHonorResponse = await fetch(
                "/api/update-honor-mitra-monthly",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ kegiatan_id })
                }
            );
    
            if (!deductHonorResponse.ok) {
                const errorData = await deductHonorResponse.json();
                Swal.fire("Error", errorData.error || "Failed to deduct honor", "error");
                setLoading(false);
                return;
            }
    
            // Step 2: Update the kegiatan table
            const updateKegiatanResponse = await fetch("/api/update-kegiatan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kegiatan_id,
                    nama_kegiatan: namaKegiatan,
                    kode,
                    jenis_kegiatan: jenisKegiatan,
                    tanggal_mulai: tanggalMulai
                        ? tanggalMulai.toISOString().split("T")[0]
                        : "",
                    tanggal_berakhir: tanggalBerakhir
                        ? tanggalBerakhir.toISOString().split("T")[0]
                        : "",
                    penanggung_jawab: penanggungJawab,
                    satuan_honor: satuanHonor
                })
            });
    
            if (!updateKegiatanResponse.ok) {
                const errorData = await updateKegiatanResponse.json();
                Swal.fire(
                    "Error",
                    errorData.error || "Failed to update kegiatan",
                    "error"
                );
                setLoading(false);
                return;
            }
    
            // Step 3: Update the kegiatan_mitra table
            const updateKegiatanMitraResponse = await fetch("/api/update-kegiatan-mitra", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kegiatan_id,
                    mitra_entries: mitraEntries.map((entry) => ({
                        ...entry,
                        target_volume_pekerjaan: Number(entry.target_volume_pekerjaan) // Ensure this is a number
                    })),
                    honor_satuan: parseFloat(honorSatuan.replace(/[^\d]/g, ""))
                })
            });
    
            if (!updateKegiatanMitraResponse.ok) {
                const errorData = await updateKegiatanMitraResponse.json();
                Swal.fire("Error", errorData.error || "Failed to update kegiatan_mitra", "error");
                setLoading(false);
                return;
            }
    
            // **Tambahan Baru: Step 3.1: Update total_honor pada kegiatan_mitra**
            for (const entry of mitraEntries) {
                const updateTotalHonorResponse = await fetch("/api/update-honor", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        kegiatan_id,
                        sobat_id: entry.sobat_id,
                        honor_satuan: parseFloat(honorSatuan.replace(/[^\d]/g, "")), // Send honor_satuan as a number
                        target_volume_pekerjaan: entry.target_volume_pekerjaan, // Send target_volume_pekerjaan
                    })
                });
    
                if (!updateTotalHonorResponse.ok) {
                    const errorData = await updateTotalHonorResponse.json();
                    Swal.fire("Error", errorData.error || "Failed to update total_honor for sobat_id " + entry.sobat_id, "error");
                    setLoading(false);
                    return;
                }
            }
    
            // Step 4: Update the honor in mitra_honor_monthly
            const updateHonorResponse = await fetch("/api/mitra-honor-monthly", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mitra_entries: mitraEntries.map((entry) => ({
                        ...entry,
                        target_volume_pekerjaan: Number(entry.target_volume_pekerjaan) // Ensure this is a number
                    })),
                    honor_satuan: parseFloat(honorSatuan.replace(/[^\d]/g, "")),
                    tanggal_berakhir: tanggalBerakhir
                        ? tanggalBerakhir.toISOString().split("T")[0]
                        : ""
                })
            });
    
            if (!updateHonorResponse.ok) {
                const errorData = await updateHonorResponse.json();
                Swal.fire("Error", errorData.error || "Failed to update honor", "error");
                setLoading(false);
                return;
            }
    
            Swal.fire("Success", "Kegiatan and honor updated successfully.", "success");
            router.push("/admin/daftar-kegiatan"); // Redirect to a relevant page after success
        } catch (error) {
            console.error("Error:", error);
            Swal.fire(
                "Error",
                "An unexpected error occurred while updating.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };    

    const handleMitraChange = async (index: number, sobat_id: string) => {
        const newMitraEntries = [...mitraEntries];
        const selectedMitra = mitras.find((mitra) => mitra.sobat_id === sobat_id);

        // Check if selected mitra is found
        if (!selectedMitra) {
            console.error("Mitra not found for sobat_id:", sobat_id);
            return;
        }

        // Correctly assign all relevant details from the selected mitra
        newMitraEntries[index].sobat_id = sobat_id;
        newMitraEntries[index].jenis_petugas = selectedMitra.jenis_petugas; // Set jenis_petugas correctly

        setMitraEntries(newMitraEntries); // Update state to trigger re-render

        // Fetch the honor details for the selected mitra
        if (month && year && sobat_id) {
            try {
                const honorResponse = await fetch(
                    `/api/get-mitra-honor?sobat_id=${sobat_id}&month=${month}&year=${year}`
                );
                const honorData = await honorResponse.json();

                if (honorResponse.ok && honorData.total_honor !== undefined) {
                    newMitraEntries[index].total_honor = honorData.total_honor;
                } else {
                    newMitraEntries[index].total_honor = 0;
                }

                setMitraEntries(newMitraEntries); // Update state after fetching honor details
            } catch (error) {
                console.error("Error fetching honor for mitra:", error);
            }
        }

        // Run honor limit check after selection
        checkHonorLimits();
    };


    return (
        <div className="w-full text-black">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-2xl font-bold mt-4">Edit Kegiatan Statistik</h1>

            {/* Form structure is the same as TambahKegiatanPage with necessary changes and pre-filled data */}
            <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={handleSubmit}
            >
                {/* Nama Kegiatan - Kode Kegiatan */}
                <div>
                    <label
                        htmlFor="nama_kegiatan"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Nama Kegiatan
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <input
                            type="text"
                            id="nama_kegiatan"
                            value={namaKegiatan}
                            onChange={handleNamaKegiatanChange}
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Masukkan nama kegiatan"
                        />
                    )}
                </div>
                <div>
                    <label
                        htmlFor="kode"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Kode Kegiatan
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <input
                            type="text"
                            id="kode"
                            value={kode}
                            onChange={handleKodeChange}
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Masukkan kode kegiatan"
                        />
                    )}
                </div>

                {/* Penanggung Jawab - Jenis Kegiatan */}
                <div>
                    <label
                        htmlFor="penanggung_jawab"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Penanggung Jawab
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <input
                            type="text"
                            id="penanggung_jawab"
                            value={penanggungJawab}
                            readOnly
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                            placeholder="Penanggung Jawab"
                        />
                    )}
                </div>
                <div>
                    <label
                        htmlFor="jenis_kegiatan"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Jenis Kegiatan
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <select
                            id="jenis_kegiatan"
                            value={jenisKegiatan}
                            onChange={(e) =>
                                setJenisKegiatan(
                                    e.target.value as "Pendataan" | "Pemeriksaan" | "Pengolahan"
                                )
                            }
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Pendataan">Pendataan</option>
                            <option value="Pemeriksaan">Pemeriksaan</option>
                            <option value="Pengolahan">Pengolahan</option>
                        </select>
                    )}
                </div>

                {/* Tanggal Mulai - Tanggal Berakhir */}
                <div>
                    <label
                        htmlFor="tanggal_mulai"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tanggal Mulai
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <DatePicker
                            selected={tanggalMulai}
                            onChange={(date: Date | null) => setTanggalMulai(date)}
                            dateFormat="dd/MM/yyyy"
                            locale="id"
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Masukkan Tanggal Mulai Kegiatan"
                            required
                            wrapperClassName="w-full"
                        />
                    )}
                </div>
                <div>
                    <label
                        htmlFor="tanggal_berakhir"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tanggal Berakhir
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <DatePicker
                            selected={tanggalBerakhir}
                            onChange={(date: Date | null) => setTanggalBerakhir(date)}
                            dateFormat="dd/MM/yyyy"
                            locale="id"
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Masukkan Tanggal Berakhir Kegiatan"
                            required
                            wrapperClassName="w-full"
                        />
                    )}
                </div>

                {/* Honor Satuan - Satuan Honor */}
                <div>
                    <label
                        htmlFor="honor_satuan"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Honor Satuan
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <input
                            type="text"
                            id="honor_satuan"
                            value={honorSatuan}
                            onChange={handleHonorChange}
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Rp"
                        />
                    )}
                </div>
                <div>
                    <label
                        htmlFor="satuan_honor"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Satuan Honor
                    </label>
                    {loading ? (
                        <Skeleton height={40} className="mt-1 rounded-md" />
                    ) : (
                        <select
                            id="satuan_honor"
                            value={satuanHonor}
                            onChange={(e) =>
                                setSatuanHonor(
                                    e.target.value as
                                    | "Dokumen"
                                    | "OB"
                                    | "BS"
                                    | "Rumah Tangga"
                                    | "Pasar"
                                    | "Keluarga"
                                    | "SLS"
                                    | "Desa"
                                    | "Responden"
                                )
                            }
                            required
                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Dokumen">Dokumen</option>
                            <option value="OB">OB</option>
                            <option value="BS">BS</option>
                            <option value="Rumah Tangga">Rumah Tangga</option>
                            <option value="Pasar">Pasar</option>
                            <option value="Keluarga">Keluarga</option>
                            <option value="SLS">SLS</option>
                            <option value="Desa">Desa</option>
                            <option value="Responden">Responden</option>
                        </select>
                    )}
                </div>

                {/* Section 2: Mitra Management */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Mitra dan Target Volume</h2>
                    {mitraEntries.map((entry, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-4 mb-4"
                        >
                            <Select<Mitra>
                                options={mitras.filter(
                                    (mitra) =>
                                        !mitraEntries.map((e) => e.sobat_id).includes(mitra.sobat_id)
                                )}
                                getOptionLabel={(option) => `${option.sobat_id} - ${option.nama}`}
                                getOptionValue={(option) => option.sobat_id}
                                value={mitras.find((option) => option.sobat_id === entry.sobat_id) || null}
                                onChange={(selectedOption) =>
                                    handleMitraChange(index, selectedOption?.sobat_id || "")
                                }
                                placeholder="Pilih Mitra"
                                isClearable
                                classNamePrefix="custom-select"
                                className="w-1/2"
                            />
                            <input
                                type="number"
                                value={entry.target_volume_pekerjaan === "" ? "" : entry.target_volume_pekerjaan.toString()} // Handle both empty and numeric values
                                onChange={(e) => handleVolumeChange(index, e.target.value)}
                                className="w-1/4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Target Volume"
                            />

                            {mitraEntries.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newEntries = mitraEntries.filter(
                                            (_, i) => i !== index
                                        );
                                        setMitraEntries(newEntries);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            setMitraEntries([
                                ...mitraEntries,
                                { sobat_id: "", target_volume_pekerjaan: 0 } // Initialize with number
                            ])
                        }
                        className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md"
                    >
                        Tambah Mitra
                    </button>
                </div>

                {/* Submit Button at the End */}
                <div className="md:col-span-2 flex justify-end pb-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-auto flex justify-center items-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
                        style={{ minWidth: "150px" }}
                    >
                        {loading ? <LoadingIndicator /> : "Update Kegiatan"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default dynamic(() => Promise.resolve(EditKegiatanPage), { ssr: false });
