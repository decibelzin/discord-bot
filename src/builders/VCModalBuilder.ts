import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { LIMITS, createDynamicId } from '../constants';

export class VCModalBuilder {
  static buildUserLimitModal(channelId: string, currentLimit?: number) {
    const modal = new ModalBuilder()
      .setCustomId(createDynamicId.modalLimit(channelId))
      .setTitle('Limite de Usuários');
    
    const limitInput = new TextInputBuilder()
      .setCustomId('user_limit_value')
      .setLabel('Limite de usuários (0 = ilimitado)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite um número entre 0 e 99...')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(2);
    
    if (currentLimit !== undefined) {
      limitInput.setValue(currentLimit.toString());
    }
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(limitInput)
    );
    
    return modal;
  }
  
  static buildStatusModal(channelId: string, currentStatus?: string) {
    const modal = new ModalBuilder()
      .setCustomId(createDynamicId.modalStatus(channelId))
      .setTitle('Status da Call');
    
    const statusInput = new TextInputBuilder()
      .setCustomId('channel_status')
      .setLabel('Status do canal de voz')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Digite o status do canal (ex: "Jogando Valorant")...')
      .setRequired(false)
      .setMaxLength(LIMITS.VOICE_CHANNEL.STATUS_MAX_LENGTH);
    
    if (currentStatus) {
      statusInput.setValue(currentStatus);
    }
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(statusInput)
    );
    
    return modal;
  }
  
  static buildRenameModal(channelId: string, currentName?: string) {
    const modal = new ModalBuilder()
      .setCustomId(createDynamicId.modalRename(channelId))
      .setTitle('Renomear Canal');
    
    const nameInput = new TextInputBuilder()
      .setCustomId('channel_name')
      .setLabel('Novo nome do canal')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite o novo nome...')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(LIMITS.VOICE_CHANNEL.NAME_MAX_LENGTH);
    
    if (currentName) {
      nameInput.setValue(currentName);
    }
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput)
    );
    
    return modal;
  }
  
  static buildBitrateModal(channelId: string, currentBitrate?: number) {
    const modal = new ModalBuilder()
      .setCustomId(createDynamicId.modalBitrate(channelId))
      .setTitle('Ajustar Bitrate');
    
    const bitrateInput = new TextInputBuilder()
      .setCustomId('bitrate_value')
      .setLabel('Bitrate em kbps')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite o bitrate (ex: 64)...')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(3);
    
    if (currentBitrate) {
      bitrateInput.setValue((currentBitrate / 1000).toString());
    }
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(bitrateInput)
    );
    
    return modal;
  }
  
  static buildRegionModal(channelId: string, currentRegion?: string) {
    const modal = new ModalBuilder()
      .setCustomId(createDynamicId.modalRegion(channelId))
      .setTitle('Região do Canal');
    
    const regionInput = new TextInputBuilder()
      .setCustomId('region_value')
      .setLabel('Código da região (ex: brazil, us-east)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite o código da região ou deixe em branco para automático...')
      .setRequired(false)
      .setMaxLength(50);
    
    if (currentRegion) {
      regionInput.setValue(currentRegion);
    }
    
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(regionInput)
    );
    
    return modal;
  }
}
