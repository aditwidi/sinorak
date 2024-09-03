// /pages/api/kegiatan-dates.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { kegiatan } from "@/lib/db/schema"; // Import your schema
import { sql } from "drizzle-orm"; // Import the `sql` helper from Drizzle ORM

export const revalidate = 0;

export async function GET() {
    try {
        // Fetch distinct months from the kegiatan table
        const monthsResult = await db
            .select({ month: kegiatan.month })
            .from(kegiatan)
            .where(sql`${kegiatan.month} IS NOT NULL`) // Correctly using column reference
            .groupBy(kegiatan.month)
            .all();

        // Fetch distinct years from the kegiatan table
        const yearsResult = await db
            .select({ year: kegiatan.year })
            .from(kegiatan)
            .where(sql`${kegiatan.year} IS NOT NULL`) // Correctly using column reference
            .groupBy(kegiatan.year)
            .all();

        // Extract months and years from the results
        const months = monthsResult.map((row) => row.month);
        const years = yearsResult.map((row) => row.year);

        const response = NextResponse.json({ months, years }, { status: 200 });

        // Apply server-side caching instructions for revalidation
        response.headers.set(
            "Cache-Control",
            "no-cache, no-store, max-age=0, must-revalidate"
        );

        return response;
    } catch (error) {
        console.error("Error fetching unique months and years:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
