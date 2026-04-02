import { ExtendedClient } from "../../types";
import { Feature } from "../../handlers/featureHandler";
import { logger } from "../../utils/logger";

const feature: Feature = {
  name: "last-meadow",
  initialize: async (_client: ExtendedClient) => {
    logger.info("Feature Last Meadow: usa /lastmeadow para abrir o formulário.");
  },
};

export default feature;
