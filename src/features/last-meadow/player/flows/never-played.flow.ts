import type { AppConfig } from "../config/index";
import type { UISurface } from "../domain/types";
import type { Logger } from "../logging/logger";
import { clickAdventureUntilTargetLevel, runFirstLaunchTutorialIfPresent } from "../ui/last-meadow.actions";
import { lastMeadowLocators } from "../ui/last-meadow.selectors";

/**
 * Caso de uso: primeira vez no Last Meadow (Start Game → tutorial opcional → Adventure).
 */
export async function runNeverPlayedFlow(
  surface: UISurface,
  config: AppConfig,
  log: Logger,
): Promise<void> {
  await lastMeadowLocators(surface).startGame().click();
  await runFirstLaunchTutorialIfPresent(surface, config.timeouts);
  await clickAdventureUntilTargetLevel(surface, config, log);
}
