import { lastMeadowLocators } from "../ui/last-meadow.selectors";
import type { UISurface } from "./types";

export type ActivityEntryKind = "continue" | "start";

/**
 * Decide qual entrada da atividade está visível (conta que já jogou vs primeira vez).
 */
export async function detectActivityEntryKind(surface: UISurface): Promise<ActivityEntryKind> {
  const L = lastMeadowLocators(surface);
  const visible = await L.continueGame().isVisible().catch(() => false);
  return visible ? "continue" : "start";
}
