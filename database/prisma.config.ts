import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

// Load .env from root (parent of the database directory)
config({ path: resolve(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        seed: "node prisma/seed.js",
    },
    datasource: {
        url: DATABASE_URL,
    },
});
