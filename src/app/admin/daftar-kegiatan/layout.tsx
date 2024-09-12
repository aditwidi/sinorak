// app/admin/daftar-kegiatan/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Daftar Semua Kegiatan Statistik - SINORA",
    description: "Halaman untuk melihat data kegiatan statistik di SINORA",
};

export default function DaftarKegiatanLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
