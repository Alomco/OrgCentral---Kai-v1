import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const shadowDatabaseUrl = process.env.DATABASE_SHADOW_URL ?? process.env.DATABASE_DIRECT_URL;

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
