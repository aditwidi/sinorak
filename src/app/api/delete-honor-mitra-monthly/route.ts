import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { eq } from "drizzle-orm"; // Import Drizzle ORM helpers
import { mitra_honor_monthly } from "@/lib/db/schema"; // Import your schema

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const sobat_id = searchParams.get("sobat_id");

    if (!sobat_id) {
        return NextResponse.json({ error: "Invalid sobat_id provided." }, { status: 400 });
    }

    try {
        await db.delete(mitra_honor_monthly).where(eq(mitra_honor_monthly.sobat_id, sobat_id));

        return NextResponse.json({ message: `Deleted mitra_honor_monthly records for sobat_id: ${sobat_id}` });
    } catch (error) {
        console.error("Error deleting mitra_honor_monthly:", error);
        return NextResponse.json({ error: "Failed to delete mitra_honor_monthly." }, { status: 500 });
    }
}
