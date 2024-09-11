import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { mitra, mitra_honor_monthly } from "@/lib/db/schema";
import { eq, sql, and, like } from "drizzle-orm";

export const revalidate = 0; // Revalidate every new data

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const searchTerm = searchParams.get("searchTerm") || "";
    const filterMonth = searchParams.get("filterMonth") || "";
    const filterYear = searchParams.get("filterYear") || "";
    const filterJenisPetugas = searchParams.get("filterJenisPetugas") as "Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan" | "" || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const sortColumn = searchParams.get("sortColumn") || "nama";
    const sortDirection = searchParams.get("sortDirection") === "desc" ? "desc" : "asc";

    const offset = (page - 1) * pageSize;

    const filters = [];
    if (searchTerm) filters.push(like(mitra.nama, `%${searchTerm}%`));
    if (filterJenisPetugas) filters.push(eq(mitra.jenis_petugas, filterJenisPetugas));

    const monthYearFilter = filterMonth && filterYear
        ? and(
            eq(mitra_honor_monthly.month, parseInt(filterMonth)),
            eq(mitra_honor_monthly.year, parseInt(filterYear))
        )
        : sql`1 = 1`;

    try {
        const validColumns = ["nama", "honor_bulanan", "sobat_id"];
        const sortBy = validColumns.includes(sortColumn) ? sortColumn : "nama";

        const orderByClause = sortDirection === "desc"
            ? sql`${sql.identifier(sortBy)} DESC`
            : sql`${sql.identifier(sortBy)} ASC`;

        let mitraData = await db
            .select({
                sobat_id: mitra.sobat_id,
                nama: mitra.nama,
                jenis_petugas: mitra.jenis_petugas,
                honor_bulanan: sql<number | null>`COALESCE(SUM(CASE WHEN ${monthYearFilter} THEN ${mitra_honor_monthly.total_honor} ELSE 0 END), 0)`.as("honor_bulanan"),
                month: sql<number | null>`MAX(CASE WHEN ${monthYearFilter} THEN ${mitra_honor_monthly.month} ELSE NULL END)`.as("month"),
                year: sql<number | null>`MAX(CASE WHEN ${monthYearFilter} THEN ${mitra_honor_monthly.year} ELSE NULL END)`.as("year")
            })
            .from(mitra)
            .leftJoin(mitra_honor_monthly, eq(mitra.sobat_id, mitra_honor_monthly.sobat_id))
            .where(and(...filters))
            .groupBy(mitra.sobat_id)
            .orderBy(orderByClause)
            .limit(pageSize)
            .offset(offset)
            .all();

        const totalCountResult = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${mitra.sobat_id})` })
            .from(mitra)
            .leftJoin(mitra_honor_monthly, eq(mitra.sobat_id, mitra_honor_monthly.sobat_id))
            .where(and(...filters))
            .get();

        const totalCount = totalCountResult?.count || 0;

        const response = NextResponse.json(
            { mitraData, totalCount },
            { status: 200 }
        );

        response.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");

        return response;
    } catch (error) {
        console.error("Error fetching mitra data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
