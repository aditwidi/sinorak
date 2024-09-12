// app/admin/tambah-mitra/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Tambah Mitra - SINORA",
    description: "Halaman untuk menambah data mitra statistik di SINORA",
};

export default function TambahMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
