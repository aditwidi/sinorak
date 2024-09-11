// app/api/tambah-mitra/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createMitra } from "@/lib/db/operations"; // Import the createMitra function

// Define Zod schema for validation
const mitraSchema = z.object({
    sobat_id: z
        .string()
        .regex(/^\d+$/, "Sobat ID must contain only numbers")
        .min(1, "Sobat ID is required")
        .max(50, "Sobat ID cannot exceed 50 characters"),
    nik: z
        .string()
        .regex(/^\d+$/, "NIK must contain only numbers")
        .min(1, "NIK is required")
        .max(20, "NIK cannot exceed 20 characters"),
    jenis_petugas: z.enum(["Pendataan", "Pengolahan", "Pendataan dan Pengolahan"]),
    nama: z
        .string()
        .regex(/^[a-zA-Z\s.,-]*$/, "Nama must contain only letters and spaces")
        .min(1, "Nama is required")
        .max(100, "Nama cannot exceed 100 characters"),
    pekerjaan: z
        .string()
        .regex(/^[a-zA-Z0-9\s]*$/, "Pekerjaan must contain only alphanumeric characters and spaces")
        .min(1, "Pekerjaan is required")
        .max(100, "Pekerjaan cannot exceed 100 characters"),
    alamat: z
        .string()
        .regex(/^[a-zA-Z0-9\s,.-]*$/, "Alamat contains invalid characters")
        .min(1, "Alamat is required")
        .max(255, "Alamat cannot exceed 255 characters"),
    jenis_kelamin: z.enum(["Laki-laki", "Perempuan"]),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate the request body
        const validatedData = mitraSchema.parse(body);

        // Create a new mitra in the database
        const result = await createMitra(validatedData);

        // Respond with success
        return NextResponse.json({ message: "Mitra berhasil ditambahkan", result }, { status: 201 });
    } catch (error) {
        // Handle validation or database errors
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error creating mitra:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
