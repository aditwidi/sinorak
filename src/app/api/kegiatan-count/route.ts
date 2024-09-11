// /app/api/kegiatan-count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db'; // Adjust the import path as needed
import { eq, and } from 'drizzle-orm';
import { kegiatan } from '@/lib/db/schema';

export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        // Get the current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
        const currentYear = currentDate.getFullYear();

        // Fetch kegiatan data from the database
        const kegiatanData = await db
            .select()
            .from(kegiatan)
            .where(
                and(
                    eq(kegiatan.month, currentMonth),
                    eq(kegiatan.year, currentYear)
                )
            )
            .all();

        // Count kegiatan by jenis_kegiatan
        const lapanganCount = kegiatanData.filter(k => k.jenis_kegiatan === 'Lapangan').length;
        const pengolahanCount = kegiatanData.filter(k => k.jenis_kegiatan === 'Pengolahan').length;

        // Prepare response data
        const response = {
            lapanganCount,
            pengolahanCount,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Error fetching kegiatan counts:', error);
        return NextResponse.json({ error: 'Failed to fetch kegiatan counts' }, { status: 500 });
    }
}
