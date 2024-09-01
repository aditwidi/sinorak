import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { mitra } from "@/lib/db/schema"; // Import your schema
import { eq } from "drizzle-orm";

// Fetch Mitra Data by sobat_id
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sobatId = searchParams.get("sobat_id");

        if (!sobatId) {
            return NextResponse.json({ error: "sobat_id is required" }, { status: 400 });
        }

        // Fetch the mitra data from the database
        const mitraData = await db
            .select()
            .from(mitra)
            .where(eq(mitra.sobat_id, sobatId))
            .get();

        if (!mitraData) {
            return NextResponse.json({ error: "Mitra not found" }, { status: 404 });
        }

        return NextResponse.json(mitraData, { status: 200 });
    } catch (error) {
        console.error("Error fetching mitra data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
