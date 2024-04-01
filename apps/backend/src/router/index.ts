export * from './types';
import { default as gameRoutes } from './game.routes';
import { default as backendDictionaryRoutes } from './backend/dictionary';
import { default as backendConfigRoutes } from './backend/config.routes';
import { default as frontendConfigRoutes } from './frontend/config.routes';
import { default as frontendGameRoutes } from './frontend/gameplay.routes';
export {
  gameRoutes,
  backendDictionaryRoutes,
  backendConfigRoutes,
  frontendConfigRoutes,
  frontendGameRoutes,
};
