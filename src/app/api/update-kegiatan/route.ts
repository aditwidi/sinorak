// src/app/api/update-kegiatan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { kegiatan, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { kegiatan_id, nama_kegiatan, kode, jenis_kegiatan, tanggal_mulai, tanggal_berakhir, penanggung_jawab, satuan_honor } = body;

        // Validate request
        if (!isValidKegiatanRequest(body)) {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        // Fetch penanggung_jawab ID
        const userResult = await db.select({ id: users.id }).from(users).where(eq(users.name, penanggung_jawab)).all();
        if (userResult.length === 0) {
            return NextResponse.json({ error: "Penanggung jawab does not exist" }, { status: 400 });
        }
        const userId = userResult[0].id;

        // Update kegiatan table
        await db.update(kegiatan).set({
            nama_kegiatan,
            kode,
            jenis_kegiatan,
            tanggal_mulai,
            tanggal_berakhir,
            penanggung_jawab: userId,
            satuan_honor,
        }).where(eq(kegiatan.kegiatan_id, kegiatan_id)).run();

        return NextResponse.json({ message: "Kegiatan updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating kegiatan:", error);
        return NextResponse.json({ error: "An error occurred while updating kegiatan" }, { status: 500 });
    }
}

function isValidKegiatanRequest(body: any): boolean {
    const requiredFields = ["kegiatan_id", "nama_kegiatan", "kode", "jenis_kegiatan", "tanggal_mulai", "tanggal_berakhir", "penanggung_jawab", "satuan_honor"];
    return requiredFields.every((field) => body[field]);
}
