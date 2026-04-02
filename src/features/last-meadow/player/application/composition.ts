import type { AppConfig } from "../config/index";
import { ActivitySurfaceResolver } from "../infrastructure/playwright/activity-surface.resolver";
import { LastMeadowDiscordLauncher } from "../infrastructure/discord/last-meadow-launcher";
import { DiscordTokenAuthService } from "../infrastructure/discord/token-auth.service";
import type { Logger } from "../logging/logger";
import { LastMeadowSessionOrchestrator } from "./last-meadow-session.orchestrator";

/**
 * Raiz de composição: instancia serviços com dependências explícitas (sem container IoC).
 */
export function createLastMeadowSessionOrchestrator(
  config: AppConfig,
  log: Logger,
): LastMeadowSessionOrchestrator {
  return new LastMeadowSessionOrchestrator(
    config,
    new DiscordTokenAuthService(config, log),
    new LastMeadowDiscordLauncher(config, log),
    new ActivitySurfaceResolver(config, log),
    log,
  );
}
