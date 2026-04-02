import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import type { AppConfig } from "../config/index";
import type { Logger } from "../logging/logger";

/** UA sem “HeadlessChrome” para reduzir bloqueios no cliente web do Discord. */
const CHROME_DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Ciclo de vida do browser Playwright (um contexto, uma página por sessão).
 */
export class BrowserSession {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async newPage(config: AppConfig, log: Logger): Promise<Page> {
    log.debug(
      `Playwright: a iniciar chromium.launch (headless=${config.headless}, viewport=${config.viewport.width}x${config.viewport.height})`,
    );
    try {
      this.browser = await chromium.launch({
        headless: config.headless,
        args: ["--disable-blink-features=AutomationControlled"],
      });
      log.debug("Playwright: browser lançado, a criar contexto…");
    } catch (e) {
      log.error("Playwright: falha em chromium.launch", e);
      throw e;
    }

    this.context = await this.browser.newContext({
      viewport: config.viewport,
      userAgent: CHROME_DESKTOP_UA,
      locale: "en-US",
      timezoneId: "Europe/Lisbon",
    });
    log.debug("Playwright: contexto criado, nova página…");
    const page = await this.context.newPage();
    log.debug(`Playwright: página pronta (url inicial: ${page.url() || "(vazio)"})`);
    return page;
  }

  async dispose(log: Logger): Promise<void> {
    log.debug("Playwright: a fechar browser…");
    if (this.browser?.isConnected()) {
      await this.browser.close();
    }
    this.browser = null;
    this.context = null;
    log.debug("Playwright: browser fechado.");
  }
}
