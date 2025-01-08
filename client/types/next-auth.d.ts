import "next-auth";
declare module "next-auth" {
    interface Session {
        user: {
            backendId?: string | null;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface JWT {
        backendId?: string | null;
    }
}
