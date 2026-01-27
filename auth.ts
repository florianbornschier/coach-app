import NextAuth from 'next-auth';

import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            credential: z.string(),
            password: z.string(),
            loginType: z.enum(['user', 'admin']).optional()
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { credential, password, loginType } = parsedCredentials.data;
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: credential }, { phone: credential }],
            },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            // Add loginType to the user object temporarily so jwt callback can see it
            return {
              ...user,
              loginType: loginType || 'user'
            };
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // On initial sign in or re-authentication
      if (user) {
        token.role = (user as any).role;
        const loginType = (user as any).loginType;

        if (loginType === 'admin') {
          token.isAdminAuthenticated = true;
          // Note: We don't overwrite isUserAuthenticated here if it was already true in the token
          // token.isUserAuthenticated should survive if it was already set
        } else {
          token.isUserAuthenticated = true;
          // token.isAdminAuthenticated should survive if it was already set
        }
      }

      // Handle manual updates if needed via trigger === 'update'
      if (trigger === 'update' && session) {
        if (session.isUserAuthenticated !== undefined) token.isUserAuthenticated = session.isUserAuthenticated;
        if (session.isAdminAuthenticated !== undefined) token.isAdminAuthenticated = session.isAdminAuthenticated;
      }

      return token;
    },
  },
});

export { handlers, signIn, signOut, auth };
