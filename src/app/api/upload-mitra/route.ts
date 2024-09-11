import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/db"; // Import the Drizzle database instance
import { mitra } from "@/lib/db/schema"; // Import the schema for the 'mitra' table

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
        .regex(/^[a-zA-Z0-9\s,./:()'-]*$/, "Alamat contains invalid characters")
        .min(1, "Alamat is required")
        .max(255, "Alamat cannot exceed 255 characters"),
    jenis_kelamin: z.enum(["Laki-laki", "Perempuan"]),
});

// TypeScript type based on the Zod schema
type MitraType = z.infer<typeof mitraSchema>;

export async function POST(req: Request) {
    try {
        const body = await req.json(); // Read single entry from request body

        // Extract and normalize 'jenis_petugas' value
        let jenisPetugasRaw: string = body.jenis_petugas;

        if (typeof jenisPetugasRaw === "string") {
            // Remove "Mitra" and any extra spaces or parentheses
            jenisPetugasRaw = jenisPetugasRaw.replace(/Mitra\s*|\(|\)/g, "").trim();
        }

        // Validate if normalized 'jenis_petugas' is one of the allowed enum values
        const validJenisPetugas = ["Pendataan", "Pengolahan", "Pendataan dan Pengolahan"];
        if (!validJenisPetugas.includes(jenisPetugasRaw)) {
            return NextResponse.json(
                { error: "jenis_petugas is invalid and must be one of the allowed values." },
                { status: 400 }
            );
        }

        // Create a new object with the correct type
        const normalized: MitraType = {
            ...body,
            jenis_petugas: jenisPetugasRaw as "Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan",
        };

        // Validate the entry using Zod
        mitraSchema.parse(normalized);

        // Insert the single entry into the database using Drizzle ORM
        const result = await db.insert(mitra).values(normalized).run();

        return NextResponse.json(
            { message: "Mitra row uploaded successfully", result },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation Error Details:", error.errors); // Log detailed validation error messages
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error uploading mitra row:", error); // Log database or other errors
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
