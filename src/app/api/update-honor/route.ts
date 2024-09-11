import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan_mitra } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { kegiatan_id, sobat_id, honor_satuan, target_volume_pekerjaan, status_mitra } = body;

        // Validate input data
        if (!kegiatan_id || !sobat_id || typeof honor_satuan !== 'number' || typeof target_volume_pekerjaan !== 'number') {
            console.error('Validation Error: Missing or invalid fields', { kegiatan_id, sobat_id, honor_satuan, target_volume_pekerjaan });
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Convert kegiatan_id to a number if needed
        const kegiatanIdNum = Number(kegiatan_id);
        if (isNaN(kegiatanIdNum)) {
            console.error('Validation Error: kegiatan_id must be a valid number');
            return NextResponse.json({ error: 'kegiatan_id must be a valid number' }, { status: 400 });
        }

        // Calculate total honor based on honor_satuan and target_volume_pekerjaan
        const total_honor = honor_satuan * target_volume_pekerjaan;

        // Check if the record already exists
        const existingRecord = await db
            .select()
            .from(kegiatan_mitra)
            .where(and(eq(kegiatan_mitra.kegiatan_id, kegiatanIdNum), eq(kegiatan_mitra.sobat_id, sobat_id)))
            .all();

        if (existingRecord.length > 0) {
            // Update the existing record's total_honor
            const result = await db
                .update(kegiatan_mitra)
                .set({ total_honor })
                .where(and(eq(kegiatan_mitra.kegiatan_id, kegiatanIdNum), eq(kegiatan_mitra.sobat_id, sobat_id)))
                .returning();

            // Check if the update affected any rows
            if (result.length === 0) {
                console.error('Update failed: No records were updated', { kegiatan_id, sobat_id });
                return NextResponse.json({ error: 'Update failed: No records were updated' }, { status: 404 });
            }

            return NextResponse.json({ message: 'Total honor updated successfully' }, { status: 200 });
        } else {
            // Insert a new record for Mitra Pengganti
            const newRecord = await db
                .insert(kegiatan_mitra)
                .values({
                    kegiatan_id: kegiatanIdNum,
                    sobat_id,
                    honor_satuan,
                    target_volume_pekerjaan,
                    total_honor,
                    status_mitra: status_mitra || null, // Provide a default or optional value for status_mitra
                })
                .returning();

            if (newRecord.length === 0) {
                console.error('Insert failed: No records were inserted', { kegiatan_id, sobat_id });
                return NextResponse.json({ error: 'Insert failed: No records were inserted' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Total honor added successfully for Mitra Pengganti' }, { status: 200 });
        }
    } catch (error) {
        console.error('Error updating or adding total honor:', error);
        return NextResponse.json({ error: 'An error occurred while updating or adding total honor' }, { status: 500 });
    }
}
