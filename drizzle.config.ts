import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './configs/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.NEON_DB_CONNECTION_STRING!,
    },
});
