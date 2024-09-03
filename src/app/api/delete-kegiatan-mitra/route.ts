import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Import your database instance
import { eq } from "drizzle-orm"; // Import Drizzle ORM helpers
import { kegiatan_mitra } from "@/lib/db/schema"; // Import your schema

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const sobat_id = searchParams.get("sobat_id");

    if (!sobat_id) {
        return NextResponse.json({ error: "Invalid sobat_id provided." }, { status: 400 });
    }

    try {
        await db.delete(kegiatan_mitra).where(eq(kegiatan_mitra.sobat_id, sobat_id));

        return NextResponse.json({ message: `Deleted kegiatan_mitra records for sobat_id: ${sobat_id}` });
    } catch (error) {
        console.error("Error deleting kegiatan_mitra:", error);
        return NextResponse.json({ error: "Failed to delete kegiatan_mitra." }, { status: 500 });
    }
}
