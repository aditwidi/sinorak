import { NextResponse } from "next/server";
import { z } from "zod";
import { updateUserRole, getUserBynip } from "@/lib/db/operations"; // Import database operations
import { getServerSession } from "next-auth"; // Use NextAuth to get the current session

// Zod schema to validate input data
const roleSchema = z.object({
    nip: z.string(),
    newRole: z.enum(["admin", "user"]), // Accept only "admin" or "user"
});

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user) {
        console.log("Not authenticated");
        return NextResponse.json({ error: "Anda belum login. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { nip, newRole } = await request.json();

    // Validate request body
    const validation = roleSchema.safeParse({ nip, newRole });
    if (!validation.success) {
        return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    try {
        const user = await getUserBynip(nip);
        if (!user) {
            return NextResponse.json({ error: "Pengguna tidak ditemukan. Silakan periksa NIP Anda." }, { status: 404 });
        }
        await updateUserRole(user.id, newRole);

        return NextResponse.json({ message: "Role berhasil diperbarui." });
    } catch (error) {
        return NextResponse.json({ error: "Terjadi kesalahan pada server. Silakan coba lagi nanti." }, { status: 500 });
    }
}

