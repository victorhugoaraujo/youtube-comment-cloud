const URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim();
}

export function resolveDatabaseUrl(): string | null {
  for (const key of URL_KEYS) {
    const value = readEnv(key);
    if (value && !value.startsWith("file:")) return value;
  }
  return null;
}

export function databaseUrlStatus(): string {
  return URL_KEYS.map((key) => {
    const value = process.env[key];
    if (value == null) return `${key}=ausente`;
    if (!value.trim()) return `${key}=vazio`;
    if (value.trim().startsWith("file:")) return `${key}=sqlite`;
    return `${key}=ok`;
  }).join(", ");
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      `O banco não está conectado (${databaseUrlStatus()}). Na Vercel: Settings → Environment Variables → apague o DATABASE_URL vazio. Storage → Prisma Postgres → Connect com prefixo vazio. O valor precisa começar com postgres://`,
    );
    this.name = "DatabaseNotConfiguredError";
  }
}
