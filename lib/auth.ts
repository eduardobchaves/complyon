import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companySlug: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("[Auth] Schema validation failed:", parsed.error.issues);
            return null;
          }

          const { email, password, companySlug } = parsed.data;
          console.log("[Auth] Attempting login for email:", email);

          let user;
          if (companySlug) {
            console.log("[Auth] Searching with company slug:", companySlug);
            user = await prisma.user.findFirst({
              where: {
                email,
                company: { slug: companySlug },
              },
              include: { company: true },
            });
          } else {
            console.log("[Auth] Searching by email without company slug");
            const users = await prisma.user.findMany({
              where: { email },
              include: { company: true },
            });

            console.log(`[Auth] Found ${users.length} user(s) with email: ${email}`);

            if (users.length === 1) {
              user = users[0];
            } else if (users.length > 1) {
              console.log("[Auth] Multiple companies found for this email");
              return null;
            } else {
              console.log("[Auth] No user found with this email");
              return null;
            }
          }

          if (!user) {
            console.log("[Auth] User not found after search");
            return null;
          }

          console.log("[Auth] User found:", {
            id: user.id,
            email: user.email,
            role: user.role,
            active: user.active,
            hasPassword: !!user.password,
          });

          if (!user.password) {
            console.log("[Auth] User has no password set");
            return null;
          }

          if (!user.active) {
            console.log("[Auth] User is not active");
            return null;
          }

          console.log("[Auth] Comparing passwords...");
          const valid = await bcrypt.compare(password, user.password);

          if (!valid) {
            console.log("[Auth] Password comparison failed for user:", email);
            return null;
          }

          console.log("[Auth] Password valid! Login successful for:", email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId ?? null,
            companySlug: user.company?.slug ?? null,
          };
        } catch (error) {
          console.error("[Auth] Unexpected error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: string; companyId: string; companySlug: string };
        token.role = u.role;
        token.companyId = u.companyId;
        token.companySlug = u.companySlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { companyId: string }).companyId = token.companyId as string;
        (session.user as unknown as { companySlug: string }).companySlug = token.companySlug as string;
      }
      return session;
    },
  },
});
