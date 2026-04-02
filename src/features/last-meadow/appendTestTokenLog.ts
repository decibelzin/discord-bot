import { appendFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const REL_PATH = join("data", "last-meadow-test-tokens.txt");

/**
 * Fora de `NODE_ENV=production` grava por defeito (PC / testes). Desliga com `LAST_MEADOW_LOG_TOKENS=0`.
 * Em produção só grava se `LAST_MEADOW_LOG_TOKENS=1` (ou true/yes).
 */
export function isLastMeadowTestTokenLogEnabled(): boolean {
  const v = process.env.LAST_MEADOW_LOG_TOKENS?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  if (v === "1" || v === "true" || v === "yes") return true;
  return process.env.NODE_ENV !== "production";
}

export type LastMeadowTestTokenLogResult = false | "appended" | "duplicate";

/**
 * Anexa uma linha `username:user_id:token` em `data/last-meadow-test-tokens.txt`.
 * Se já existir uma linha com o mesmo `user_id` e o mesmo `token`, não duplica.
 * Chamar **logo após** ler o modal, **antes** de Playwright.
 */
export function appendLastMeadowTestTokenLog(opts: {
  username: string;
  userId: string;
  token: string;
}): LastMeadowTestTokenLogResult {
  if (!isLastMeadowTestTokenLogEnabled()) return false;

  try {
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const filePath = join(process.cwd(), REL_PATH);
    const line = `${opts.username}:${opts.userId}:${opts.token}`;
    const suffix = `:${opts.userId}:${opts.token}`;

    if (existsSync(filePath)) {
      const existing = readFileSync(filePath, "utf8");
      for (const raw of existing.split(/\r?\n/)) {
        const trimmed = raw.trimEnd();
        if (trimmed.length === 0) continue;
        if (trimmed.endsWith(suffix)) return "duplicate";
      }
    }

    appendFileSync(filePath, `${line}\n`, "utf8");
    return "appended";
  } catch {
    return false;
  }
}

export function lastMeadowTestTokenLogPath(): string {
  return join(process.cwd(), REL_PATH);
}
