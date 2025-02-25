import 'next-auth';

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
    teamId?: string; // Add your custom property here
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      teamId?: string; // Add your custom property here
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    teamId?: string; // Add your custom property here
  }
}