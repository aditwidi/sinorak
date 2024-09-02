import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { mitra_honor_monthly } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mitra_entries, honor_satuan, tanggal_berakhir } = body;

        if (!isValidHonorRequest(body)) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        const { month, year } = extractMonthAndYear(tanggal_berakhir);

        const sobatIds = mitra_entries.map((entry: MitraEntry) => entry.sobat_id);

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
                .filter(honor => honor.sobat_id !== null)
                .map(honor => [honor.sobat_id!, honor.total_honor])
        );

        const updates = [];
        const inserts = [];

        // Batch operations for mitra_honor_monthly
        for (const entry of mitra_entries) {
            const { sobat_id, target_volume_pekerjaan } = entry;
            const total_honor = parseFloat(honor_satuan) * target_volume_pekerjaan;

            if (existingMap.has(sobat_id)) {
                updates.push(
                    db
                        .update(mitra_honor_monthly)
                        .set({ total_honor: existingMap.get(sobat_id)! + total_honor })
                        .where(
                            and(
                                eq(mitra_honor_monthly.sobat_id, sobat_id),
                                eq(mitra_honor_monthly.month, month),
                                eq(mitra_honor_monthly.year, year)
                            )
                        )
                );
            } else {
                inserts.push({
                    sobat_id,
                    month,
                    year,
                    total_honor,
                });
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates.map(update => update.run()));
        }

        if (inserts.length > 0) {
            await db.insert(mitra_honor_monthly).values(inserts).run();
        }

        return NextResponse.json({ message: 'Mitra Honor Monthly updated successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error updating mitra_honor_monthly:', error);
        return NextResponse.json({ error: 'An error occurred while updating mitra_honor_monthly' }, { status: 500 });
    }
}

function isValidHonorRequest(body: any): boolean {
    const requiredFields = ['mitra_entries', 'honor_satuan', 'tanggal_berakhir'];
    return requiredFields.every(field => body[field]);
}

function extractMonthAndYear(dateString: string) {
    const endDate = new Date(dateString);
    return {
        month: endDate.getMonth() + 1,
        year: endDate.getFullYear(),
    };
}
