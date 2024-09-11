import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { mitra_honor_monthly, kegiatan_mitra, kegiatan } from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

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
                honor_satuan: kegiatan_mitra.honor_satuan,
                target_volume_pekerjaan: kegiatan_mitra.target_volume_pekerjaan,
                total_honor: kegiatan_mitra.total_honor,
                tanggal_berakhir: kegiatan.tanggal_berakhir,
            })
            .from(kegiatan_mitra)
            .innerJoin(kegiatan, eq(kegiatan_mitra.kegiatan_id, kegiatan.kegiatan_id))
            .where(eq(kegiatan_mitra.kegiatan_id, kegiatan_id))
            .all();

        if (!kegiatanMitraEntries.length) {
            return NextResponse.json({ message: "No entries found for this kegiatan_id" }, { status: 404 });
        }

        // Extract unique sobat_ids and the corresponding total_honor to be deducted
        const sobatIds = kegiatanMitraEntries
            .map(entry => entry.sobat_id)
            .filter((id): id is string => id !== null); // Ensure sobat_ids are not null

        const honorDeductions = kegiatanMitraEntries.reduce((acc, entry) => {
            if (!entry.sobat_id || !entry.tanggal_berakhir) return acc;

            const { month, year } = extractMonthAndYear(entry.tanggal_berakhir);
            const key = `${entry.sobat_id}-${month}-${year}`;
            const deduction = acc.get(key) || 0;
            acc.set(key, deduction + (entry.total_honor || 0)); // Ensure total_honor is a number
            return acc;
        }, new Map<string, number>());

        // Fetch existing records for the specified sobat_ids, months, and years
        const existingHonors = await db
            .select()
            .from(mitra_honor_monthly)
            .where(
                and(
                    inArray(mitra_honor_monthly.sobat_id, sobatIds),
                    inArray(
                        mitra_honor_monthly.month,
                        Array.from(honorDeductions.keys()).map(key => parseInt(key.split('-')[1]))
                    ),
                    inArray(
                        mitra_honor_monthly.year,
                        Array.from(honorDeductions.keys()).map(key => parseInt(key.split('-')[2]))
                    )
                )
            )
            .all();

        const updates = existingHonors.map(honor => {
            const key = `${honor.sobat_id}-${honor.month}-${honor.year}`;
            const deduction = honorDeductions.get(key);
            if (!deduction) return null;
            return {
                sobat_id: honor.sobat_id,
                month: honor.month,
                year: honor.year,
                total_honor: deduction, // Only the amount to be deducted
            };
        }).filter((update): update is NonNullable<typeof update> => update !== null); // Properly type-guard against null

        // Check if updates array is empty
        if (updates.length === 0) {
            return NextResponse.json({ message: "No updates required" }, { status: 200 });
        }

        // Perform upsert operation: Insert new records or update existing ones
        await db
            .insert(mitra_honor_monthly)
            .values(updates)
            .onConflictDoUpdate({
                target: [mitra_honor_monthly.sobat_id, mitra_honor_monthly.month, mitra_honor_monthly.year],
                set: {
                    total_honor: sql`${mitra_honor_monthly.total_honor} - EXCLUDED.total_honor`,
                },
            })
            .run();

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
        month: date.getMonth() + 1,
        year: date.getFullYear(),
    };
}
