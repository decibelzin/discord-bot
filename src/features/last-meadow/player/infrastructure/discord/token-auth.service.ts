import type { Page } from "playwright";
import type { AppConfig } from "../../config/index";
import type { Logger } from "../../logging/logger";
import { sleep } from "../../util/sleep";

const DISCORD_HOST = /discord\.com/i;

/** Após o reload, abrimos a app para o cliente ler a sessão. */
const DISCORD_APP_URL = "https://discord.com/channels/@me";

/** Duração do “spam” de iframes (ms), alinhado ao userscript típico. */
const IFRAME_PULSE_MS = 2500;

/**
 * Autenticação no cliente web do Discord via token (localStorage).
 */
export class DiscordTokenAuthService {
  constructor(
    private readonly config: AppConfig,
    private readonly log: Logger,
  ) {}

  async signIn(page: Page): Promise<void> {
    const navTimeout = 60_000;
    const token = this.config.discordToken;
    const storageValue = JSON.stringify(token);
    this.log.debug(
      `Auth: signIn início (token.length=${token.length}, loginUrl=${this.config.discordLoginUrl})`,
    );

    this.log.debug("Auth: goto discord.com/ …");
    await page.goto("https://discord.com/", { waitUntil: "load", timeout: navTimeout });
    this.log.debug(`Auth: após discord.com url=${page.url()}`);

    this.log.debug("Auth: goto login …");
    await page.goto(this.config.discordLoginUrl, { waitUntil: "load", timeout: navTimeout });
    this.log.debug(`Auth: após login url=${page.url()}`);

    this.log.debug("Auth: waitForURL discord host…");
    await page.waitForURL(DISCORD_HOST, { timeout: navTimeout });
    await page.waitForSelector("body", { state: "attached", timeout: navTimeout });
    await sleep(500);
    this.log.debug("Auth: body OK, iframe localStorage pulse…");

    // Função inline: evita `__name` injetado pelo tsx/esbuild em funções nomeadas (quebra no browser).
    await page.evaluate(
      ({ storageValue: sv, pulseMs }: { storageValue: string; pulseMs: number }) => {
        const intervalId = window.setInterval(() => {
          const iframe = document.createElement("iframe");
          document.body.appendChild(iframe);
          const win = iframe.contentWindow;
          if (!win) return;
          try {
            const ls = win.localStorage;
            ls.setItem("token", sv);
            (ls as unknown as { token: string }).token = sv;
          } catch {
            /* ignore */
          }
        }, 50);
        window.setTimeout(() => window.clearInterval(intervalId), pulseMs);
      },
      { storageValue, pulseMs: IFRAME_PULSE_MS },
    );
    await sleep(IFRAME_PULSE_MS + 150);
    this.log.debug("Auth: pulse terminado, reload…");

    await page.reload({ waitUntil: "load", timeout: navTimeout });
    this.log.debug(`Auth: após reload url=${page.url()}`);

    this.log.debug(`Auth: goto ${DISCORD_APP_URL} …`);
    await page.goto(DISCORD_APP_URL, { waitUntil: "load", timeout: navTimeout });
    this.log.debug(`Auth: fim signIn url=${page.url()}`);

    if (/\/login/i.test(page.url())) {
      throw new Error(
        "Continua em /login após o truque do iframe + reload. Confirma o token de utilizador (não bot), sem aspas extra no .env, e se o Discord não está a pedir captcha/verificação neste browser.",
      );
    }
  }
}
