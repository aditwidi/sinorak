// types/next-auth.d.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nip: string;
      name: string;
      role: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nip: string;
    name: string;
    role: string | null;
  }
}
