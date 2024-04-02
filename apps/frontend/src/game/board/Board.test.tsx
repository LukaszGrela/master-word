import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import Board from './Board';

describe('game', () => {
  describe('board', () => {
    describe('Board', () => {
      it('Renders with required props', () => {
        const { container } = render(<Board columns={2} rows={2} />);

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props', () => {
        const { container } = render(
          <Board columns={2} rows={2} className="test">
            <p>Cell</p>
          </Board>,
        );

        expect(container).toMatchSnapshot();
      });
    });
  });
});
