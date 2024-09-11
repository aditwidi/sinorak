import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan_mitra } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
    total_honor: number;
    jenis_petugas?: "Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan";
    status_mitra?: "PPL" | "PML" | "Operator" | "Supervisor";
    is_new?: boolean; // Flag to determine if this is a new entry
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        let { kegiatan_id, mitra_entries, honor_satuan } = body;

        // Convert kegiatan_id to a number
        kegiatan_id = Number(kegiatan_id);

        // Validate input fields
        if (
            isNaN(kegiatan_id) ||
            !Array.isArray(mitra_entries) ||
            typeof honor_satuan !== 'number'
        ) {
            console.error('Validation Error: Missing or invalid fields', {
                kegiatan_id,
                mitra_entries,
                honor_satuan,
            });
            return NextResponse.json(
                { error: 'Missing or invalid fields' },
                { status: 400 }
            );
        }

        // Improved validation for each mitra entry
        const invalidEntries = mitra_entries.filter(
            (entry) =>
                !entry.sobat_id || // Must have a valid sobat_id
                typeof entry.target_volume_pekerjaan !== 'number' || // Must be a number
                (typeof entry.total_honor !== 'number' || isNaN(entry.total_honor)) || // Must be a number and not NaN
                (entry.status_mitra && !["PPL", "PML", "Operator", "Supervisor"].includes(entry.status_mitra)) // If status_mitra exists, must be valid
        );

        // Check if there are any invalid entries
        if (invalidEntries.length > 0) {
            console.error('Validation Error: Invalid mitra entry data', invalidEntries);
            return NextResponse.json(
                { error: 'Invalid mitra entry data', details: invalidEntries },
                { status: 400 }
            );
        }

        // Separate new entries from existing ones
        const newEntries = mitra_entries.filter((entry) => entry.is_new);
        const existingEntries = mitra_entries.filter((entry) => !entry.is_new);

        // Create an array of SQL operations for updating existing entries
        const batchUpdates = existingEntries.map((entry) =>
            db
                .update(kegiatan_mitra)
                .set({
                    honor_satuan,
                    target_volume_pekerjaan: entry.target_volume_pekerjaan,
                    total_honor: entry.total_honor,
                    status_mitra: entry.status_mitra,
                })
                .where(
                    and(
                        eq(kegiatan_mitra.kegiatan_id, kegiatan_id),
                        eq(kegiatan_mitra.sobat_id, entry.sobat_id)
                    )
                )
        );

        // Execute the batch update operation
        if (batchUpdates.length > 0) {
            await db.batch(batchUpdates as [typeof batchUpdates[number]]);
        }

        // Calculate total honor for new entries
        const newInserts = newEntries.map((entry) => {
            const calculatedTotalHonor = honor_satuan * entry.target_volume_pekerjaan; // Calculate total_honor
            return db.insert(kegiatan_mitra).values({
                kegiatan_id,
                sobat_id: entry.sobat_id,
                honor_satuan,
                target_volume_pekerjaan: entry.target_volume_pekerjaan,
                total_honor: calculatedTotalHonor, // Use the calculated total_honor
                status_mitra: entry.status_mitra,
            });
        });

        // Execute the batch insert operation
        if (newInserts.length > 0) {
            await db.batch(newInserts as [typeof newInserts[number]]);
        }

        return NextResponse.json(
            { message: 'Kegiatan mitra updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating kegiatan mitra:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating kegiatan mitra' },
            { status: 500 }
        );
    }
}
