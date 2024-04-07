import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { EditIcon } from './EditIcon';

describe('game', () => {
  describe('icons', () => {
    describe('EditIcon', () => {
      it('Renders with required props', () => {
        const { container } = render(<EditIcon />);

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props', () => {
        const { container } = render(<EditIcon className="test" />);

        expect(container).toMatchSnapshot();
      });
    });
  });
});
