import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Detail Kegiatan - SINORAK",
    description: "Halaman untuk melihat detail kegiatan statistik di SINORAK",
};

export default function DetailProfileLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
