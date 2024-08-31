import { 
  sqliteTable, 
  integer, 
  text, 
  real, 
  primaryKey 
} from "drizzle-orm/sqlite-core";

// Roles Table
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

// Users Table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nip: text("nip").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  roleId: integer("role_id").references(() => roles.id),
});

// Mitra Table
export const mitra = sqliteTable("mitra", {
  sobat_id: text("sobat_id").primaryKey(),
  nik: text("nik").notNull(),
  jenis_petugas: text("jenis_petugas").$type<"Pendataan" | "Pemeriksaan" | "Pengolahan">().notNull(), // Simulating ENUM
  nama: text("nama").notNull(),
  pekerjaan: text("pekerjaan").notNull(),
  alamat: text("alamat").notNull(),
  jenis_kelamin: text("jenis_kelamin").$type<"Laki-laki" | "Perempuan">().notNull(), // Simulating ENUM
});

// Kegiatan Table
export const kegiatan = sqliteTable("kegiatan", {
  kegiatan_id: integer("kegiatan_id").primaryKey({ autoIncrement: true }),
  nama_kegiatan: text("nama_kegiatan").notNull(),
  kode: text("kode").notNull(),
  jenis_kegiatan: text("jenis_kegiatan").$type<"Pendataan" | "Pemeriksaan" | "Pengolahan">().notNull(), // Simulating ENUM
  tanggal_mulai: text("tanggal_mulai").notNull(), // Store dates as TEXT
  tanggal_berakhir: text("tanggal_berakhir").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  penanggung_jawab: integer("penanggung_jawab").references(() => users.id), // Foreign key to users table
  satuan_honor: text("satuan_honor").$type<"Dokumen" | "OB" | "BS" | "Rumah Tangga">().notNull(), // Simulating ENUM
});

// Kegiatan_Mitra Table
export const kegiatan_mitra = sqliteTable("kegiatan_mitra", {
  kegiatan_mitra_id: integer("kegiatan_mitra_id").primaryKey({ autoIncrement: true }),
  kegiatan_id: integer("kegiatan_id").references(() => kegiatan.kegiatan_id),
  sobat_id: text("sobat_id").references(() => mitra.sobat_id),
  honor_satuan: real("honor_satuan").notNull(),
  target_volume_pekerjaan: integer("target_volume_pekerjaan").notNull(),
  total_honor: real("total_honor").notNull(),
});

// Honor_Limit Table
export const honor_limit = sqliteTable("honor_limit", {
  jenis_petugas: text("jenis_petugas").$type<"Pendataan" | "Pemeriksaan" | "Pengolahan">().primaryKey(), // Simulating ENUM
  honor_max: real("honor_max").notNull(),
});

// Mitra_Honor_Monthly Table
export const mitra_honor_monthly = sqliteTable("mitra_honor_monthly", {
  sobat_id: text("sobat_id").references(() => mitra.sobat_id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  total_honor: real("total_honor").notNull(),
}, 
(table) => ({
  pk: primaryKey(table.sobat_id, table.month, table.year), // Defining composite primary key
}));
