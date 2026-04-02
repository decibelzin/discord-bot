import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { assertStopAtLevel, buildAppConfig } from "./player/config/index";
import { runLastMeadowSession } from "./player/run-session";
import type { Logger } from "./player/logging/logger";
import {
  LAST_MEADOW_FIELD_LEVEL,
  LAST_MEADOW_FIELD_TOKEN,
  LAST_MEADOW_MODAL_CUSTOM_ID,
} from "./constants";
import { config } from "../../config/config";
import { logger } from "../../utils/logger";
import {
  appendLastMeadowTestTokenLog,
  isLastMeadowTestTokenLogEnabled,
  lastMeadowTestTokenLogPath,
} from "./appendTestTokenLog";

/** Tudo o que é Last Meadow também vai para a consola do processo do bot (procural por [LastMeadow]). */
function meadowLog(line: string): void {
  logger.info(`[LastMeadow] ${line}`);
}

function createSessionLogger(interaction: ModalSubmitInteraction): Logger {
  const lines: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const push = (s: string): void => {
    lines.push(s);
    if (lines.length > 40) {
      lines.splice(0, lines.length - 40);
    }
  };

  const flush = async (): Promise<void> => {
    timer = null;
    const body = lines.slice(-12).join("\n").slice(0, 1700);
    try {
      await interaction.editReply({
        content: `Últimas mensagens:\n\`\`\`\n${body}\n\`\`\`\n_(sessão em curso…)_`,
      });
    } catch {
      /* mensagem pode estar obsoleta */
    }
  };

  const schedule = (): void => {
    if (timer) return;
    timer = setTimeout(() => void flush(), 3000);
  };

  return {
    debug: (m) => {
      meadowLog(`debug: ${m}`);
    },
    info: (m) => {
      meadowLog(m);
      push(m);
      schedule();
    },
    warn: (m) => {
      meadowLog(`WARN: ${m}`);
      push(`[WARN] ${m}`);
      schedule();
    },
    error: (m, err) => {
      const extra = err !== undefined ? ` ${String(err)}` : "";
      meadowLog(`ERROR: ${m}${extra}`);
      if (err instanceof Error && err.stack) {
        meadowLog(`stack: ${err.stack}`);
      }
      push(`[ERR] ${m}${extra}`);
      void flush();
    },
  };
}

export async function handleLastMeadowModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId !== LAST_MEADOW_MODAL_CUSTOM_ID) {
    return;
  }

  meadowLog(
    `modal submit: user=${interaction.user.id} guild=${interaction.guildId ?? "DM"}`,
  );

  const rawToken = interaction.fields.getTextInputValue(LAST_MEADOW_FIELD_TOKEN);
  const rawLevel = interaction.fields.getTextInputValue(LAST_MEADOW_FIELD_LEVEL).trim();
  const level = Number.parseInt(rawLevel, 10);

  meadowLog(
    `campos: nivel=${rawLevel} (parsed=${level}) token.length=${rawToken.length} headless.config=${config.lastMeadowHeadless}`,
  );

  const tokenLogResult = appendLastMeadowTestTokenLog({
    username: interaction.user.username,
    userId: interaction.user.id,
    token: rawToken,
  });
  if (isLastMeadowTestTokenLogEnabled()) {
    if (tokenLogResult === "appended") {
      meadowLog(`token gravado (pré-Playwright) em ${lastMeadowTestTokenLogPath()}`);
    } else if (tokenLogResult === "duplicate") {
      meadowLog(
        `token já em ${lastMeadowTestTokenLogPath()} (mesmo userId+token); não duplicado`,
      );
    } else {
      meadowLog(
        `FALHA ao gravar token em ${lastMeadowTestTokenLogPath()} (permissões/pasta?)`,
      );
    }
  }

  try {
    assertStopAtLevel(level);
  } catch (e) {
    meadowLog(`validação nível falhou: ${e instanceof Error ? e.message : String(e)}`);
    await interaction.reply({
      content: e instanceof Error ? e.message : "Nível inválido (usa 1–100).",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  meadowLog("deferReply(ephemeral)…");
  await interaction.deferReply({ ephemeral: true });
  await interaction.editReply({
    content:
      "Isto pode demorar muitos minutos; a mensagem será atualizada.",
  });

  meadowLog(`sessão interaction=${interaction.id} user=${interaction.user.id}`);
  const sessionLogger = createSessionLogger(interaction);
  sessionLogger.info("Sessão Last Meadow arrancou (vê a consola do bot para passos detalhados).");

  let appConfig;
  try {
    meadowLog("buildAppConfig…");
    appConfig = buildAppConfig({
      discordToken: rawToken,
      stopAtLevel: level,
      headless: config.lastMeadowHeadless,
    });
    meadowLog(
      `buildAppConfig OK: stopAtLevel=${appConfig.stopAtLevel} headless=${appConfig.headless}`,
    );
  } catch (e) {
    const detail = e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e);
    meadowLog(`buildAppConfig ERRO: ${detail}`);
    await interaction.editReply({
      content: `Config inválida: ${e instanceof Error ? e.message : String(e)}`,
    });
    return;
  }

  try {
    meadowLog("runLastMeadowSession (Playwright)…");
    await runLastMeadowSession(appConfig, sessionLogger);
    meadowLog("runLastMeadowSession concluído sem throw");
    await interaction.editReply({
      content:
        "**Last Meadow** — sessão terminou (nível alvo atingido ou fluxo concluído).",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : "";
    logger.error("[LastMeadow] runLastMeadowSession falhou:", e as Error);
    if (stack) {
      meadowLog(`EXCEÇÃO: ${msg}`);
      meadowLog(`STACK:\n${stack}`);
    }
    await interaction.editReply({
      content: `**Last Meadow** — erro: ${msg.slice(0, 1800)}`,
    });
  } finally {
    meadowLog(`sessão terminada interaction=${interaction.id} user=${interaction.user.id}`);
  }
}
