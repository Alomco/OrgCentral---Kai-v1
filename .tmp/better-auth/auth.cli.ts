import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { mcp, organization, username, twoFactor } from "better-auth/plugins";

// Dummy prisma client so CLI can infer Prisma adapter.
const prisma = {} as any;

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: "", clientSecret: "", enabled: false },
    microsoft: { clientId: "", clientSecret: "", tenantId: "common", enabled: false },
  },
  plugins: [
    organization({
      // minimal settings; schema generation cares about schema additions
      schema: {
        session: {
          fields: {
            activeOrganizationId: "activeOrganizationId",
          },
        },
      },
    }),
    username(),
    twoFactor(),
    mcp({
      loginPage: "http://localhost:3000/auth/login",
      resource: "orgcentral-api",
      oidcConfig: { metadata: { issuer: "http://localhost:3000" }, loginPage: "http://localhost:3000/auth/login" },
    }),
  ],
});
