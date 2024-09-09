import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Upload Mitra - SINORAK",
    description: "Halaman untuk mengupload data mitra statistik di SINORAK",
};

export default function TambahMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
