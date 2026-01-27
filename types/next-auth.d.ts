import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"]
        isUserAuthenticated?: boolean;
        isAdminAuthenticated?: boolean;
    }

    interface User {
        id?: string;
        role?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        isUserAuthenticated?: boolean;
        isAdminAuthenticated?: boolean;
    }
}
