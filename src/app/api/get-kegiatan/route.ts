// src/app/api/get-kegiatan/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db/db"; // Ensure the path is correct based on your setup
import { kegiatan, kegiatan_mitra, users } from "@/lib/db/schema"; // Adjust the import path based on your setup
import { eq, like, and } from "drizzle-orm"; // Import the correct functions

// Named export for the GET method
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sobat_id = searchParams.get("sobat_id");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterMonth = searchParams.get("filterMonth");
  const filterYear = searchParams.get("filterYear");

  if (!sobat_id) {
    return NextResponse.json({ error: "Invalid sobat_id" }, { status: 400 });
  }

  try {
    // Define the base where condition
    const conditions = [eq(kegiatan_mitra.sobat_id, sobat_id)];

    // Add search term filter if provided
    if (searchTerm) {
      conditions.push(like(kegiatan.nama_kegiatan, `%${searchTerm}%`));
    }

    // Add month and year filters if provided
    if (filterMonth) {
      conditions.push(eq(kegiatan.month, Number(filterMonth)));
    }

    if (filterYear) {
      conditions.push(eq(kegiatan.year, Number(filterYear)));
    }

    // Build the base query to join kegiatan and kegiatan_mitra
    const query = db
      .select({
        kegiatan_id: kegiatan.kegiatan_id,
        nama_kegiatan: kegiatan.nama_kegiatan,
        kode: kegiatan.kode,
        penanggung_jawab: users.name, // Adjust this based on your actual column name
        honor: kegiatan_mitra.total_honor, // Join to get total_honor as honor
        bulan: kegiatan.month, // Include bulan (month) from kegiatan
        tahun: kegiatan.year, // Include tahun (year) from kegiatan
      })
      .from(kegiatan)
      .leftJoin(kegiatan_mitra, eq(kegiatan_mitra.kegiatan_id, kegiatan.kegiatan_id))
      .leftJoin(users, eq(users.id, kegiatan.penanggung_jawab))
      .where(and(...conditions)); // Use `and` to combine all conditions

    const kegiatanList = await query.execute(); // Execute the query to get kegiatan data with honor

    return NextResponse.json({ kegiatanList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
