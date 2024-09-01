import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra } from "@/lib/db/schema"; // Import your schema
import { eq } from "drizzle-orm";

// Update Mitra Data by sobat_id
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sobatId = searchParams.get("sobat_id");

        if (!sobatId) {
            return NextResponse.json({ error: "sobat_id is required" }, { status: 400 });
        }

        const body = await request.json();
        const { nik, jenis_petugas, nama, pekerjaan, alamat, jenis_kelamin } = body;

        // Validate the input data
        if (!nik || !jenis_petugas || !nama || !pekerjaan || !alamat || !jenis_kelamin) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Perform the update
        await db
            .update(mitra)
            .set({
                nik,
                jenis_petugas,
                nama,
                pekerjaan,
                alamat,
                jenis_kelamin,
            })
            .where(eq(mitra.sobat_id, sobatId))
            .run();

        // Check if the data has been updated by fetching the mitra again
        const updatedMitra = await db
            .select()
            .from(mitra)
            .where(eq(mitra.sobat_id, sobatId))
            .get();

        // If the data has been updated correctly, return success
        if (updatedMitra) {
            return NextResponse.json({ message: "Mitra updated successfully", mitra: updatedMitra }, { status: 200 });
        } else {
            // Handle case where mitra is not found after update
            return NextResponse.json({ error: "Mitra not found after update" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error updating mitra data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
