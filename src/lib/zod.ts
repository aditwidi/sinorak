// lib/zod.ts
import { z } from "zod";

// Schema for sign-in, validating NIP (9 to 18 digits) and password 
export const signInSchema = z.object({
  nip: z
    .string()
    .regex(/^\d{9,18}$/, { message: "NIP harus terdiri dari 9 hingga 18 digit angka" }), // Validate 9-18 digit number
  password: z
    .string()
    .min(6, { message: "Kata sandi harus terdiri dari minimal 6 karakter" }), // Minimum length for password
});

// Schema for registration, also validating NIP (9 to 18 digits) and password
export const registerSchema = z.object({
  nip: z
    .string()
    .regex(/^\d{9,18}$/, { message: "NIP harus terdiri dari 9 hingga 18 digit angka" }), // Validate 9-18 digit number
  password: z
    .string()
    .min(6, { message: "Kata sandi harus terdiri dari minimal 6 karakter" }), // Minimum length for password
});
