// app/admin/detail-mitra/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Detail Mitra Statistik - SINORA",
    description: "Halaman untuk menlihat detail data mitra statistik di SINORA",
};

export default function DetailMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
