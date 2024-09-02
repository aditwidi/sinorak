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
}

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number | string; // Allow both number and string
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
    const [satuanHonor, setSatuanHonor] = useState<"Dokumen" | "OB" | "BS" | "Rumah Tangga">("Dokumen");
    const [loading, setLoading] = useState(false);
    const [mitras, setMitras] = useState<Mitra[]>([]);
    const [mitraEntries, setMitraEntries] = useState<MitraEntry[]>([{ sobat_id: "", target_volume_pekerjaan: "" }]); // Initialized with empty string
    const [honorSatuan, setHonorSatuan] = useState<string>(""); // Handle as a formatted string
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Kegiatan Statistik" },
        { label: "Tambah Kegiatan Statistik" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const mitrasResponse = await fetch("/api/mitra-data");
                const mitrasData = await mitrasResponse.json();

                if (mitrasResponse.ok) setMitras(mitrasData.mitraData);

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

    const handleMitraChange = (index: number, sobat_id: string) => {
        const newMitraEntries = [...mitraEntries];
        newMitraEntries[index].sobat_id = sobat_id;
        setMitraEntries(newMitraEntries);
    };

    const handleVolumeChange = (index: number, volume: string) => {
        const newMitraEntries = [...mitraEntries];
        newMitraEntries[index].target_volume_pekerjaan = volume === "" ? "" : parseInt(volume, 10); // Allow empty input or a valid number
        setMitraEntries(newMitraEntries);
    };

    const handleHonorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
        const formattedValue = formatCurrency(value);
        setHonorSatuan(formattedValue); // Update state with formatted value
    };

    const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date | null>>) => (date: Date | null) => {
        setter(date); // Set the date directly
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
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/tambah-kegiatan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama_kegiatan: namaKegiatan,
                    kode,
                    jenis_kegiatan: jenisKegiatan,
                    tanggal_mulai: tanggalMulai ? tanggalMulai.toISOString().split("T")[0] : "", // Convert to yyyy-mm-dd
                    tanggal_berakhir: tanggalBerakhir ? tanggalBerakhir.toISOString().split("T")[0] : "", // Convert to yyyy-mm-dd
                    penanggung_jawab: penanggungJawab,
                    satuan_honor: satuanHonor,
                    mitra_entries: mitraEntries,
                    honor_satuan: parseFloat(honorSatuan.replace(/[^\d.-]/g, "")), // Convert back to number
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Terjadi kesalahan saat menambahkan kegiatan.",
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Kegiatan berhasil ditambahkan.",
                }).then(() => {
                    router.push("/admin/kegiatan");
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
                                onChange={(e) => setNamaKegiatan(e.target.value)}
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
                                onChange={(e) => setKode(e.target.value)}
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
