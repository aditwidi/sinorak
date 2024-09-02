// app/admin/detail-profile/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Tambah Kegiatan Statistik - SINORAK",
    description: "Halaman untuk menambah kegiatan statistik BPS Kota Bekasi di SINORAK",
};

export default function DetailProfileLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
