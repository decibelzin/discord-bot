import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../types";
import { logger } from "../utils/logger";
import {
  LAST_MEADOW_FIELD_LEVEL,
  LAST_MEADOW_FIELD_TOKEN,
  LAST_MEADOW_MODAL_CUSTOM_ID,
} from "../features/last-meadow/constants";

const command: Command = {
  name: "lastmeadow",
  description: "Last Meadow: formulário (token da conta + nível alvo 1–100).",
  execute: async (interaction: ChatInputCommandInteraction) => {
    logger.info(
      `[LastMeadow] /lastmeadow por user=${interaction.user.id} em guild=${interaction.guildId ?? "DM"}`,
    );
    const modal = new ModalBuilder().setCustomId(LAST_MEADOW_MODAL_CUSTOM_ID).setTitle("Last Meadow");

    const tokenInput = new TextInputBuilder()
      .setCustomId(LAST_MEADOW_FIELD_TOKEN)
      .setLabel("Token Discord (conta a upar)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Cole aqui")
      .setRequired(true)
      .setMinLength(20)
      .setMaxLength(120);

    const levelInput = new TextInputBuilder()
      .setCustomId(LAST_MEADOW_FIELD_LEVEL)
      .setLabel("Parar ao atingir este nível (1–100)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex.: 100")
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(3);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(levelInput),
    );

    try {
      await interaction.showModal(modal);
      logger.info("[LastMeadow] showModal enviado ao cliente");
    } catch (e) {
      logger.error("[LastMeadow] showModal falhou:", e as Error);
      throw e;
    }
  },
};

export default command;
