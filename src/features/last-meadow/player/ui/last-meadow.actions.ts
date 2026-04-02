import { LAST_MEADOW_MAX_LEVEL, type AppConfig, type TimeoutConfig } from "../config/index";
import type { UISurface } from "../domain/types";
import type { Logger } from "../logging/logger";
import { sleep } from "../util/sleep";
import { lastMeadowLocators } from "./last-meadow.selectors";

const LEVEL_READ_TIMEOUT_MS = 400;

/**
 * Lê o nível exibido na HUD. Retorna null se o elemento não existir ou o texto não for 1–100.
 */
export async function readPlayerLevel(surface: UISurface): Promise<number | null> {
  const loc = lastMeadowLocators(surface).levelDisplay();
  const visible = await loc.isVisible().catch(() => false);
  if (!visible) return null;
  const raw = await loc.textContent({ timeout: LEVEL_READ_TIMEOUT_MS }).catch(() => null);
  if (raw == null) return null;
  const t = raw.trim();
  const m = /^(\d{1,3})$/.exec(t);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  if (n < 1 || n > LAST_MEADOW_MAX_LEVEL) return null;
  return n;
}

export async function clickAdventureUntilTargetLevel(
  surface: UISurface,
  config: AppConfig,
  log: Logger,
): Promise<void> {
  const { timeouts, stopAtLevel } = config;
  const L = lastMeadowLocators(surface);
  const adv = L.adventure().first();
  await adv.waitFor({ state: "visible", timeout: timeouts.adventureButtonVisible });
  log.info(
    `Clicando em "Adventure" / "Aventura" até o nível ≥ ${stopAtLevel} (HUD). Ctrl+C para parar antes.`,
  );

  let loopI = 0;
  for (;;) {
    loopI += 1;
    const level = await readPlayerLevel(surface);
    if (loopI === 1 || loopI % 25 === 0) {
      log.debug(`loop #${loopI} HUD nível=${level === null ? "null" : String(level)} alvo=${stopAtLevel}`);
    }
    if (level !== null && level >= stopAtLevel) {
      log.info(`Nível ${level} ≥ alvo ${stopAtLevel}. Encerrando loop.`);
      return;
    }

    await L.adventure()
      .first()
      .click({
        timeout: timeouts.adventureClick,
        force: true,
        noWaitAfter: true,
      });
    await sleep(1);
  }
}

async function clickNextVisibleUntilGone(surface: UISurface): Promise<void> {
  const L = lastMeadowLocators(surface);
  for (;;) {
    const n = L.nextVisible().first();
    const visible = await n.isVisible().catch(() => false);
    if (!visible) break;
    await n.click({ timeout: 10_000 });
    await sleep(350);
  }
}

/**
 * Tutorial na primeira abertura do jogo. Se o primeiro "Next" não aparecer, não faz nada.
 */
export async function runFirstLaunchTutorialIfPresent(
  surface: UISurface,
  timeouts: TimeoutConfig,
): Promise<void> {
  const L = lastMeadowLocators(surface);
  const firstNext = L.nextVisible().first();
  const appeared = await firstNext
    .waitFor({ state: "visible", timeout: timeouts.firstTutorialNext })
    .then(() => true)
    .catch(() => false);
  if (!appeared) return;

  await clickNextVisibleUntilGone(surface);

  await L.paladinCard().waitFor({ state: "visible", timeout: timeouts.paladinCard });
  await L.paladinCard().click();

  const nh = L.nextHidden().first();
  await nh.waitFor({ state: "attached", timeout: timeouts.hiddenNextClick });
  await nh.click({ force: true });

  await L.scholarCard().waitFor({ state: "visible", timeout: timeouts.scholarCard });
  await L.scholarCard().click();

  const sv = L.startAfterTutorial().first();
  await sv.waitFor({ state: "visible", timeout: timeouts.startAfterScholar });
  await sv.click();
}
