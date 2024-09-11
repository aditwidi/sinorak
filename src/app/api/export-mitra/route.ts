// src/app/api/export-mitra/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { kegiatan, kegiatan_mitra, mitra, mitra_honor_monthly } from '@/lib/db/schema';
import ExcelJS from 'exceljs'; // Import exceljs
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

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mitra Data');

        // Add column headers
        worksheet.columns = [
            { header: 'Nama Kegiatan', key: 'nama_kegiatan', width: 30 },
            { header: 'Periode Waktu', key: 'periode_waktu', width: 30 },
            { header: 'Target Volume Pekerjaan', key: 'target_volume_pekerjaan', width: 20 },
            { header: 'Satuan Honor', key: 'satuan_honor', width: 15 },
            { header: 'Honor Satuan', key: 'honor_satuan', width: 20 },
            { header: 'Honor Kegiatan', key: 'honor_kegiatan', width: 20 },
            { header: 'Kode Kegiatan', key: 'kode', width: 15 },
        ];

        // Add data rows
        data.forEach((row: ExportData) => {
            worksheet.addRow({
                nama_kegiatan: row.nama_kegiatan,
                periode_waktu: `${formatDate(row.tanggal_mulai)} s.d ${formatDate(row.tanggal_berakhir)}`,
                target_volume_pekerjaan: row.target_volume_pekerjaan ?? 0,
                satuan_honor: row.satuan_honor,
                honor_satuan: formatCurrency(row.honor_satuan ?? 0),
                honor_kegiatan: formatCurrency(row.total_honor ?? 0),
                kode: row.kode,
            });
        });

        // Add total honor row
        worksheet.addRow({
            nama_kegiatan: 'Total Honor',
            periode_waktu: '',
            target_volume_pekerjaan: 0,
            satuan_honor: '',
            honor_satuan: '',
            honor_kegiatan: formatCurrency(totalHonor),
            kode: '',
        });

        // Write to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Create and return the response with Excel file
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=mitra_export.xlsx`,
            },
        });
    } catch (error) {
        console.error('Error exporting mitra data:', error);
        return NextResponse.json({ error: 'Failed to export mitra data' }, { status: 500 });
    }
}
