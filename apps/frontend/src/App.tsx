import { GameRouter } from './game/routes/GameRouter';
import { LanguageProvider } from './i18n';

export const App = () => {
  return (
    <LanguageProvider>
      <GameRouter />
    </LanguageProvider>
  );
};
