// lib/db/operations.ts
import { db } from "./db";
import { users, roles } from "./schema";
import { eq } from "drizzle-orm";
import { saltAndHashPassword } from "@/utils/password";

// Fetch a user by nip
export async function getUserBynip(nip: string) {
  const user = await db
    .select({
      id: users.id,
      nip: users.nip,
      name: users.name, // Include the new name field
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
      name: users.name, // Include the new name field
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
  // Fetch the role based on the provided roleName
  const role = await db.select().from(roles).where(eq(roles.name, roleName)).get();
  if (!role) throw new Error("Role not found");

  // Insert a new user with the name field included
  const result = await db.insert(users).values({
    nip,
    name, // Add the name field
    password,
    roleId: role.id,
  }).run();

  return result;
}

// Update user password by ID
export async function updateUserPassword(userId: number, newPassword: string) {
  // Hash the new password before updating
  const hashedPassword = saltAndHashPassword(newPassword);

  const result = await db
    .update(users)
    .set({ password: hashedPassword }) // Save the hashed password
    .where(eq(users.id, userId))
    .run();

  return result;
}
