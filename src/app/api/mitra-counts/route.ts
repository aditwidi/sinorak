import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra } from "@/lib/db/schema"; // Import your schema
import { sql } from "drizzle-orm"; // Import the `sql` helper from Drizzle ORM

export async function GET() {
    try {
        // Fetch counts using SQL functions directly
        const pendataanCountResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(mitra)
            .where(sql`jenis_petugas = 'Pendataan'`)
            .get();

        const pemeriksaanCountResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(mitra)
            .where(sql`jenis_petugas = 'Pemeriksaan'`)
            .get();

        const pengolahanCountResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(mitra)
            .where(sql`jenis_petugas = 'Pengolahan'`)
            .get();

        // Extract count values from query results
        const pendataanCount = pendataanCountResult?.count ?? 0;
        const pemeriksaanCount = pemeriksaanCountResult?.count ?? 0;
        const pengolahanCount = pengolahanCountResult?.count ?? 0;

        const response = NextResponse.json(
            {
                pendataanCount,
                pemeriksaanCount,
                pengolahanCount,
            },
            { status: 200 }
        );

        // Apply server-side caching instructions for revalidation
        response.headers.set("Cache-Control", "no-store, max-age=0");

        return response;
    } catch (error) {
        console.error("Error fetching mitra counts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
