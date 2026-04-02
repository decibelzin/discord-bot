import type { AppConfig } from "../config/index";
import type { UISurface } from "../domain/types";
import type { Logger } from "../logging/logger";
import { clickAdventureUntilTargetLevel } from "../ui/last-meadow.actions";
import { lastMeadowLocators } from "../ui/last-meadow.selectors";

/**
 * Caso de uso: conta que já jogou (Continue Game → Adventure).
 */
export async function runReturningPlayerFlow(
  surface: UISurface,
  config: AppConfig,
  log: Logger,
): Promise<void> {
  await lastMeadowLocators(surface).continueGame().click();
  await clickAdventureUntilTargetLevel(surface, config, log);
}
