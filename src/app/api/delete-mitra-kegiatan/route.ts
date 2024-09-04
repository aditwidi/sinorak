import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { kegiatan_mitra } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
    try {
        const { kegiatan_id } = await req.json();

        if (!kegiatan_id) {
            return NextResponse.json({ error: "Missing kegiatan_id" }, { status: 400 });
        }

        // Delete all records in kegiatan_mitra related to the given kegiatan_id
        const deleteResult = await db
            .delete(kegiatan_mitra)
            .where(eq(kegiatan_mitra.kegiatan_id, kegiatan_id))
            .run();

        if (deleteResult.rowsAffected === 0) {
            return NextResponse.json({ message: "No entries found to delete in kegiatan_mitra" }, { status: 404 });
        }

        return NextResponse.json({ message: "Entries in kegiatan_mitra deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting entries in kegiatan_mitra:", error);
        return NextResponse.json({ error: "An error occurred while deleting entries in kegiatan_mitra" }, { status: 500 });
    }
}
