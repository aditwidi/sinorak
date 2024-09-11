// src/app/api/kegiatan/[kegiatan_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { kegiatan_id: string } }) {
    const { kegiatan_id } = params;

    if (!kegiatan_id) {
        return NextResponse.json({ error: 'Missing kegiatan_id' }, { status: 400 });
    }

    try {
        // Fetch the specific kegiatan by ID
        const kegiatanData = await db
            .select({
                kegiatan_id: kegiatan.kegiatan_id,
                nama_kegiatan: kegiatan.nama_kegiatan,
                kode: kegiatan.kode,
                jenis_kegiatan: kegiatan.jenis_kegiatan,
                tanggal_mulai: kegiatan.tanggal_mulai,
                tanggal_berakhir: kegiatan.tanggal_berakhir,
                penanggung_jawab: users.name, // Join with users table to get the name
                satuan_honor: kegiatan.satuan_honor,
                month: kegiatan.month,
                year: kegiatan.year,
            })
            .from(kegiatan)
            .leftJoin(users, eq(kegiatan.penanggung_jawab, users.id))
            .where(eq(kegiatan.kegiatan_id, parseInt(kegiatan_id, 10)))
            .all();

        if (kegiatanData.length === 0) {
            return NextResponse.json({ error: 'Kegiatan not found' }, { status: 404 });
        }

        return NextResponse.json({ kegiatan: kegiatanData[0] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching kegiatan:', error);
        return NextResponse.json({ error: 'An error occurred while fetching kegiatan' }, { status: 500 });
    }
}
