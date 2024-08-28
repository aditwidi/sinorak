import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nip: text("nip").notNull().unique(),
  name: text("name").notNull(), // Added the new `name` column
  password: text("password").notNull(),
  roleId: integer("role_id").references(() => roles.id),
});
