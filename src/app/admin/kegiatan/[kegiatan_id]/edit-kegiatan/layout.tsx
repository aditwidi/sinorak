// app/admin/edit-kegiatan/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Edit Kegiatan - SINORAK",
    description: "Halaman untuk mengedit kegiatan statistik di SINORAK",
};

export default function DetailProfileLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
