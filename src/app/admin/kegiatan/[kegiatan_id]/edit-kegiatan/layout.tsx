// app/admin/edit-kegiatan/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Edit Kegiatan - SINORA",
    description: "Halaman untuk mengedit kegiatan statistik di SINORA",
};

export default function DetailProfileLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
