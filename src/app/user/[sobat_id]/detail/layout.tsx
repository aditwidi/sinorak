import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Detail Mitra Statistik - SINORAK",
    description: "Halaman untuk menlihat detail data mitra statistik di SINORAK",
};

export default function DetailMitraLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
