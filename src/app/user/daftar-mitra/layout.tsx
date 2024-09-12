import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Daftar Semua Mitra Statistik - SINORA",
    description: "Halaman untuk melihat data mitra statistik di SINORA",
};

export default function DaftarMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
