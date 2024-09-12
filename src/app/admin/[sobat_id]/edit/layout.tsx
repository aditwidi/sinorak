// app/admin/edit-mitra/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Edit Mitra Statistik - SINORA",
    description: "Halaman untuk mengedit data mitra statistik di SINORA",
};

export default function EditMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
