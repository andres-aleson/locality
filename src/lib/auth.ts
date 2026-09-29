import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/db";
import { users } from "@/db/schema";

// Google sign-in via Auth.js, replacing Supabase Auth. Sessions are JWTs in a
// cookie (no sessions table). On first sign-in each Google account gets a row
// in locality.users, and that row's uuid is the id the rest of the app sees —
// the same role auth.users' id used to play.
//
// Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the env.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && account.providerAccountId) {
        const email = profile?.email ?? token.email ?? "";
        const name = profile?.name ?? token.name ?? "";
        const [row] = await getDb()
          .insert(users)
          .values({ googleSub: account.providerAccountId, email, name })
          .onConflictDoUpdate({ target: users.googleSub, set: { email, name } })
          .returning({ id: users.id });
        token.userId = row.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }
      return session;
    },
  },
});
