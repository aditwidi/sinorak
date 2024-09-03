// /api/get-mitra-honor.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra_honor_monthly } from "@/lib/db/schema"; // Import your schema
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const sobatId = searchParams.get("sobat_id");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!sobatId || !month || !year) {
        return NextResponse.json(
            { error: "Missing required query parameters: sobat_id, month, and year." },
            { status: 400 }
        );
    }

    try {
        // Fetch the total honor for the specified mitra, month, and year
        const honorData = await db
            .select({
                total_honor: mitra_honor_monthly.total_honor,
            })
            .from(mitra_honor_monthly)
            .where(
                and(
                    eq(mitra_honor_monthly.sobat_id, sobatId),
                    eq(mitra_honor_monthly.month, parseInt(month, 10)),
                    eq(mitra_honor_monthly.year, parseInt(year, 10))
                )
            )
            .get();

        if (!honorData) {
            return NextResponse.json(
                { total_honor: 0 }, // Return 0 if no data is found
                { status: 200 }
            );
        }

        return NextResponse.json(
            { total_honor: honorData.total_honor },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching mitra honor data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
