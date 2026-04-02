import type { Page } from "playwright";
import type { AppConfig } from "../../config/index";
import type { UISurface } from "../../domain/types";
import type { Logger } from "../../logging/logger";
import { activitySurfaceHasEntryPoint } from "../../ui/last-meadow.selectors";
import { sleep } from "../../util/sleep";

/**
 * Encontra o documento (página ou iframe) onde a atividade desenha Start/Continue Game.
 */
export class ActivitySurfaceResolver {
  constructor(
    private readonly config: AppConfig,
    private readonly log: Logger,
  ) {}

  async resolve(page: Page): Promise<UISurface> {
    const { activitySurfaceResolve: maxMs, pollInterval } = this.config.timeouts;
    const deadline = Date.now() + maxMs;
    let lastProgressLog = 0;

    this.log.debug(
      `SurfaceResolver: início (até ${maxMs}ms, poll ${pollInterval}ms), url=${page.url()}`,
    );

    while (Date.now() < deadline) {
      const now = Date.now();
      if (now - lastProgressLog >= 10_000) {
        lastProgressLog = now;
        const secLeft = Math.max(0, Math.round((deadline - now) / 1000));
        this.log.debug(
          `SurfaceResolver: à procura… ~${secLeft}s restantes, frames=${page.frames().length}, url=${page.url()}`,
        );
      }

      if (await activitySurfaceHasEntryPoint(page)) {
        this.log.debug("SurfaceResolver: entrada na página principal");
        return page;
      }
      for (const frame of page.frames()) {
        if (frame === page.mainFrame()) continue;
        if (await activitySurfaceHasEntryPoint(frame)) {
          this.log.debug(`SurfaceResolver: entrada num iframe (${frame.url() || "sem url"})`);
          return frame;
        }
      }
      await sleep(pollInterval);
    }

    throw new Error(
      'Timeout: entrada da atividade (Start/Continue ou Iniciar/Continuar jogo) não apareceu na página nem nos iframes.',
    );
  }
}
