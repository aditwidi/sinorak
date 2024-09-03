import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra_honor_monthly } from "@/lib/db/schema"; // Import your schema
import { sql, eq, and } from "drizzle-orm"; // Import the necessary functions from Drizzle ORM

export const revalidate = 0; // Revalidate every new data

export async function GET() {
    try {
        // Get the current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based, so add 1
        const currentYear = currentDate.getFullYear();

        // Calculate total honor for the current month and year
        const totalHonorResult = await db
            .select({
                total_honor: sql<number>`SUM(${mitra_honor_monthly.total_honor})`,
            })
            .from(mitra_honor_monthly)
            .where(
                and(
                    eq(mitra_honor_monthly.month, currentMonth),
                    eq(mitra_honor_monthly.year, currentYear)
                )
            )
            .get();

        const totalHonor = totalHonorResult?.total_honor ?? 0;

        // Return the total honor in the response
        const response = NextResponse.json(
            { totalHonor },
            { status: 200 }
        );

        // Apply server-side caching instructions for revalidation
        response.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");

        return response;
    } catch (error) {
        console.error("Error fetching total honor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
