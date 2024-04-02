import { describe, expect, it, vi } from 'vitest';
import {
  contextRenderer,
  defaultLanguageContext,
} from '../../i18n/LanguageContext/__tests__/contextRenderer';

import HighScoreLabel from './HighScoreLabel';

describe('game', () => {
  describe('HighScoreLabel', () => {
    it('Renders with no props', () => {
      const { container } = contextRenderer(<HighScoreLabel />);

      expect(container).toMatchSnapshot();
    });
    it('Renders with context', () => {
      const { container } = contextRenderer(<HighScoreLabel />, {
        languageContext: {
          ...defaultLanguageContext,
          getUIText: vi.fn().mockReturnValue('New Highscore'),
        },
        renderOptions: {},
      });

      expect(container).toMatchSnapshot();
    });
  });
});
