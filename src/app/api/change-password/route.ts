import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserBynip, updateUserPassword } from "@/lib/db/operations";
import { compare } from "bcryptjs"; // For comparing passwords
import { getServerSession } from "next-auth"; // Use the correct import for your NextAuth setup

// Zod schema to validate input data
const passwordSchema = z.object({
    nip: z.string(),
    oldPassword: z.string().min(4, "Password harus terdiri dari setidaknya 4 karakter"),
    newPassword: z.string().min(4, "Password baru harus terdiri dari setidaknya 4 karakter"),
});

export async function POST(request: Request) {
    const session = await getServerSession(); // Adjust if you are using custom auth method
    if (!session || !session.user) {
        return NextResponse.json({ error: "Anda belum login. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { nip, oldPassword, newPassword } = await request.json();

    // Validate request body
    const validation = passwordSchema.safeParse({ nip, oldPassword, newPassword });
    if (!validation.success) {
        return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    try {
        // Fetch the user by nip
        const user = await getUserBynip(nip);
        if (!user) {
            return NextResponse.json({ error: "Pengguna tidak ditemukan. Silakan periksa NIP Anda." }, { status: 404 });
        }

        // Compare the old password with the stored hash
        const isPasswordCorrect = await compare(oldPassword, user.password);

        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "Password lama yang Anda masukkan tidak sesuai." }, { status: 403 });
        }

        // Update the password in the database
        await updateUserPassword(user.id, newPassword);

        return NextResponse.json({ message: "Password Anda berhasil diperbarui." });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server. Silakan coba lagi nanti." }, { status: 500 });
    }
}
