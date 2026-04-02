import type { Page } from "playwright";
import type { AppConfig } from "../../config/index";
import type { Logger } from "../../logging/logger";

/**
 * Abre a atividade "Last Meadow" a partir da UI do Discord (barra lateral / launcher).
 */
export class LastMeadowDiscordLauncher {
  constructor(
    private readonly config: AppConfig,
    private readonly log: Logger,
  ) {}

  async openFromDiscordUi(page: Page): Promise<void> {
    this.log.debug(
      `Launcher: à espera do botão "${this.config.lastMeadowActivityLabel}" (timeout ${this.config.timeouts.lastMeadowButton}ms)…`,
    );
    const button = page.getByRole("button", { name: this.config.lastMeadowActivityLabel });
    await button.waitFor({ state: "visible", timeout: this.config.timeouts.lastMeadowButton });
    this.log.debug("Launcher: botão visível, click…");
    await button.click();
    this.log.debug("Launcher: click enviado");
  }
}
