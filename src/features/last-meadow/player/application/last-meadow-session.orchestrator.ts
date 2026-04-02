import type { Page } from "playwright";
import type { AppConfig } from "../config/index";
import { detectActivityEntryKind } from "../domain/activity-entry";
import { runNeverPlayedFlow } from "../flows/never-played.flow";
import { runReturningPlayerFlow } from "../flows/returning.flow";
import { ActivitySurfaceResolver } from "../infrastructure/playwright/activity-surface.resolver";
import { LastMeadowDiscordLauncher } from "../infrastructure/discord/last-meadow-launcher";
import { DiscordTokenAuthService } from "../infrastructure/discord/token-auth.service";
import type { Logger } from "../logging/logger";

/**
 * Orquestra o pipeline: autenticar → abrir atividade → resolver superfície → fluxo de jogo.
 */
export class LastMeadowSessionOrchestrator {
  constructor(
    private readonly config: AppConfig,
    private readonly auth: DiscordTokenAuthService,
    private readonly discordLauncher: LastMeadowDiscordLauncher,
    private readonly surfaceResolver: ActivitySurfaceResolver,
    private readonly log: Logger,
  ) {}

  async run(page: Page): Promise<void> {
    this.log.debug("Orchestrator: signIn (token)…");
    await this.auth.signIn(page);
    this.log.debug(`Orchestrator: signIn OK, URL=${page.url()}`);

    this.log.debug("Orchestrator: openFromDiscordUi (Last Meadow)…");
    await this.discordLauncher.openFromDiscordUi(page);
    this.log.debug(`Orchestrator: launcher OK, URL=${page.url()}`);

    this.log.debug("Orchestrator: a resolver superfície da atividade…");
    const surface = await this.surfaceResolver.resolve(page);
    this.log.debug("Orchestrator: superfície resolvida");

    const entry = await detectActivityEntryKind(surface);

    this.log.info(
      entry === "continue"
        ? "Entrada da atividade: Continue Game (conta existente)."
        : "Entrada da atividade: Start Game (primeira vez ou sem save visível).",
    );

    if (entry === "continue") {
      await runReturningPlayerFlow(surface, this.config, this.log);
    } else {
      await runNeverPlayedFlow(surface, this.config, this.log);
    }
  }
}
