import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan_mitra } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
    total_honor?: number; // Optional since it's calculated
    jenis_petugas?: "Pendataan" | "Pemeriksaan" | "Pengolahan";
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        let { kegiatan_id, mitra_entries, honor_satuan } = body;

        // Convert kegiatan_id to a number
        kegiatan_id = Number(kegiatan_id);

        // Improved validation with detailed logging
        if (isNaN(kegiatan_id) || !Array.isArray(mitra_entries) || typeof honor_satuan !== 'number') {
            console.error('Validation Error: Missing or invalid fields', { kegiatan_id, mitra_entries, honor_satuan });
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Validate and update each mitra entry
        for (const entry of mitra_entries) {
            const { sobat_id, target_volume_pekerjaan } = entry;

            if (!sobat_id || typeof target_volume_pekerjaan !== 'number') {
                console.error('Validation Error: Invalid mitra entry data', { entry });
                return NextResponse.json({ error: 'Invalid mitra entry data' }, { status: 400 });
            }

            // Calculate the total honor
            const calculatedTotalHonor = honor_satuan * target_volume_pekerjaan;

            // Update the mitra entries in the kegiatan_mitra table
            await db
                .update(kegiatan_mitra)
                .set({
                    honor_satuan,
                    target_volume_pekerjaan,
                    total_honor: calculatedTotalHonor, // Recalculate and update total_honor
                })
                .where(
                    and(eq(kegiatan_mitra.kegiatan_id, kegiatan_id), eq(kegiatan_mitra.sobat_id, sobat_id))
                )
                .run();
        }

        return NextResponse.json({ message: 'Kegiatan mitra updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating kegiatan mitra:', error);
        return NextResponse.json({ error: 'An error occurred while updating kegiatan mitra' }, { status: 500 });
    }
}
