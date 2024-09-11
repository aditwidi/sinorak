import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db'; // Adjust the import path as needed
import { eq } from 'drizzle-orm';
import { kegiatan, users, kegiatan_mitra, mitra } from '@/lib/db/schema';

// Define the response types
interface KegiatanDetailResponse {
    kegiatanDetail: {
        kegiatan_id: number;
        nama_kegiatan: string;
        kode: string;
        jenis_kegiatan: 'Lapangan' | 'Pengolahan'; // Include 'Lapangan'
        tanggal_mulai: string;
        tanggal_berakhir: string;
        month: number;
        year: number;
        satuan_honor: 'Dokumen' | 'OB' | 'BS' | 'Rumah Tangga' | 'Pasar' | 'Keluarga' | 'SLS' | 'Desa' | 'Responden';
        penanggung_jawab: string;
        honor_satuan: number; // Ensure honor_satuan is always a number
    } | null;
    pesertaList: Array<{
        sobat_id: string;
        nama: string;
        target: number;
        honor: number;
        status_mitra: 'PPL' | 'PML' | 'Operator' | 'Supervisor'; // Include status_mitra field
    }>;
    totalHonor: number;
}

// Named export for GET method
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const kegiatan_id = searchParams.get('kegiatan_id');

    if (!kegiatan_id) {
        return NextResponse.json({ message: 'Invalid kegiatan_id' }, { status: 400 });
    }

    try {
        // Fetch the Kegiatan detail, including honor_satuan
        const kegiatanDetail = await db
            .select({
                kegiatan_id: kegiatan.kegiatan_id,
                nama_kegiatan: kegiatan.nama_kegiatan,
                kode: kegiatan.kode,
                jenis_kegiatan: kegiatan.jenis_kegiatan,
                tanggal_mulai: kegiatan.tanggal_mulai,
                tanggal_berakhir: kegiatan.tanggal_berakhir,
                month: kegiatan.month,
                year: kegiatan.year,
                satuan_honor: kegiatan.satuan_honor,
                penanggung_jawab: users.name,
                honor_satuan: kegiatan_mitra.honor_satuan, // Fetch honor_satuan
            })
            .from(kegiatan)
            .innerJoin(users, eq(kegiatan.penanggung_jawab, users.id))
            .leftJoin(kegiatan_mitra, eq(kegiatan.kegiatan_id, kegiatan_mitra.kegiatan_id)) // Join to get honor_satuan
            .where(eq(kegiatan.kegiatan_id, parseInt(kegiatan_id)))
            .limit(1)
            .get();

        if (!kegiatanDetail) {
            return NextResponse.json({ message: 'Kegiatan not found' }, { status: 404 });
        }

        // Ensure honor_satuan is always a number, even if null
        const safeKegiatanDetail = {
            ...kegiatanDetail,
            honor_satuan: kegiatanDetail.honor_satuan ?? 0 // Default to 0 if honor_satuan is null
        };

        // Fetch the peserta list for the Kegiatan including status_mitra
        const pesertaList = await db
            .select({
                sobat_id: mitra.sobat_id,
                nama: mitra.nama,
                target: kegiatan_mitra.target_volume_pekerjaan,
                honor: kegiatan_mitra.total_honor,
                status_mitra: kegiatan_mitra.status_mitra // Fetch status_mitra
            })
            .from(kegiatan_mitra)
            .innerJoin(mitra, eq(kegiatan_mitra.sobat_id, mitra.sobat_id))
            .where(eq(kegiatan_mitra.kegiatan_id, parseInt(kegiatan_id)))
            .all();

        // Calculate total honor for the Kegiatan
        const totalHonor = pesertaList.reduce((sum, peserta) => sum + peserta.honor, 0);

        // Prepare the response data
        const responseData: KegiatanDetailResponse = {
            kegiatanDetail: safeKegiatanDetail,
            pesertaList: pesertaList,
            totalHonor: totalHonor,
        };

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error('Error fetching kegiatan details:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
