export * from './types';
import { default as gameRoutes } from './game.routes';
import { default as backendDictionaryRoutes } from './backend/dictionary';
import { default as backendConfigRoutes } from './backend/config.routes';
import { default as frontendConfigRoutes } from './frontend/config.routes';
export {
  gameRoutes,
  backendDictionaryRoutes,
  frontendConfigRoutes,
  backendConfigRoutes,
};
