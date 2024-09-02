"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumb";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { useRouter } from "next/navigation";
import Select, { components, DropdownIndicatorProps, StylesConfig } from "react-select";

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
    target_volume_pekerjaan: number;
}

export default function TambahKegiatanPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State for form fields
    const [namaKegiatan, setNamaKegiatan] = useState("");
    const [kode, setKode] = useState("");
    const [jenisKegiatan, setJenisKegiatan] = useState<"Pendataan" | "Pemeriksaan" | "Pengolahan">("Pendataan");
    const [tanggalMulai, setTanggalMulai] = useState("");
    const [tanggalBerakhir, setTanggalBerakhir] = useState("");
    const [penanggungJawab, setPenanggungJawab] = useState<string>("");
    const [satuanHonor, setSatuanHonor] = useState<"Dokumen" | "OB" | "BS" | "Rumah Tangga">("Dokumen");
    const [loading, setLoading] = useState(false);
    const [mitras, setMitras] = useState<Mitra[]>([]);
    const [mitraEntries, setMitraEntries] = useState<MitraEntry[]>([{ sobat_id: "", target_volume_pekerjaan: 0 }]);
    const [honorSatuan, setHonorSatuan] = useState<number>(0);
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);
    const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);

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
            const [day, month, year] = tanggalBerakhir.split("/");
            const date = new Date(`${year}-${month}-${day}`);
            setMonth(date.getMonth() + 1);
            setYear(date.getFullYear());
        }
    }, [tanggalBerakhir]);

    const handleMitraChange = (selectedOption: Mitra | null) => {
        setSelectedMitra(selectedOption);
        const newMitraEntries = [...mitraEntries];
        newMitraEntries[0].sobat_id = selectedOption?.sobat_id || "";
        setMitraEntries(newMitraEntries);
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
                    tanggal_mulai: tanggalMulai,
                    tanggal_berakhir: tanggalBerakhir,
                    penanggung_jawab: penanggungJawab,
                    satuan_honor: satuanHonor,
                    mitra_entries: mitraEntries,
                    honor_satuan: honorSatuan,
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

    // Options for the Select component
    const mitraOptions: Mitra[] = mitras.map((mitra) => ({
        sobat_id: mitra.sobat_id,
        nama: mitra.nama,
    }));    
    
    const customStyles: StylesConfig<Mitra, false> = {
        control: (provided, state) => ({
            ...provided,
            boxShadow: 'none', // Remove default shadow
            borderColor: state.isFocused ? '#60a5fa' : '#e2e8f0', // Focus and default border color
            '&:hover': {
                borderColor: '#60a5fa', // Ensure custom border color on hover
            },
        }),
        input: (provided) => ({
            ...provided,
            boxShadow: 'none', // Remove input shadow
            outline: 'none', // Remove outline
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#60a5fa' // Background color when selected
                : state.isFocused
                ? '#e2e8f0' // Background color on hover
                : 'white', // Default background color
            color: state.isSelected ? 'white' : 'black', // Text color based on state
            cursor: 'pointer', // Show pointer cursor
        }),
    };

    return (
        <div className="w-full text-black">
            <Breadcrumb items={breadcrumbItems} />

            <h1 className="text-2xl font-bold mt-4">Tambah Kegiatan Statistik</h1>

            <div className="mt-6 space-y-8">
                <section>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                        {/* Other form fields */}
                        <div>
                            <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-gray-700">
                                Tanggal Mulai (dd/mm/yyyy)
                            </label>
                            <input
                                type="text"
                                id="tanggal_mulai"
                                value={tanggalMulai}
                                onChange={(e) => setTanggalMulai(e.target.value)}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="dd/mm/yyyy"
                            />
                        </div>
                        <div>
                            <label htmlFor="tanggal_berakhir" className="block text-sm font-medium text-gray-700">
                                Tanggal Berakhir (dd/mm/yyyy)
                            </label>
                            <input
                                type="text"
                                id="tanggal_berakhir"
                                value={tanggalBerakhir}
                                onChange={(e) => setTanggalBerakhir(e.target.value)}
                                required
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="dd/mm/yyyy"
                            />
                        </div>

                        {/* Mitra Selection */}
                        <div className="mb-4 relative">
                            <label className="block text-sm font-medium text-gray-700">Pilih Mitra</label>
                            <Select<Mitra>
                                options={mitraOptions}
                                getOptionLabel={(option) => `${option.sobat_id} - ${option.nama}`}
                                getOptionValue={(option) => option.sobat_id}
                                value={selectedMitra}
                                onChange={handleMitraChange}
                                placeholder="Cari Mitra..."
                                isClearable
                                className="mt-1 !ring-0 !shadow-none focus:!ring-0 focus:!shadow-none" // Remove ring color and shadow
                                classNamePrefix="custom-select" // Custom prefix to avoid tailwind styling conflicts
                                components={{ DropdownIndicator }}
                                styles={customStyles}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2 flex pb-4">
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
