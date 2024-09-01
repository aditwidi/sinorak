// /app/api/mitra-dates/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra_honor_monthly } from "@/lib/db/schema"; // Import your schema
import { sql } from "drizzle-orm";

// Fetch unique months and years from mitra_honor_monthly table
export async function GET() {
    try {
        // Fetch unique months and years using raw SQL
        const distinctDatesResult = await db
            .select({
                month: sql<number>`DISTINCT ${mitra_honor_monthly.month}`,
                year: sql<number>`DISTINCT ${mitra_honor_monthly.year}`
            })
            .from(mitra_honor_monthly)
            .all();

        // Extract months and years from the results
        const months = Array.from(new Set(distinctDatesResult.map((row) => row.month)));
        const years = Array.from(new Set(distinctDatesResult.map((row) => row.year)));

        const response = NextResponse.json(
            { months, years },
            { status: 200 }
        );

        // Apply server-side caching instructions for revalidation
        response.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");

        return response;
    } catch (error) {
        console.error("Error fetching unique months and years:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
