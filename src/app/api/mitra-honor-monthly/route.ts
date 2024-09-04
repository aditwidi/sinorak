// /api/mitra-honor-monthly
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { mitra_honor_monthly } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mitra_entries, honor_satuan, tanggal_berakhir } = body;

        if (!isValidHonorRequest(body)) {
            return NextResponse.json(
                { error: 'Missing or invalid fields' },
                { status: 400 }
            );
        }

        const { month, year } = extractMonthAndYear(tanggal_berakhir);

        // Get all sobat_id to check for existing records
        const sobatIds = mitra_entries.map((entry: MitraEntry) => entry.sobat_id);

        // Fetch existing records for the specified month and year
        const existingHonors = await db
            .select()
            .from(mitra_honor_monthly)
            .where(
                and(
                    inArray(mitra_honor_monthly.sobat_id, sobatIds),
                    eq(mitra_honor_monthly.month, month),
                    eq(mitra_honor_monthly.year, year)
                )
            )
            .all();

        const existingMap = new Map<string, number>(
            existingHonors
                .filter((honor) => honor.sobat_id !== null)
                .map((honor) => [honor.sobat_id!, honor.total_honor])
        );

        // Prepare values for upsert
        const upserts = mitra_entries.map((entry: MitraEntry) => {
            const { sobat_id, target_volume_pekerjaan } = entry;
            const additional_honor = parseFloat(honor_satuan) * target_volume_pekerjaan;

            return {
                sobat_id,
                month,
                year,
                total_honor: additional_honor, // Only store the additional honor amount
            };
        });

        // Perform upsert operation: Insert new records or update existing ones
        await db
            .insert(mitra_honor_monthly)
            .values(upserts)
            .onConflictDoUpdate({
                target: [mitra_honor_monthly.sobat_id, mitra_honor_monthly.month, mitra_honor_monthly.year],
                set: {
                    total_honor: sql`${mitra_honor_monthly.total_honor} + EXCLUDED.total_honor`, // Correctly add only the new value
                },
            })
            .run();

        return NextResponse.json(
            { message: 'Mitra Honor Monthly updated successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error updating mitra_honor_monthly:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating mitra_honor_monthly' },
            { status: 500 }
        );
    }
}

function isValidHonorRequest(body: any): boolean {
    const requiredFields = ['mitra_entries', 'honor_satuan', 'tanggal_berakhir'];
    return requiredFields.every((field) => body[field]);
}

function extractMonthAndYear(dateString: string) {
    const endDate = new Date(dateString);
    return {
        month: endDate.getMonth() + 1,
        year: endDate.getFullYear(),
    };
}
