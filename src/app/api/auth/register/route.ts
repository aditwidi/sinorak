import { NextResponse } from "next/server";
import { createUser } from "@/lib/db/operations";
import { saltAndHashPassword } from "@/utils/password";
import { z } from "zod";

// Update the register schema to validate NIP, name, and password
const registerSchema = z.object({
  nip: z
    .string()
    .regex(/^\d{9,18}$/, { message: "NIP harus terdiri dari 9 hingga 18 digit angka" }), // Validate 9-18 digit number
  name: z
    .string()
    .min(1, { message: "Nama tidak boleh kosong" }), // Name should not be empty
  password: z
    .string()
    .min(6, { message: "Kata sandi harus terdiri dari minimal 6 karakter" }), // Minimum length for password
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body using the updated schema
    const body = await request.json();
    const { nip, name, password } = registerSchema.parse(body);

    // Hash the password
    const hashedPassword = await saltAndHashPassword(password);

    // Create the user in the database with a default role of "user"
    await createUser(nip, name, hashedPassword, "user");

    return NextResponse.json({ message: "Pengguna berhasil didaftarkan" });
  } catch (error: unknown) {
    // Narrow the error type for Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    // Type guard to check if the error is related to SQLite unique constraint violation
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Akun dengan NIP ini sudah terdaftar, Silahkan gunakan NIP yang berbeda!" },
        { status: 409 } // 409 Conflict status code
      );
    }

    // Log unexpected errors for debugging
    console.error(error);

    // Provide a generic user-friendly error message
    return NextResponse.json({ error: "Terjadi kesalahan saat mendaftarkan akun. Silakan coba lagi." }, { status: 500 });
  }
}

// Type guard to check if the error is a unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    // Check if the error message indicates a unique constraint violation for 'users.nip'
    const message = (error as any).message;
    return typeof message === "string" && message.includes("UNIQUE constraint failed: users.nip");
  }
  return false;
}
