import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { sql } from "drizzle-orm"; // Import the `sql` helper from Drizzle ORM

export const revalidate = 0;

// Fetch unique months and years from mitra_honor_monthly table
export async function GET() {
    try {
        // Fetch unique months using raw SQL
        const monthsResult = await db
            .select({ month: sql<number>`DISTINCT month` })
            .from(sql`mitra_honor_monthly`)
            .where(sql`month IS NOT NULL`) // Ensure month is not null
            .all();

        // Fetch unique years using raw SQL
        const yearsResult = await db
            .select({ year: sql<number>`DISTINCT year` })
            .from(sql`mitra_honor_monthly`)
            .where(sql`year IS NOT NULL`) // Ensure year is not null
            .all();

        // Extract months and years from the results
        const months = monthsResult.map((row: { month: number }) => row.month);
        const years = yearsResult.map((row: { year: number }) => row.year);

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
