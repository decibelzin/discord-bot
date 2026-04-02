import { readdirSync } from 'fs';
import { join } from 'path';
import { BotFeatureModule, ExtendedClient } from "../types";
import { logger } from "../utils/logger";

export type Feature = BotFeatureModule & Record<string, unknown>;

export async function loadFeatures(client: ExtendedClient): Promise<void> {
  client.features = new Map();
  const featuresPath = join(__dirname, '../features');
  
  try {
    const featureDirs = readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const dir of featureDirs) {
      const featurePath = join(featuresPath, dir, 'index.ts');
      try {
        const feature: Feature = await import(featurePath).then(m => m.default || m);
        
        if ('name' in feature && 'initialize' in feature) {
          client.features.set(feature.name, feature);
          await feature.initialize(client);
          logger.info(`Feature carregada: ${feature.name}`);
        } else {
          logger.warn(`A feature em ${dir} está faltando propriedades obrigatórias.`);
        }
      } catch (error) {
        // Tentar carregar index.js se index.ts não existir
        const featurePathJs = join(featuresPath, dir, 'index.js');
        try {
          const feature: Feature = await import(featurePathJs).then(m => m.default || m);
          if ('name' in feature && 'initialize' in feature) {
            client.features.set(feature.name, feature);
            await feature.initialize(client);
            logger.info(`Feature carregada: ${feature.name}`);
          }
        } catch (jsError) {
          logger.warn(`Não foi possível carregar a feature ${dir}`);
        }
      }
    }
  } catch (error) {
    logger.error('Erro ao carregar features:', error as Error);
  }
}
