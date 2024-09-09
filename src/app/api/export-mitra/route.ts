// src/app/api/export-mitra/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db'; // Import your database configuration
import { kegiatan, kegiatan_mitra, mitra, mitra_honor_monthly } from '@/lib/db/schema'; // Corrected Import Path for schema
import { parse } from 'json2csv';
import { eq, and } from 'drizzle-orm';

// Define the expected data structure
interface ExportData {
  nama_kegiatan: string;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  target_volume_pekerjaan: number | null;
  satuan_honor: string;
  honor_satuan: number | null;
  total_honor: number | null;
  kode: string;
}

// Function to format a date in "DD MMMM YYYY" format
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

// Function to format currency in Indonesian Rupiah
const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
};

export async function GET(req: Request) {
    try {
        // Parse URL and query parameters
        const url = new URL(req.url);
        const sobat_id = url.searchParams.get('sobat_id');
        const month = url.searchParams.get('month');
        const year = url.searchParams.get('year');

        if (!sobat_id || !month || !year) {
            return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
        }

        // Fetch data filtered by month and year
        const data = await db.select({
            nama_kegiatan: kegiatan.nama_kegiatan,
            tanggal_mulai: kegiatan.tanggal_mulai,
            tanggal_berakhir: kegiatan.tanggal_berakhir,
            target_volume_pekerjaan: kegiatan_mitra.target_volume_pekerjaan,
            satuan_honor: kegiatan.satuan_honor,
            honor_satuan: kegiatan_mitra.honor_satuan,
            total_honor: kegiatan_mitra.total_honor,
            kode: kegiatan.kode,
        })
        .from(kegiatan)
        .leftJoin(kegiatan_mitra, eq(kegiatan.kegiatan_id, kegiatan_mitra.kegiatan_id))
        .leftJoin(mitra, eq(mitra.sobat_id, kegiatan_mitra.sobat_id))
        .where(
            and(
                eq(mitra.sobat_id, sobat_id),
                eq(kegiatan.month, parseInt(month)),
                eq(kegiatan.year, parseInt(year))
            )
        )
        .orderBy(kegiatan.nama_kegiatan, kegiatan_mitra.kegiatan_id);

        // Fetch the total honor for the selected month and year
        const totalHonorData = await db.select({
            total_honor: mitra_honor_monthly.total_honor,
        })
        .from(mitra_honor_monthly)
        .where(
            and(
                eq(mitra_honor_monthly.sobat_id, sobat_id),
                eq(mitra_honor_monthly.month, parseInt(month)),
                eq(mitra_honor_monthly.year, parseInt(year))
            )
        );

        // Get the total honor from the query
        const totalHonor = totalHonorData.length > 0 ? totalHonorData[0].total_honor : 0;

        // Prepare the data in the desired format
        const formattedData = data.map((row: ExportData) => ({
            "Nama Kegiatan": row.nama_kegiatan,
            "Periode Waktu": `${formatDate(row.tanggal_mulai)} s.d ${formatDate(row.tanggal_berakhir)}`,
            "Target Volume Pekerjaan": row.target_volume_pekerjaan ?? 0,
            "Satuan Honor": row.satuan_honor,
            "Honor Satuan": formatCurrency(row.honor_satuan ?? 0), // Format currency
            "Honor Kegiatan": formatCurrency(row.total_honor ?? 0), // Format currency
            "Kode Kegiatan": row.kode,
        }));

        // Add the total honor as a separate row or at the end of the CSV data
        formattedData.push({
            "Nama Kegiatan": "Total Honor",
            "Periode Waktu": "",
            "Target Volume Pekerjaan": 0,
            "Satuan Honor": "",
            "Honor Satuan": "", // No currency needed here
            "Honor Kegiatan": formatCurrency(totalHonor), // Format total honor as currency
            "Kode Kegiatan": "",
        });

        // Convert the data to CSV format
        const csvData = parse(formattedData);

        // Create and return the response
        return new NextResponse(csvData, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=mitra_export.csv',
            },
        });
    } catch (error) {
        console.error('Error exporting mitra data:', error);
        return NextResponse.json({ error: 'Failed to export mitra data' }, { status: 500 });
    }
}
