import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.NEON_DB_CONNECTION_STRING;

if (!connectionString) {
    throw new Error(
        'NEON_DB_CONNECTION_STRING is not set. Copy .env.example to .env and fill it in.'
    );
}

export const db = drizzle(connectionString);
