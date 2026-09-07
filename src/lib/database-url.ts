const URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "DIRECT_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
] as const;

export function normalizeConnectionString(raw: string): string {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  const assigned = value.match(
    /^(?:DATABASE_URL|POSTGRES_URL|PRISMA_DATABASE_URL|POSTGRES_PRISMA_URL|POSTGRES_URL_NON_POOLING|DIRECT_URL)\s*=\s*(.*)$/,
  );
  if (assigned) {
    value = assigned[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    }
  }
  return value;
}

function readEnv(key: string): string {
  return normalizeConnectionString(process.env[key] ?? "");
}

function isSqlite(value: string) {
  return value.startsWith("file:");
}

function isPostgres(value: string) {
  return /^(postgres|postgresql):\/\//i.test(value);
}

function isPrismaProtocol(value: string) {
  return /^(prisma|prisma\+postgres):\/\//i.test(value);
}

function isUsable(value: string) {
  return Boolean(value) && !isSqlite(value) && (isPostgres(value) || isPrismaProtocol(value));
}

export function resolveDatabaseUrl(): string | null {
  const values = URL_KEYS.map((key) => readEnv(key)).filter(isUsable);
  return values.find(isPostgres) ?? values[0] ?? null;
}

export function applyResolvedDatabaseUrl(): string | null {
  const url = resolveDatabaseUrl();
  if (url) process.env.DATABASE_URL = url;
  return url;
}

export function databaseUrlStatus(): Record<string, "ok" | "vazio" | "ausente" | "invalido"> {
  const status = {} as Record<string, "ok" | "vazio" | "ausente" | "invalido">;
  for (const key of URL_KEYS) {
    const raw = process.env[key];
    if (raw == null) {
      status[key] = "ausente";
      continue;
    }
    const value = normalizeConnectionString(raw);
    if (!value) status[key] = "vazio";
    else if (isUsable(value)) status[key] = "ok";
    else status[key] = "invalido";
  }
  return status;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    const status = Object.entries(databaseUrlStatus())
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    super(
      `O Prisma tem URL, mas o CommentIQ ainda via um DATABASE_URL vazio no build (${status}). O app agora usa POSTGRES_URL ou PRISMA_DATABASE_URL automaticamente. Faça Redeploy deste commit.`,
    );
    this.name = "DatabaseNotConfiguredError";
  }
}
