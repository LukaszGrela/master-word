import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import Letter from './Letter';

describe('game', () => {
  describe('cell', () => {
    describe('Letter', () => {
      it('Renders with no props', () => {
        const { container } = render(<Letter />);

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props', () => {
        const { container } = render(
          <Letter className="test" language="en" letter="E" />,
        );

        expect(container).toMatchSnapshot();
      });
    });
  });
});
