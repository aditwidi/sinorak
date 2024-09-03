// src/app/api/delete-mitra/route.ts

import { NextResponse } from "next/server";
import { deleteMitra } from "@/lib/db/operations"; // Import the delete function

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const sobat_id = searchParams.get("sobat_id");

    if (!sobat_id || typeof sobat_id !== "string") {
        return NextResponse.json({ error: "Invalid sobat_id provided." }, { status: 400 });
    }

    try {
        await deleteMitra(sobat_id);
        return NextResponse.json({ message: `Mitra with sobat_id ${sobat_id} deleted successfully.` }, { status: 200 });
    } catch (error) {
        console.error("Error deleting mitra:", error);
        return NextResponse.json({ error: "Failed to delete mitra." }, { status: 500 });
    }
}
