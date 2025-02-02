import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session(session, token) {
      session.accessToken = token.accessToken; // Add GitHub access token to the session
      return session;
    },
    async jwt(token, user, account) {
      if (account) {
        token.accessToken = account.access_token; // Store GitHub access token in JWT
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});


// import NextAuth from 'next-auth';
// import type { NextApiRequest, NextApiResponse } from 'next';

// import { getAuthOptions } from '@/lib/nextAuth';

// export default async function auth(req: NextApiRequest, res: NextApiResponse) {
//   const authOptions = getAuthOptions(req, res);

//   return await NextAuth(req, res, authOptions);
// }


