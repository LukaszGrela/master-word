import { ConfigProvider } from './config';
import { GameRouter } from './game/routes/GameRouter';
import { LanguageProvider } from './i18n';

export const App = () => {
  return (
    <ConfigProvider>
      <LanguageProvider>
        <GameRouter />
      </LanguageProvider>
    </ConfigProvider>
  );
};
