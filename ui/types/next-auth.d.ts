import 'next-auth';
import type { DefaultSession } from "next-auth/core/types"

declare module 'next-auth' {
  interface Profile {
    requested: {
      tenant: string;
    };
    roles: string[];
    groups: string[];
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    teamId?: string; // Add other custom properties if needed
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      name?: string;
      email?: string | null;
      image?: string | null;
      teamId?: string; // Add your custom property here
      roles: { teamId: string; role: Role }[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    teamId?: string; // Add your custom property here
  }
}