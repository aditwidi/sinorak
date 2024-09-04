// src/app/api/get-kegiatan-mitra/[kegiatan_id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Ensure this points to your correct database connection setup
import { kegiatan_mitra } from "@/lib/db/schema"; // Import your table schema
import { eq } from "drizzle-orm"; // Import the 'eq' utility for building SQL conditions

export const revalidate = 0; // Revalidate every new data
// Named export for GET method
export async function GET(req: NextRequest, { params }: { params: { kegiatan_id: string } }) {
    const { kegiatan_id } = params;

    if (!kegiatan_id) {
        return NextResponse.json({ error: "kegiatan_id is required" }, { status: 400 });
    }

    try {
        // Correct way to select data using Drizzle ORM
        const kegiatanMitraData = await db
            .select()
            .from(kegiatan_mitra)
            .where(eq(kegiatan_mitra.kegiatan_id, Number(kegiatan_id))) // Use 'eq' for the equality check
            .execute();

        if (!kegiatanMitraData.length) {
            return NextResponse.json({ error: "No data found for the given kegiatan_id" }, { status: 404 });
        }

        return NextResponse.json({ kegiatanMitraData });
    } catch (error) {
        console.error("Error fetching kegiatan_mitra data:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
