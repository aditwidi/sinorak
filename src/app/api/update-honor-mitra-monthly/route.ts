// src/app/api/update-honor-mitra-monthly/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { mitra_honor_monthly, kegiatan_mitra, kegiatan } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { kegiatan_id } = await req.json();

        if (!kegiatan_id) {
            return NextResponse.json({ error: "Missing kegiatan_id" }, { status: 400 });
        }

        // Fetch kegiatan_mitra data with tanggal_berakhir from kegiatan table
        const kegiatanMitraEntries = await db
            .select({
                kegiatan_id: kegiatan_mitra.kegiatan_id,
                sobat_id: kegiatan_mitra.sobat_id,
                kegiatan_mitra_id: kegiatan_mitra.kegiatan_mitra_id,
                honor_satuan: kegiatan_mitra.honor_satuan,
                target_volume_pekerjaan: kegiatan_mitra.target_volume_pekerjaan,
                total_honor: kegiatan_mitra.total_honor,
                tanggal_berakhir: kegiatan.tanggal_berakhir, // Join to get tanggal_berakhir from kegiatan
            })
            .from(kegiatan_mitra)
            .innerJoin(kegiatan, eq(kegiatan_mitra.kegiatan_id, kegiatan.kegiatan_id)) // Join on kegiatan_id
            .where(eq(kegiatan_mitra.kegiatan_id, kegiatan_id))
            .all();

        if (!kegiatanMitraEntries.length) {
            return NextResponse.json({ message: "No entries found for this kegiatan_id" }, { status: 404 });
        }

        // Deduct honor from mitra_honor_monthly
        for (const entry of kegiatanMitraEntries) {
            const { sobat_id, total_honor, tanggal_berakhir } = entry;

            // Ensure sobat_id and tanggal_berakhir are not null before proceeding
            if (!sobat_id || !tanggal_berakhir) continue;

            // Extract month and year from tanggal_berakhir
            const { month, year } = extractMonthAndYear(tanggal_berakhir);

            await db
                .update(mitra_honor_monthly)
                .set({
                    total_honor: sql`${mitra_honor_monthly.total_honor} - ${total_honor}`,
                })
                .where(
                    and(
                        eq(mitra_honor_monthly.sobat_id, sobat_id),
                        eq(mitra_honor_monthly.month, month),
                        eq(mitra_honor_monthly.year, year)
                    )
                )
                .run();
        }

        return NextResponse.json({ message: "Honor mitra monthly updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating honor_mitra_monthly:", error);
        return NextResponse.json({ error: "An error occurred while updating honor_mitra_monthly" }, { status: 500 });
    }
}

// Utility function to extract month and year from a date string
function extractMonthAndYear(dateString: string | null): { month: number; year: number } {
    if (!dateString) {
        throw new Error("Invalid date string");
    }
    const date = new Date(dateString);
    return {
        month: date.getMonth() + 1, // Months are zero-based, add 1 for the correct month number
        year: date.getFullYear(),
    };
}
