// /pages/api/kegiatan-data.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { kegiatan, users } from "@/lib/db/schema"; // Import your schema
import { eq, sql, and, like, or } from "drizzle-orm";

export const revalidate = 0; // Revalidate every new data

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const searchTerm = searchParams.get("searchTerm") || "";
    const filterMonth = searchParams.get("filterMonth") || "";
    const filterYear = searchParams.get("filterYear") || "";
    const filterJenisKegiatan = searchParams.get("filterJenisKegiatan") as
        | "Lapangan"
        | "Pengolahan"
        | ""
        || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const offset = (page - 1) * pageSize;

    // Construct filters dynamically
    const filters = [];

    if (searchTerm) {
        filters.push(
            or(
                like(kegiatan.nama_kegiatan, `%${searchTerm}%`),
                like(kegiatan.kode, `%${searchTerm}%`),
                like(users.name, `%${searchTerm}%`)
            )
        );
    }

    if (filterJenisKegiatan) {
        filters.push(eq(kegiatan.jenis_kegiatan, filterJenisKegiatan));
    }

    if (filterMonth) {
        filters.push(eq(kegiatan.month, parseInt(filterMonth, 10)));
    }

    if (filterYear) {
        filters.push(eq(kegiatan.year, parseInt(filterYear, 10)));
    }

    try {
        // Fetch kegiatan data with pagination and filters
        const kegiatanData = await db
            .select({
                kegiatan_id: kegiatan.kegiatan_id,
                nama_kegiatan: kegiatan.nama_kegiatan,
                kode: kegiatan.kode,
                jenis_kegiatan: kegiatan.jenis_kegiatan,
                tanggal_mulai: kegiatan.tanggal_mulai,
                tanggal_berakhir: kegiatan.tanggal_berakhir,
                month: kegiatan.month,
                year: kegiatan.year,
                penanggung_jawab: users.name, // Joining with users to get the name
                satuan_honor: kegiatan.satuan_honor,
            })
            .from(kegiatan)
            .leftJoin(users, eq(kegiatan.penanggung_jawab, users.id))
            .where(and(...filters))
            .limit(pageSize)
            .offset(offset)
            .all();

        // Count total records matching the filters
        const totalCountResult = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(kegiatan)
            .leftJoin(users, eq(kegiatan.penanggung_jawab, users.id))
            .where(and(...filters))
            .all();

        const totalCount = totalCountResult[0]?.count || 0;

        const response = NextResponse.json(
            { kegiatanData, totalCount },
            { status: 200 }
        );

        response.headers.set(
            "Cache-Control",
            "no-cache, no-store, max-age=0, must-revalidate"
        );

        return response;
    } catch (error) {
        console.error("Error fetching kegiatan data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
