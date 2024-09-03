// src/app/api/get-total-honor/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Adjust the path based on your setup
import { mitra_honor_monthly } from "@/lib/db/schema"; // Adjust the path based on your setup
import { eq, and } from "drizzle-orm"; // Import the required functions from drizzle-orm

// Named export for the GET method
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sobat_id = searchParams.get("sobat_id");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!sobat_id || !month || !year) {
        return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    try {
        // Query to fetch the total honor for the specified sobat_id, month, and year
        const result = await db
            .select({
                total_honor: mitra_honor_monthly.total_honor,
            })
            .from(mitra_honor_monthly)
            .where(
                and(
                    eq(mitra_honor_monthly.sobat_id, sobat_id),
                    eq(mitra_honor_monthly.month, Number(month)),
                    eq(mitra_honor_monthly.year, Number(year))
                )
            )
            .execute();

        // If no data is found, return a default total honor of 0
        const total_honor = result.length > 0 ? result[0].total_honor : 0;

        return NextResponse.json({ total_honor }, { status: 200 });
    } catch (error) {
        console.error("Error fetching total honor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
