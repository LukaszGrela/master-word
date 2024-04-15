import { describe, expect, it, vi } from 'vitest';
import {
  contextRenderer,
} from '../../../context/__tests__/contextRenderer';
import { LoadingPanel } from './LoadingPanel';
import { MockContext } from '../../../../i18n/LanguageContext/__tests__/contextRenderer';

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        describe('LoadingPanel', () => {
          it('renders loading off', () => {
            const { container } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(() => 'LOADING'),
                }}
              >
                <LoadingPanel />
              </MockContext>,
              {
                context: {
                  loading: false,
                },
              },
            );

            expect(container).toMatchSnapshot();
          });
          it('renders loading on', () => {
            const { container } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(() => 'LOADING'),
                }}
              >
                <LoadingPanel />
              </MockContext>,
              {
                context: {
                  loading: true,
                },
              },
            );

            expect(container).toMatchSnapshot();
          });
        });
      });
    });
  });
});
