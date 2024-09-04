// src/app/api/update-kegiatan-mitra/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan_mitra } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
    total_honor: number;
    jenis_petugas?: "Pendataan" | "Pemeriksaan" | "Pengolahan";
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        let { kegiatan_id, mitra_entries, honor_satuan } = body;

        // Convert kegiatan_id to a number
        kegiatan_id = Number(kegiatan_id);

        // Validate input fields
        if (isNaN(kegiatan_id) || !Array.isArray(mitra_entries) || typeof honor_satuan !== 'number') {
            console.error('Validation Error: Missing or invalid fields', { kegiatan_id, mitra_entries, honor_satuan });
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Validate each mitra entry
        if (!mitra_entries.every(entry => entry.sobat_id && typeof entry.target_volume_pekerjaan === 'number' && typeof entry.total_honor === 'number')) {
            console.error('Validation Error: Invalid mitra entry data');
            return NextResponse.json({ error: 'Invalid mitra entry data' }, { status: 400 });
        }

        // Create an array of SQL operations for batch execution
        const batchUpdates = mitra_entries.map(entry => 
            db.update(kegiatan_mitra)
                .set({
                    honor_satuan,
                    target_volume_pekerjaan: entry.target_volume_pekerjaan,
                    total_honor: entry.total_honor
                })
                .where(
                    and(
                        eq(kegiatan_mitra.kegiatan_id, kegiatan_id), 
                        eq(kegiatan_mitra.sobat_id, entry.sobat_id)
                    )
                )
        );

        // Execute the batch operation using the correct method
        await db.batch(batchUpdates as [typeof batchUpdates[number]]);

        return NextResponse.json({ message: 'Kegiatan mitra updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating kegiatan mitra:', error);
        return NextResponse.json({ error: 'An error occurred while updating kegiatan mitra' }, { status: 500 });
    }
}
