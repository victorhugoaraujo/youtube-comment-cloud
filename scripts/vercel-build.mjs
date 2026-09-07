import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "DIRECT_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
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

function normalize(raw) {
  let value = String(raw ?? "").trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function isPostgres(value) {
  return /^(postgres|postgresql):\/\//i.test(value);
}

function isPrismaProtocol(value) {
  return /^(prisma|prisma\+postgres):\/\//i.test(value);
}

function resolve() {
  const found = [];
  for (const key of URL_KEYS) {
    const url = normalize(process.env[key]);
    if (!url || url.startsWith("file:")) continue;
    if (isPostgres(url) || isPrismaProtocol(url)) found.push({ key, url });
  }
  return found.find((item) => isPostgres(item.url)) ?? found[0] ?? null;
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

const resolved = resolve();
if (resolved) {
  process.env.DATABASE_URL = resolved.url;
  console.log(`CommentIQ: Prisma will use ${resolved.key}`);
} else {
  const status = URL_KEYS.map((key) => {
    const value = process.env[key];
    if (value == null) return `${key}=ausente`;
    if (!normalize(value)) return `${key}=vazio`;
    return `${key}=outro`;
  }).join(", ");
  console.warn(
    `CommentIQ: no Postgres URL at build time (${status}). Skipping migrate/seed; runtime will use POSTGRES_URL / PRISMA_DATABASE_URL if Vercel only injects them then.`,
  );
}

run("npx prisma generate");

if (resolved && isPostgres(resolved.url)) {
  run("npx prisma migrate deploy");
  run("npx prisma db seed");
} else if (resolved) {
  console.warn(
    `CommentIQ: ${resolved.key} is not postgres://; skipping migrate at build. Tables are created on first login.`,
  );
}

run("npx next build");
