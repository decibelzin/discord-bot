import { BrowserSession } from "./application/browser-session";
import { createLastMeadowSessionOrchestrator } from "./application/composition";
import type { AppConfig } from "./config/index";
import type { Logger } from "./logging/logger";

export async function runLastMeadowSession(config: AppConfig, log: Logger): Promise<void> {
  log.debug("runLastMeadowSession: início");
  const browserSession = new BrowserSession();
  try {
    log.debug("runLastMeadowSession: a pedir newPage ao BrowserSession…");
    const page = await browserSession.newPage(config, log);
    log.debug("runLastMeadowSession: página obtida, a criar orchestrator…");
    const orchestrator = createLastMeadowSessionOrchestrator(config, log);
    log.debug("runLastMeadowSession: a executar orchestrator.run…");
    await orchestrator.run(page);
    log.debug("runLastMeadowSession: orchestrator.run terminou");
  } finally {
    await browserSession.dispose(log);
    log.debug("runLastMeadowSession: fim (finally)");
  }
}
