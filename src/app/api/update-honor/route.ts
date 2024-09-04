import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan_mitra } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { kegiatan_id, sobat_id, honor_satuan, target_volume_pekerjaan } = body;

        // Validasi input data
        if (!kegiatan_id || !sobat_id || typeof honor_satuan !== 'number' || typeof target_volume_pekerjaan !== 'number') {
            console.error('Validation Error: Missing or invalid fields', { kegiatan_id, sobat_id, honor_satuan, target_volume_pekerjaan });
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Konversi kegiatan_id ke tipe angka jika diperlukan
        const kegiatanIdNum = Number(kegiatan_id);
        if (isNaN(kegiatanIdNum)) {
            console.error('Validation Error: kegiatan_id must be a valid number');
            return NextResponse.json({ error: 'kegiatan_id must be a valid number' }, { status: 400 });
        }

        // Hitung total honor berdasarkan honor_satuan dan target_volume_pekerjaan
        const total_honor = honor_satuan * target_volume_pekerjaan;

        // Update kolom total_honor pada tabel kegiatan_mitra
        const result = await db
            .update(kegiatan_mitra)
            .set({ total_honor })
            .where(and(eq(kegiatan_mitra.kegiatan_id, kegiatanIdNum), eq(kegiatan_mitra.sobat_id, sobat_id)))
            .returning(); // Use `.returning()` to get the updated records

        // Check if the update affected any rows
        if (result.length === 0) { // Check the length of the result to see if any rows were updated
            console.error('Update failed: No records were updated', { kegiatan_id, sobat_id });
            return NextResponse.json({ error: 'Update failed: No records were updated' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Total honor updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating total honor:', error);
        return NextResponse.json({ error: 'An error occurred while updating total honor' }, { status: 500 });
    }
}
