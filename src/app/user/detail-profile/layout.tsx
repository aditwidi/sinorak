// app/admin/detail-profile/layout.tsx

import { ReactNode } from "react";

export const metadata = {
    title: "Halaman Detail Profile - SINORA",
    description: "Halaman untuk melihat profile Anda di SINORA",
};

export default function DetailProfileLayout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}
