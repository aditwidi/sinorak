import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { kegiatan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
    try {
        const { kegiatan_id } = await req.json();

        if (!kegiatan_id) {
            return NextResponse.json({ error: "Missing kegiatan_id" }, { status: 400 });
        }

        // Delete the kegiatan entry from the kegiatan table
        const deleteResult = await db
            .delete(kegiatan)
            .where(eq(kegiatan.kegiatan_id, kegiatan_id))
            .run();

        if (deleteResult.rowsAffected === 0) {
            return NextResponse.json({ message: "No kegiatan found to delete" }, { status: 404 });
        }

        return NextResponse.json({ message: "Kegiatan deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting kegiatan:", error);
        return NextResponse.json({ error: "An error occurred while deleting kegiatan" }, { status: 500 });
    }
}
