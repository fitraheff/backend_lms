import { App } from './Application/app.js';
import { config } from './utils/config.js';
import { logger } from './Application/logging.js';

const PORT = config.port;

App.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${config.env}`);
});