import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan, kegiatan_mitra, mitra_honor_monthly, users, mitra } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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

        const userResult = await db.select({ id: users.id }).from(users).where(eq(users.name, penanggung_jawab)).all();
        if (userResult.length === 0) {
            return NextResponse.json({ error: 'Penanggung jawab does not exist' }, { status: 400 });
        }
        penanggung_jawab = userResult[0].id;

        const endDate = new Date(tanggal_berakhir);
        const month = endDate.getMonth() + 1;
        const year = endDate.getFullYear();

        const kegiatanResult = await db.insert(kegiatan).values({
            nama_kegiatan, kode, jenis_kegiatan, tanggal_mulai,
            tanggal_berakhir, penanggung_jawab, satuan_honor, month, year,
        }).returning({ kegiatan_id: kegiatan.kegiatan_id });

        const kegiatan_id = kegiatanResult[0]?.kegiatan_id;
        if (!kegiatan_id) {
            return NextResponse.json({ error: 'Failed to insert kegiatan' }, { status: 500 });
        }

        // Batch insert all kegiatan_mitra entries with correct typing
        const kegiatanMitraValues = mitra_entries.map((entry: MitraEntry) => {
            const { sobat_id, target_volume_pekerjaan } = entry;
            const total_honor = parseFloat(honor_satuan) * target_volume_pekerjaan;
            return {
                kegiatan_id, sobat_id, honor_satuan: parseFloat(honor_satuan),
                target_volume_pekerjaan, total_honor,
            };
        });

        await db.insert(kegiatan_mitra).values(kegiatanMitraValues).run();

        // Prepare batch operations for mitra_honor_monthly
        const updates = []; // To store update queries
        const inserts = []; // To store insert data

        for (const entry of mitra_entries) {
            const { sobat_id, target_volume_pekerjaan } = entry;
            const total_honor = parseFloat(honor_satuan) * target_volume_pekerjaan;

            // Check if there is already an entry for the given sobat_id, month, and year
            const existingMitraHonor = await db
                .select()
                .from(mitra_honor_monthly)
                .where(
                    and(
                        eq(mitra_honor_monthly.sobat_id, sobat_id),
                        eq(mitra_honor_monthly.month, month),
                        eq(mitra_honor_monthly.year, year)
                    )
                )
                .all();

            if (existingMitraHonor.length > 0) {
                // Prepare update statement for the existing entry
                updates.push(
                    db
                        .update(mitra_honor_monthly)
                        .set({ total_honor: existingMitraHonor[0].total_honor + total_honor }) // Increment total_honor
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
            for (const update of updates) {
                await update.run();
            }
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
