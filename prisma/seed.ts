import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@commentiq.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists:", email);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: "Canal Demo",
      passwordHash: await bcrypt.hash("demo12345", 10),
      plan: "pro",
      planInterval: "monthly",
      overlayToken: randomBytes(16).toString("hex"),
      usageMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    },
  });

  console.log("Seeded demo user demo@commentiq.app / demo12345 (plano Pro)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
