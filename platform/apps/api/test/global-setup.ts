import { execSync } from "node:child_process";

export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgresql://forlife:forlife@localhost:5432/forlife_com_test";
  execSync("npx prisma migrate reset --force --skip-generate --skip-seed", {
    env: { ...process.env, DATABASE_URL: url, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "yes" },
    stdio: "pipe",
  });
}
