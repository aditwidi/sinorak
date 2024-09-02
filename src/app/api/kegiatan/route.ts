// src/app/api/kegiatan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            nama_kegiatan, kode, jenis_kegiatan, tanggal_mulai,
            tanggal_berakhir, penanggung_jawab, satuan_honor,
        } = body;

        if (!isValidKegiatanRequest(body)) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        // Fetch penanggung_jawab ID
        const userResult = await db.select({ id: users.id }).from(users).where(eq(users.name, penanggung_jawab)).all();
        if (userResult.length === 0) {
            return NextResponse.json({ error: 'Penanggung jawab does not exist' }, { status: 400 });
        }
        const userId = userResult[0].id;

        const { month, year } = extractMonthAndYear(tanggal_berakhir);

        // Insert into kegiatan table
        const kegiatanResult = await db.insert(kegiatan).values({
            nama_kegiatan, kode, jenis_kegiatan, tanggal_mulai,
            tanggal_berakhir, penanggung_jawab: userId, satuan_honor, month, year,
        }).returning({ kegiatan_id: kegiatan.kegiatan_id });

        const kegiatan_id = kegiatanResult[0]?.kegiatan_id;
        if (!kegiatan_id) {
            throw new Error('Failed to insert kegiatan');
        }

        return NextResponse.json({ kegiatan_id, message: 'Kegiatan successfully created' }, { status: 201 });
    } catch (error) {
        console.error('Error creating kegiatan:', error);
        return NextResponse.json({ error: 'An error occurred while creating kegiatan' }, { status: 500 });
    }
}

function isValidKegiatanRequest(body: any): boolean {
    const requiredFields = ['nama_kegiatan', 'kode', 'jenis_kegiatan', 'tanggal_mulai', 'tanggal_berakhir', 'penanggung_jawab', 'satuan_honor'];
    return requiredFields.every(field => body[field]);
}

function extractMonthAndYear(dateString: string) {
    const endDate = new Date(dateString);
    return {
        month: endDate.getMonth() + 1,
        year: endDate.getFullYear(),
    };
}
