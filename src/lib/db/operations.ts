// lib/db/db/operations.ts
import { db } from "./db";
import { users, roles, mitra, mitra_honor_monthly, kegiatan_mitra } from "./schema";
import { eq } from "drizzle-orm";
import { saltAndHashPassword } from "@/utils/password";

// Fetch a user by nip
export async function getUserBynip(nip: string) {
  const user = await db
    .select({
      id: users.id,
      nip: users.nip,
      name: users.name,
      password: users.password,
      roleId: users.roleId,
    })
    .from(users)
    .where(eq(users.nip, nip))
    .get();
  return user;
}

// Fetch a user by nip with their role
export async function getUserWithRoleBynip(nip: string) {
  const userWithRole = await db
    .select({
      id: users.id,
      nip: users.nip,
      name: users.name,
      password: users.password,
      role: roles.name,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.nip, nip))
    .get();

  return userWithRole;
}

// Create a new user with a role
export async function createUser(nip: string, name: string, password: string, roleName: string) {
  const role = await db.select().from(roles).where(eq(roles.name, roleName)).get();
  if (!role) throw new Error("Role not found");

  const result = await db.insert(users).values({
    nip,
    name,
    password,
    roleId: role.id,
  }).run();

  return result;
}

// Update user password by ID
export async function updateUserPassword(userId: number, newPassword: string) {
  const hashedPassword = saltAndHashPassword(newPassword);

  const result = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId))
    .run();

  return result;
}

// Update user role by ID
export async function updateUserRole(userId: number, newRole: "admin" | "user") {
  const roleId = newRole === "admin" ? 1 : 2;

  const result = await db
    .update(users)
    .set({ roleId })
    .where(eq(users.id, userId))
    .run();

  return result;
}

// Function to create a new mitra
export async function createMitra(data: {
  sobat_id: string;
  nik: string;
  jenis_petugas: "Pendataan" | "Pengolahan" | "Pendataan dan Pengolahan"; // Updated ENUM
  nama: string;
  pekerjaan: string;
  alamat: string;
  jenis_kelamin: "Laki-laki" | "Perempuan";
}) {
  const result = await db.insert(mitra).values({
    sobat_id: data.sobat_id,
    nik: data.nik,
    jenis_petugas: data.jenis_petugas,
    nama: data.nama,
    pekerjaan: data.pekerjaan,
    alamat: data.alamat,
    jenis_kelamin: data.jenis_kelamin,
  }).run();

  return result;
}

// Function to delete a mitra and related records
export async function deleteMitra(sobat_id: string) {
  try {
      await db.delete(mitra_honor_monthly).where(eq(mitra_honor_monthly.sobat_id, sobat_id));
      await db.delete(kegiatan_mitra).where(eq(kegiatan_mitra.sobat_id, sobat_id));
      await db.delete(mitra).where(eq(mitra.sobat_id, sobat_id));

      console.log(`Successfully deleted mitra with sobat_id: ${sobat_id}`);
  } catch (error) {
      console.error("Failed to delete mitra and related data:", error);
      throw new Error("Could not delete mitra and related data.");
  }
}
