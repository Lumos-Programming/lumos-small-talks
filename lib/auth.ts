import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+guilds",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ account }) {
      if (account?.provider === "discord") {
        const guildId = process.env.DISCORD_GUILD_ID;
        if (!guildId) return true; // Bypass if not configured

        try {
          const res = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });
          const guilds = await res.json();
          const isMember = guilds.some((g: any) => g.id === guildId);
          return isMember;
        } catch (e) {
          console.error("Failed to fetch guilds", e);
          return false;
        }
      }
      return true;
    },
  },
})
