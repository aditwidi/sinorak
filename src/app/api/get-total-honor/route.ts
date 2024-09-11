// src/app/api/get-total-honor/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Adjust the path based on your setup
import { mitra_honor_monthly } from "@/lib/db/schema"; // Adjust the path based on your setup
import { eq, and, sql } from "drizzle-orm"; // Import the required functions from drizzle-orm

// Named export for the GET method
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sobat_id = searchParams.get("sobat_id");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Ensure sobat_id is provided
    if (!sobat_id) {
        return NextResponse.json({ error: "Invalid query parameters: sobat_id is required" }, { status: 400 });
    }

    try {
        // Define base conditions with sobat_id
        const conditions = [eq(mitra_honor_monthly.sobat_id, sobat_id)];

        // Add month condition if month is provided
        if (month) {
            conditions.push(eq(mitra_honor_monthly.month, Number(month)));
        }

        // Add year condition if year is provided
        if (year) {
            conditions.push(eq(mitra_honor_monthly.year, Number(year)));
        }

        // Query to fetch the total sum of honor based on the provided conditions
        const result = await db
            .select({
                total_honor: sql`SUM(${mitra_honor_monthly.total_honor})`.as("total_honor"),
            })
            .from(mitra_honor_monthly)
            .where(and(...conditions))
            .execute();

        // If no data is found, result[0].total_honor will be null, so we default to 0
        const total_honor = result[0].total_honor ?? 0;

        return NextResponse.json({ total_honor }, { status: 200 });
    } catch (error) {
        console.error("Error fetching total honor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
