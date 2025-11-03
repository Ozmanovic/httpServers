import type { MigrationConfig } from "drizzle-orm/migrator";
import { env } from "process";
process.loadEnvFile();

type Config = {
  api: APIConfig;
  db: DBConfig;
  secret: string
};

type APIConfig = {
  fileServerHits: number;
  port: number;
  platform: string;
  polka: string

};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};



function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
    platform: process.env.PLATFORM || "dev",
    polka: envOrThrow("POLKA_KEY")
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
  secret: envOrThrow("SECRET")
};
