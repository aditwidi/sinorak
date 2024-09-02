import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan, kegiatan_mitra, mitra_honor_monthly, users, mitra } from '@/lib/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';

// Define TypeScript interface for mitra entry
interface MitraEntry {
    sobat_id: string;
    target_volume_pekerjaan: number;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let {
            nama_kegiatan, kode, jenis_kegiatan, tanggal_mulai,
            tanggal_berakhir, penanggung_jawab, satuan_honor,
            mitra_entries, honor_satuan,
        } = body;

        if (!nama_kegiatan || !kode || !jenis_kegiatan || !tanggal_mulai || !tanggal_berakhir || !penanggung_jawab || !satuan_honor || !mitra_entries || !honor_satuan) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch penanggung_jawab ID
        const userResult = await db.select({ id: users.id }).from(users).where(eq(users.name, penanggung_jawab)).all();
        if (userResult.length === 0) {
            return NextResponse.json({ error: 'Penanggung jawab does not exist' }, { status: 400 });
        }
        penanggung_jawab = userResult[0].id;

        const endDate = new Date(tanggal_berakhir);
        const month = endDate.getMonth() + 1;
        const year = endDate.getFullYear();

        // Remove explicit transaction handling from your migration logic
        const kegiatanResult = await db.insert(kegiatan).values({
            nama_kegiatan, kode, jenis_kegiatan, tanggal_mulai,
            tanggal_berakhir, penanggung_jawab, satuan_honor, month, year,
        }).returning({ kegiatan_id: kegiatan.kegiatan_id });

        const kegiatan_id = kegiatanResult[0]?.kegiatan_id;
        if (!kegiatan_id) {
            throw new Error('Failed to insert kegiatan');
        }

        // Batch insert all kegiatan_mitra entries
        const kegiatanMitraValues = mitra_entries.map((entry: MitraEntry) => ({
            kegiatan_id,
            sobat_id: entry.sobat_id,
            honor_satuan: parseFloat(honor_satuan),
            target_volume_pekerjaan: entry.target_volume_pekerjaan,
            total_honor: parseFloat(honor_satuan) * entry.target_volume_pekerjaan,
        }));
        await db.insert(kegiatan_mitra).values(kegiatanMitraValues).run();

        // Fetch all existing entries for mitra_honor_monthly in a single query
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

        // Ensure all keys are non-null
        const existingMap = new Map<string, number>(
            existingHonors
                .filter(honor => honor.sobat_id !== null) // Filter out null values
                .map(honor => [honor.sobat_id!, honor.total_honor]) // Use non-null assertion `!`
        );

        const updates = [];
        const inserts = [];

        // Batch operations for mitra_honor_monthly
        for (const entry of mitra_entries) {
            const { sobat_id, target_volume_pekerjaan } = entry;
            const total_honor = parseFloat(honor_satuan) * target_volume_pekerjaan;

            if (existingMap.has(sobat_id)) {
                // Prepare update statement
                updates.push(
                    db
                        .update(mitra_honor_monthly)
                        .set({ total_honor: existingMap.get(sobat_id)! + total_honor }) // Increment total_honor
                        .where(
                            and(
                                eq(mitra_honor_monthly.sobat_id, sobat_id),
                                eq(mitra_honor_monthly.month, month),
                                eq(mitra_honor_monthly.year, year)
                            )
                        )
                );
            } else {
                // Prepare data for new insert
                inserts.push({
                    sobat_id,
                    month,
                    year,
                    total_honor,
                });
            }
        }

        // Batch execute all updates
        if (updates.length > 0) {
            await Promise.all(updates.map(update => update.run()));
        }

        // Batch insert all new entries
        if (inserts.length > 0) {
            await db.insert(mitra_honor_monthly).values(inserts).run();
        }

        return NextResponse.json({ message: 'Kegiatan berhasil ditambahkan' }, { status: 201 });
    } catch (error) {
        console.error('Error adding kegiatan:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan saat menambahkan kegiatan' }, { status: 500 });
    }
}
