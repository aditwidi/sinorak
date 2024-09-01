// app/api/mitra-data/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra, mitra_honor_monthly } from "@/lib/db/schema"; // Import your schema
import { eq, sql, and, like, isNull, or } from "drizzle-orm";

// Set revalidation to happen every time new data is fetched
export const revalidate = 0; // Revalidate every new data

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const searchTerm = searchParams.get("searchTerm") || "";
    const filterMonth = searchParams.get("filterMonth") || "";
    const filterYear = searchParams.get("filterYear") || "";
    const filterJenisPetugas = searchParams.get("filterJenisPetugas") as "Pendataan" | "Pemeriksaan" | "Pengolahan" | "" || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Build dynamic filter conditions
    const filters = [];
    if (searchTerm) filters.push(like(mitra.nama, `%${searchTerm}%`));
    if (filterJenisPetugas) filters.push(eq(mitra.jenis_petugas, filterJenisPetugas as "Pendataan" | "Pemeriksaan" | "Pengolahan"));

    // We adjust month and year filters to handle cases where `mitra_honor_monthly` has no entries
    if (filterMonth) {
        filters.push(or(isNull(mitra_honor_monthly.month), eq(sql`CAST(strftime('%m', ${mitra_honor_monthly.month}) AS TEXT)`, filterMonth)));
    }
    if (filterYear) {
        filters.push(or(isNull(mitra_honor_monthly.year), eq(sql`CAST(strftime('%Y', ${mitra_honor_monthly.year}) AS TEXT)`, filterYear)));
    }

    try {
        // Fetch filtered mitra data with pagination
        const mitraData = await db
            .select({
                sobat_id: mitra.sobat_id,
                nama: mitra.nama,
                jenis_petugas: mitra.jenis_petugas,
                honor_bulanan: sql<number | null>`COALESCE(${mitra_honor_monthly.total_honor}, 0)`.as("honor_bulanan"), // Use COALESCE to handle nulls
            })
            .from(mitra)
            .leftJoin(mitra_honor_monthly, eq(mitra.sobat_id, mitra_honor_monthly.sobat_id))
            .where(and(...filters))
            .limit(pageSize)
            .offset(offset)
            .all();

        // Fetch total count for pagination
        const totalCountResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(mitra)
            .leftJoin(mitra_honor_monthly, eq(mitra.sobat_id, mitra_honor_monthly.sobat_id))
            .where(and(...filters))
            .get();

        const totalCount = totalCountResult?.count || 0; // Ensure totalCountResult is defined

        // Create response with revalidation headers
        const response = NextResponse.json(
            { mitraData, totalCount },
            { status: 200 }
        );

        // Apply server-side caching instructions for revalidation
        response.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");

        return response;
    } catch (error) {
        console.error("Error fetching mitra data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
