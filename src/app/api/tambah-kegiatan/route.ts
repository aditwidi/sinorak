// src/app/api/tambah-kegiatan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db'; // Import your database connection
import { kegiatan, kegiatan_mitra, mitra_honor_monthly, users, mitra } from '@/lib/db/schema'; // Import your schema
import { eq, and } from 'drizzle-orm'; // Import necessary operators for querying

// Run pending migrations function
async function runPendingMigrations() {
    try {
        console.log("Running pending migrations...");
        // Replace with your migration running logic
        // Example: await db.runMigrations();
        console.log("Migrations completed.");
    } catch (migrationError) {
        console.error("Error running migrations:", migrationError);
        throw new Error("Migration error");
    }
}

export async function POST(req: NextRequest) {
    try {
        // Run pending migrations if any
        await runPendingMigrations();

        // Parse and log the incoming request body
        const body = await req.json();
        console.log("Incoming request body:", body);

        let {
            nama_kegiatan,
            kode,
            jenis_kegiatan,
            tanggal_mulai,
            tanggal_berakhir,
            penanggung_jawab,
            satuan_honor,
            mitra_entries,
            honor_satuan,
        } = body; // Destructure the JSON body from the request

        // Validate required fields
        if (!nama_kegiatan || !kode || !jenis_kegiatan || !tanggal_mulai || !tanggal_berakhir || !penanggung_jawab || !satuan_honor || !mitra_entries || !honor_satuan) {
            console.error('Missing required fields:', {
                nama_kegiatan,
                kode,
                jenis_kegiatan,
                tanggal_mulai,
                tanggal_berakhir,
                penanggung_jawab,
                satuan_honor,
                mitra_entries,
                honor_satuan,
            });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If penanggung_jawab is a name, fetch the user ID from the database
        console.log('Checking if penanggung_jawab is an ID or name:', penanggung_jawab);
        const userResult = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.name, penanggung_jawab))
            .all();

        if (userResult.length === 0) {
            console.error('Penanggung jawab (user) with the name does not exist:', penanggung_jawab);
            return NextResponse.json({ error: 'Penanggung jawab does not exist' }, { status: 400 });
        }

        // Use the fetched ID
        penanggung_jawab = userResult[0].id;
        console.log('Fetched user ID for penanggung_jawab:', penanggung_jawab);

        // Extract month and year from 'tanggal_berakhir'
        const endDate = new Date(tanggal_berakhir);
        const month = endDate.getMonth() + 1; // JS months are 0-based
        const year = endDate.getFullYear();

        // Log extracted month and year
        console.log('Extracted month and year:', { month, year });

        // Create a new 'kegiatan' entry and retrieve the inserted ID
        console.log('Inserting new kegiatan entry...');
        const kegiatanResult = await db
            .insert(kegiatan)
            .values({
                nama_kegiatan,
                kode,
                jenis_kegiatan,
                tanggal_mulai,
                tanggal_berakhir,
                penanggung_jawab,
                satuan_honor,
                month,
                year,
            })
            .returning({ kegiatan_id: kegiatan.kegiatan_id }); // Correctly specify the column for returning

        const kegiatan_id = kegiatanResult[0]?.kegiatan_id; // Get the ID of the newly inserted 'kegiatan'

        if (!kegiatan_id) {
            console.error('Failed to insert kegiatan');
            return NextResponse.json({ error: 'Failed to insert kegiatan' }, { status: 500 });
        }
        console.log('Inserted kegiatan with ID:', kegiatan_id);

        // Insert related 'kegiatan_mitra' entries and update 'mitra_honor_monthly' sequentially
        for (const entry of mitra_entries) {
            const { sobat_id, target_volume_pekerjaan } = entry;

            // Validate that the sobat_id (mitra) exists
            console.log('Checking if mitra exists for sobat_id:', sobat_id);
            const mitraExists = await db
                .select()
                .from(mitra)
                .where(eq(mitra.sobat_id, sobat_id))
                .all();

            if (mitraExists.length === 0) {
                console.error(`Mitra with sobat_id ${sobat_id} does not exist`);
                throw new Error(`Mitra with sobat_id ${sobat_id} does not exist`);
            }

            // Calculate total_honor for the current mitra
            const total_honor = parseFloat(honor_satuan) * parseInt(target_volume_pekerjaan, 10);
            console.log('Calculated total_honor:', total_honor);

            // Insert the new 'kegiatan_mitra' entry
            console.log('Inserting new kegiatan_mitra entry...');
            await db
                .insert(kegiatan_mitra)
                .values({
                    kegiatan_id,
                    sobat_id,
                    honor_satuan: parseFloat(honor_satuan),
                    target_volume_pekerjaan: parseInt(target_volume_pekerjaan, 10),
                    total_honor,
                })
                .run();

            // Check if there is already an entry in 'mitra_honor_monthly' for the sobat_id, month, and year
            console.log('Checking existing mitra_honor_monthly entries...');
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
                .all(); // Use all() to get an array of results

            if (existingMitraHonor.length > 0) {
                console.log('Updating existing mitra_honor_monthly entry...');
                // If exists, update the total_honor
                await db
                    .update(mitra_honor_monthly)
                    .set({
                        total_honor: existingMitraHonor[0].total_honor + total_honor, // Add new honor to the existing one
                    })
                    .where(
                        and(
                            eq(mitra_honor_monthly.sobat_id, sobat_id),
                            eq(mitra_honor_monthly.month, month),
                            eq(mitra_honor_monthly.year, year)
                        )
                    )
                    .run();
            } else {
                console.log('Inserting new mitra_honor_monthly entry...');
                // If not exists, insert a new record
                await db
                    .insert(mitra_honor_monthly)
                    .values({
                        sobat_id,
                        month,
                        year,
                        total_honor,
                    })
                    .run();
            }
        }

        // If everything is successful, return a success response
        console.log('All operations completed successfully.');
        return NextResponse.json({ message: 'Kegiatan berhasil ditambahkan' }, { status: 201 });
    } catch (error) {
        console.error('Error adding kegiatan:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan saat menambahkan kegiatan' }, { status: 500 });
    }
}
