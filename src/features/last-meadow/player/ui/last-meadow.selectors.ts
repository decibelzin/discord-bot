import type { UISurface } from "../domain/types";

/** Rótulos conhecidos (en + pt-BR) para a entrada Start/Continue da atividade. */
export const LastMeadowStrings = {
  startGame: /^(Start Game|Iniciar jogo)$/,
  continueGame: /^(Continue Game|Continuar jogo)$/,
} as const;

const adventureLabel = /^(Adventure|Aventura)$/;
const nextLabel = /^(Next|Próximo)$/;
const startAfterTutorialLabel = /^(Start|Iniciar|Começar)$/;

/**
 * Localizadores do jogo embutido. Classes usam prefixo parcial por causa de hashes do bundler.
 */
export function lastMeadowLocators(surface: UISurface) {
  return {
    startGame: () => surface.getByText(LastMeadowStrings.startGame),
    continueGame: () => surface.getByText(LastMeadowStrings.continueGame),
    /**
     * Botão real da linha da atividade: `div[role=button].clickable__` dentro de
     * `activityButton__` (não o `container__` interno). Evita `.filter(has: img)` em
     * qualquer `div` — isso casava ancestrais grandes e o `.first()` errava o alvo.
     */
    adventure: () =>
      surface
        .locator("div[class*='activityButton__']")
        .locator("[role='button']")
        .filter({
          has: surface.locator("div[class*='activityButtonText']").filter({ hasText: adventureLabel }),
        })
        .or(surface.getByRole("button", { name: adventureLabel })),
    nextVisible: () =>
      surface.locator("div[class*='visibleText']").filter({ hasText: nextLabel }),
    nextHidden: () =>
      surface.locator("div[class*='hiddenText']").filter({ hasText: nextLabel }),
    paladinCard: () =>
      surface
        .locator("div[class*='classContainer']")
        .filter({ has: surface.getByAltText(/^(Paladin|Paladino)$/i) }),
    scholarCard: () =>
      surface
        .locator("div[class*='classContainer']")
        .filter({ has: surface.getByAltText(/^(Scholar|Erudito|Estudioso)$/i) }),
    startAfterTutorial: () =>
      surface.locator("div[class*='visibleText']").filter({ hasText: startAfterTutorialLabel }),
    /** Nível na HUD (geralmente dentro de `foreignObject` no SVG). */
    levelDisplay: () =>
      surface
        .locator("foreignObject div[class*='levelText']")
        .or(surface.locator("div[class*='levelText']"))
        .first(),
  };
}

async function entryPointVisible(surface: UISurface): Promise<boolean> {
  const L = lastMeadowLocators(surface);
  const a = await L.startGame().isVisible().catch(() => false);
  const b = await L.continueGame().isVisible().catch(() => false);
  return a || b;
}

export async function activitySurfaceHasEntryPoint(surface: UISurface): Promise<boolean> {
  return entryPointVisible(surface);
}
