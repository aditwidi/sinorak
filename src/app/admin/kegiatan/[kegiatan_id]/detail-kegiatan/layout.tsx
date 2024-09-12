

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Detail Kegiatan - SINORA",
    description: "Halaman untuk melihat detail kegiatan statistik di SINORA",
};

export default function DetailProfileLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
