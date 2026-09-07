import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
];

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq);
      if (process.env[key]) continue;
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

function resolveDatabaseUrl() {
  for (const key of URL_KEYS) {
    const value = (process.env[key] ?? "").trim();
    if (value && !value.startsWith("file:")) {
      return { key, url: value };
    }
  }
  return null;
}

function run(command) {
  const result = spawnSync(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

loadDotEnv();

const resolved = resolveDatabaseUrl();
if (resolved) {
  process.env.DATABASE_URL = resolved.url;
  console.log(`CommentIQ: using ${resolved.key} for Prisma`);
} else {
  const status = URL_KEYS.map((key) => {
    const value = process.env[key];
    if (value == null) return `${key}=ausente`;
    if (!value.trim()) return `${key}=vazio`;
    return `${key}=sqlite`;
  }).join(", ");
  console.warn(
    `CommentIQ: no Postgres URL at build time (${status}). Skipping migrate/seed. Next.js will still build. Login needs a postgres:// DATABASE_URL at runtime.`,
  );
}

run("npx prisma generate");

if (resolved) {
  run("npx prisma migrate deploy");
  run("npx prisma db seed");
}

run("npx next build");
