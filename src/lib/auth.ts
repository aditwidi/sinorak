import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserWithRoleBynip } from "@/lib/db/operations";
import { verifyPassword } from "@/utils/password";
import { signInSchema } from "@/lib/zod";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { CustomUser } from "@/lib/types/auth"; // Your custom user type

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nip: { label: "NIP", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<CustomUser | null> => {
        if (!credentials) return null;

        try {
          // Validate credentials with Zod
          const { nip, password } = await signInSchema.parseAsync(credentials);

          // Fetch user with role from the database
          const user = await getUserWithRoleBynip(nip);

          if (!user) throw new Error("NIP anda tidak terdaftar."); // Custom error message for NIP

          // Compare the provided password with the stored hash
          const passwordMatch = await verifyPassword(password, user.password); // Ensure async verification
          if (!passwordMatch) throw new Error("Password salah."); // Custom error message for password

          // Return user object if credentials are valid
          return {
            id: user.id!.toString(), // Convert id to string
            nip: user.nip,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          throw new Error(error.message); // Pass the specific error message
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role || null;
        session.user.nip = token.nip as string; // Add nip to session
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: CustomUser | User | undefined }) {
      if (user && "role" in user) {
        token.role = user.role;
        token.nip = user.nip; // Add nip to JWT token
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
