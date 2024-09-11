// src/app/api/kegiatan-mitra/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan_mitra } from '@/lib/db/schema';

interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
    status_mitra: "PPL" | "PML" | "Operator" | "Supervisor"; // Include status_mitra in the interface
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { kegiatan_id, mitra_entries, honor_satuan } = body;

        if (!kegiatan_id || !mitra_entries || !honor_satuan) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Prepare data for kegiatan_mitra table
        const kegiatanMitraValues = mitra_entries.map((entry: MitraEntry) => ({
            kegiatan_id,
            sobat_id: entry.sobat_id,
            honor_satuan: parseFloat(honor_satuan),
            target_volume_pekerjaan: entry.target_volume_pekerjaan,
            total_honor: parseFloat(honor_satuan) * entry.target_volume_pekerjaan,
            status_mitra: entry.status_mitra, // Include status_mitra field
        }));

        // Insert into kegiatan_mitra table
        await db.insert(kegiatan_mitra).values(kegiatanMitraValues).run();

        return NextResponse.json({ message: 'Mitra entries successfully added to kegiatan' }, { status: 201 });
    } catch (error) {
        console.error('Error adding mitra to kegiatan:', error);
        return NextResponse.json({ error: 'An error occurred while adding mitra to kegiatan' }, { status: 500 });
    }
}
