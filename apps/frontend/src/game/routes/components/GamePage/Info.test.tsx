import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Info } from './Info';

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        describe('Info', () => {
          it('renders', () => {
            const { container } = render(<Info text="Info paragraph" />);
            expect(container).toMatchSnapshot()
          });
        });
      });
    });
  });
});
