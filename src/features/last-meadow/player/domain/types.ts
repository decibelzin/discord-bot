import type { Frame, Page } from "playwright";

/** Superfície onde a UI do jogo está (documento principal ou iframe da atividade). */
export type UISurface = Page | Frame;
