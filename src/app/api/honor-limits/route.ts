// /api/honor-limits.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { honor_limit } from "@/lib/db/schema"; // Import your schema

export const revalidate = 0;

export async function GET(request: Request) {
    try {
        // Fetch all honor limits
        const honorLimits = await db
            .select({
                jenis_petugas: honor_limit.jenis_petugas,
                honor_max: honor_limit.honor_max,
            })
            .from(honor_limit)
            .all();

        return NextResponse.json(
            { honorLimits },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching honor limits:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
