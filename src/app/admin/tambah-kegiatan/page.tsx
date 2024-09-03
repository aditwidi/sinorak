"use client";

import dynamic from "next/dynamic"; // Import dynamic from next/dynamic
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumb";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useRouter } from "next/navigation";
import Select, { components, DropdownIndicatorProps, StylesConfig } from "react-select";
import DatePicker from "react-datepicker"; // Import react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import datepicker CSS
import { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import { format } from "date-fns";

// Register Indonesian locale for react-datepicker
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
    target_volume_pekerjaan: number | string; // Allow both number and string
    total_honor?: number; // Optional field to store total honor
    jenis_petugas?: string; // Add jenis_petugas to track the type of staff
}

interface HonorLimit {
    jenis_petugas: string;
    honor_max: number;
}

function TambahKegiatanPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // State for form fields
    const [namaKegiatan, setNamaKegiatan] = useState("");
    const [kode, setKode] = useState("");
    const [jenisKegiatan, setJenisKegiatan] = useState<"Pendataan" | "Pemeriksaan" | "Pengolahan">("Pendataan");
    const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null); // Use Date type
    const [tanggalBerakhir, setTanggalBerakhir] = useState<Date | null>(null); // Use Date type
    const [penanggungJawab, setPenanggungJawab] = useState<string>("");
    const [satuanHonor, setSatuanHonor] = useState<"Dokumen" | "OB" | "BS" | "Rumah Tangga" | "Pasar" | "Keluarga" | "SLS" | "Desa" | "Responden">("Dokumen");
    const [loading, setLoading] = useState(false);
    const [mitras, setMitras] = useState<Mitra[]>([]);
    const [mitraEntries, setMitraEntries] = useState<MitraEntry[]>([{ sobat_id: "", target_volume_pekerjaan: "" }]); // Initialized with empty string
    const [honorSatuan, setHonorSatuan] = useState<string>(""); // Handle as a formatted string
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);
    const [honorLimits, setHonorLimits] = useState<HonorLimit[]>([]);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Kegiatan Statistik" },
        { label: "Tambah Kegiatan Statistik" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch mitras
                const mitrasResponse = await fetch("/api/mitra-data");
                const mitrasData = await mitrasResponse.json();
                if (mitrasResponse.ok) setMitras(mitrasData.mitraData);

                // Fetch honor limits
                const honorLimitResponse = await fetch("/api/honor-limits");
                const honorLimitData = await honorLimitResponse.json();
                if (honorLimitResponse.ok) setHonorLimits(honorLimitData.honorLimits);

                if (session?.user) {
                    setPenanggungJawab(session.user.name || "");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [session]);

    useEffect(() => {
        if (tanggalBerakhir) {
            const year = tanggalBerakhir.getFullYear();
            const month = tanggalBerakhir.getMonth() + 1; // Months are zero-based
            setMonth(month);
            setYear(year);
        }
    }, [tanggalBerakhir]);

    const handleMitraChange = async (index: number, sobat_id: string) => {
        const newMitraEntries = [...mitraEntries];
        const selectedMitra = mitras.find(mitra => mitra.sobat_id === sobat_id);

        newMitraEntries[index].sobat_id = sobat_id;
        newMitraEntries[index].jenis_petugas = selectedMitra?.jenis_petugas; // Set jenis_petugas for the selected mitra
        setMitraEntries(newMitraEntries);

        // Fetch current honor for the mitra based on month and year
        if (month && year && sobat_id) {
            const honorResponse = await fetch(`/api/get-mitra-honor?sobat_id=${sobat_id}&month=${month}&year=${year}`);
            const honorData = await honorResponse.json();

            if (honorResponse.ok && honorData.total_honor) {
                // Store the current honor in the mitra entry
                newMitraEntries[index].total_honor = honorData.total_honor;
                setMitraEntries(newMitraEntries);
            } else {
                newMitraEntries[index].total_honor = 0; // Default to 0 if no data is found
                setMitraEntries(newMitraEntries);
            }
        }
    };

    const handleVolumeChange = (index: number, volume: string) => {
        const newMitraEntries = [...mitraEntries];
        const numericVolume = parseInt(volume, 10);
        if (isNaN(numericVolume) || numericVolume <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Target volume harus lebih dari nol.",
            });
            return;
        }

        newMitraEntries[index].target_volume_pekerjaan = volume === "" ? "" : numericVolume;

        // Check honor limit
        const jenisPetugas = newMitraEntries[index].jenis_petugas; // Use jenis_petugas from the mitra entry
        const honorLimit = honorLimits.find(limit => limit.jenis_petugas === jenisPetugas);

        if (honorLimit) {
            const currentHonor = newMitraEntries[index].total_honor || 0;
            const newHonor = currentHonor + parseFloat(honorSatuan.replace(/[^\d]/g, "")) * numericVolume;

            if (newHonor > honorLimit.honor_max) {
                Swal.fire({
                    icon: "warning",
                    title: "Peringatan",
                    text: `Honor untuk mitra jenis ${jenisPetugas} ini melebihi batas maksimum sebesar Rp ${honorLimit.honor_max}.`,
                });
            }
        }

        setMitraEntries(newMitraEntries);
    };

    const handleHonorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, ""); // Remove all non-numeric characters except for numbers
        const formattedValue = formatCurrency(value);
        setHonorSatuan(formattedValue); // Update state with formatted value
    };

    const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date | null>>) => (date: Date | null) => {
        setter(date); // Set the date directly
    };

    const handleNamaKegiatanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9. ]*$/.test(value)) {
            // Only allow letters, numbers, periods, and spaces
            setNamaKegiatan(value);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Nama Kegiatan hanya boleh mengandung huruf, angka, dan titik.",
            });
        }
    };

    const handleKodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9.]*$/.test(value) && value.length <= 30) {
            // Only allow letters, numbers, and periods, and max 30 characters
            setKode(value);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Kode Kegiatan hanya boleh mengandung huruf, angka, titik, dan maksimal 30 karakter.",
            });
        }
    };

    // Function to format number to Indonesian Rupiah format
    const formatCurrency = (value: string) => {
        if (!value) return "Rp "; // Handle empty input
        const formattedValue = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(value));
        return formattedValue;
    };

    const addMitraEntry = () => {
        setMitraEntries([...mitraEntries, { sobat_id: "", target_volume_pekerjaan: "" }]); // Add with empty string
    };

    const removeMitraEntry = (index: number) => {
        const newMitraEntries = mitraEntries.filter((_, i) => i !== index);
        setMitraEntries(newMitraEntries);
    };

    const getAvailableMitras = (selectedSobatIds: string[]) => {
        return mitras.filter(mitra => !selectedSobatIds.includes(mitra.sobat_id));
    };

    // Fungsi untuk memeriksa apakah ada mitra yang melebihi batas honor maksimum
    const checkMitraHonorExceedsLimit = () => {
        for (const entry of mitraEntries) {
            const honorLimit = honorLimits.find(limit => limit.jenis_petugas === entry.jenis_petugas);
            if (honorLimit) {
                const currentHonor = entry.total_honor || 0;
                const newHonor = currentHonor + parseFloat(honorSatuan.replace(/[^\d]/g, "")) * (parseInt(entry.target_volume_pekerjaan as string, 10) || 0);

                if (newHonor > honorLimit.honor_max) {
                    return true; // Ada mitra yang melebihi batas honor maksimum
                }
            }
        }
        return false; // Tidak ada mitra yang melebihi batas honor maksimum
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Periksa apakah ada mitra yang melebihi batas honor maksimum
        if (checkMitraHonorExceedsLimit()) {
            Swal.fire({
                icon: "warning",
                title: "Peringatan",
                text: "Terdapat mitra yang melebihi batas honor maksimum! Periksa kembali data yang dimasukkan.",
            });
            setLoading(false); // Stop loading
            return; // Hentikan proses submit
        }

        try {
            // First API call to create kegiatan
            const kegiatanResponse = await fetch("/api/kegiatan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama_kegiatan: namaKegiatan,
                    kode,
                    jenis_kegiatan: jenisKegiatan,
                    tanggal_mulai: tanggalMulai ? tanggalMulai.toISOString().split("T")[0] : "",
                    tanggal_berakhir: tanggalBerakhir ? tanggalBerakhir.toISOString().split("T")[0] : "",
                    penanggung_jawab: penanggungJawab,
                    satuan_honor: satuanHonor,
                }),
            });

            const kegiatanData = await kegiatanResponse.json();

            if (!kegiatanResponse.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: kegiatanData.error || "Terjadi kesalahan saat menambahkan kegiatan.",
                });
                return;
            }

            const kegiatan_id = kegiatanData.kegiatan_id;

            // Second API call to add mitra entries
            const mitraResponse = await fetch("/api/kegiatan-mitra", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kegiatan_id,
                    mitra_entries: mitraEntries,
                    honor_satuan: parseFloat(honorSatuan.replace(/[^\d]/g, "")), // Convert back to number
                }),
            });

            const mitraData = await mitraResponse.json();

            if (!mitraResponse.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: mitraData.error || "Terjadi kesalahan saat menambahkan mitra ke kegiatan.",
                });
                return;
            }

            // Third API call to update honor for mitra
            const honorResponse = await fetch("/api/mitra-honor-monthly", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mitra_entries: mitraEntries,
                    honor_satuan: parseFloat(honorSatuan.replace(/[^\d]/g, "")), // Convert back to number
                    tanggal_berakhir: tanggalBerakhir ? tanggalBerakhir.toISOString().split("T")[0] : "",
                }),
            });

            const honorData = await honorResponse.json();

            if (!honorResponse.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: honorData.error || "Terjadi kesalahan saat mengupdate honor mitra.",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Kegiatan dan honor mitra berhasil ditambahkan.",
                });
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


    const mitraOptions: Mitra[] = mitras.map((mitra) => ({
        sobat_id: mitra.sobat_id,
        nama: mitra.nama,
        jenis_petugas: mitra.jenis_petugas, // Add jenis_petugas to the mapped object
    }));

    const customStyles: StylesConfig<Mitra, false> = {
        control: (provided, state) => ({
            ...provided,
            boxShadow: "none",
            borderColor: state.isFocused ? "#60a5fa" : "#e2e8f0",
            "&:hover": {
                borderColor: "#60a5fa",
            },
        }),
        input: (provided) => ({
            ...provided,
            boxShadow: "none",
            outline: "none",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "white",
            zIndex: 1000,
            position: "relative",
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#60a5fa" : state.isFocused ? "#e2e8f0" : "white",
            color: state.isSelected ? "white" : "black",
            cursor: "pointer",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: "#60a5fa",
        }),
    };

    return (
        <div className="w-full text-black">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-2xl font-bold mt-4">Tambah Kegiatan Statistik</h1>

            <div className="mt-6 space-y-8">
                <section>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Nama Kegiatan - Kode Kegiatan */}
                        <div>
                            <label htmlFor="nama_kegiatan" className="block text-sm font-medium text-gray-700">
                                Nama Kegiatan
                            </label>
                            <input
                                type="text"
                                id="nama_kegiatan"
                                value={namaKegiatan}
                                onChange={handleNamaKegiatanChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan nama kegiatan"
                            />
                        </div>
                        <div>
                            <label htmlFor="kode" className="block text-sm font-medium text-gray-700">
                                Kode Kegiatan
                            </label>
                            <input
                                type="text"
                                id="kode"
                                value={kode}
                                onChange={handleKodeChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan kode kegiatan"
                            />
                        </div>

                        {/* Penanggung Jawab - Jenis Kegiatan */}
                        <div>
                            <label htmlFor="penanggung_jawab" className="block text-sm font-medium text-gray-700">
                                Penanggung Jawab
                            </label>
                            <input
                                type="text"
                                id="penanggung_jawab"
                                value={penanggungJawab}
                                readOnly
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                placeholder="Penanggung Jawab"
                            />
                        </div>
                        <div>
                            <label htmlFor="jenis_kegiatan" className="block text-sm font-medium text-gray-700">
                                Jenis Kegiatan
                            </label>
                            <select
                                id="jenis_kegiatan"
                                value={jenisKegiatan}
                                onChange={(e) => setJenisKegiatan(e.target.value as "Pendataan" | "Pemeriksaan" | "Pengolahan")}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Pendataan">Pendataan</option>
                                <option value="Pemeriksaan">Pemeriksaan</option>
                                <option value="Pengolahan">Pengolahan</option>
                            </select>
                        </div>

                        {/* Tanggal Mulai - Tanggal Berakhir */}
                        <div>
                            <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-gray-700">
                                Tanggal Mulai
                            </label>
                            <DatePicker
                                selected={tanggalMulai}
                                onChange={handleDateChange(setTanggalMulai)}
                                dateFormat="dd/MM/yyyy"
                                locale="id" // Set locale to Indonesian
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholderText="Masukkan Tanggal Mulai Kegiatan"
                                required
                                wrapperClassName="w-full" // Ensure the wrapper has full width
                            />
                        </div>
                        <div>
                            <label htmlFor="tanggal_berakhir" className="block text-sm font-medium text-gray-700">
                                Tanggal Berakhir
                            </label>
                            <DatePicker
                                selected={tanggalBerakhir}
                                onChange={handleDateChange(setTanggalBerakhir)}
                                dateFormat="dd/MM/yyyy"
                                locale="id" // Set locale to Indonesian
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholderText="Masukkan Tanggal Berakhir Kegiatan"
                                required
                                wrapperClassName="w-full" // Ensure the wrapper has full width
                            />
                        </div>

                        {/* Honor Satuan - Satuan Honor */}
                        <div>
                            <label htmlFor="honor_satuan" className="block text-sm font-medium text-gray-700">
                                Honor Satuan
                            </label>
                            <input
                                type="text"
                                id="honor_satuan"
                                value={honorSatuan}
                                onChange={handleHonorChange}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Rp"
                            />
                        </div>
                        <div>
                            <label htmlFor="satuan_honor" className="block text-sm font-medium text-gray-700">
                                Satuan Honor
                            </label>
                            <select
                                id="satuan_honor"
                                value={satuanHonor}
                                onChange={(e) => setSatuanHonor(e.target.value as "Dokumen" | "OB" | "BS" | "Rumah Tangga")}
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
                        </div>

                        {/* Section 2: Mitra Management */}
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Mitra dan Target Volume</h2>
                            {mitraEntries.map((entry, index) => (
                                <div key={index} className="flex items-center space-x-4 mb-4">
                                    <Select<Mitra>
                                        options={getAvailableMitras(mitraEntries.map(e => e.sobat_id))}
                                        getOptionLabel={(option) => `${option.sobat_id} - ${option.nama}`}
                                        getOptionValue={(option) => option.sobat_id}
                                        value={mitraOptions.find((option) => option.sobat_id === entry.sobat_id) || null}
                                        onChange={(selectedOption) => handleMitraChange(index, selectedOption?.sobat_id || "")}
                                        placeholder="Pilih Mitra"
                                        isClearable
                                        classNamePrefix="custom-select"
                                        styles={customStyles}
                                        className="w-1/2"
                                    />
                                    <input
                                        type="number"
                                        value={entry.target_volume_pekerjaan}
                                        onChange={(e) => handleVolumeChange(index, e.target.value)}
                                        className="w-1/4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Target Volume"
                                    />
                                    {mitraEntries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMitraEntry(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addMitraEntry}
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
                                {loading ? <LoadingIndicator /> : "Tambah Kegiatan"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

// Dropdown Indicator Component
const DropdownIndicator = (props: DropdownIndicatorProps<Mitra, false>) => {
    return (
        <components.DropdownIndicator {...props}>
            <ChevronDown />
        </components.DropdownIndicator>
    );
};

const ChevronDown = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
);

// Export the component with dynamic import and SSR disabled
export default dynamic(() => Promise.resolve(TambahKegiatanPage), { ssr: false });
