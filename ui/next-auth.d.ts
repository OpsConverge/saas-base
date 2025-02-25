// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {

  interface JWT {
        teamId?: string;
      }
      
  interface User {
    // Add any custom properties you need to store in the session.
    teamId?: string;
  }
  
  interface Session {
    user: {
      id: string;
      teamId?: string;
    } & DefaultSession["user"];
  }
}
