import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Upload Mitra - SINORA",
    description: "Halaman untuk mengupload data mitra statistik di SINORA",
};

export default function TambahMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
