// app/admin/daftar-mitra/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Daftar Semua Mitra Statistik - SINORAK",
    description: "Halaman untuk melihat data mitra statistik di SINORAK",
};

export default function DaftarMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
