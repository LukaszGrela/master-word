import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { GrelaDesignIcon } from './GrelaDesignIcon';

describe('game', () => {
  describe('icons', () => {
    describe('GrelaDesignIcon', () => {
      it('Renders with required props', () => {
        const { container } = render(<GrelaDesignIcon />);

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props', () => {
        const { container } = render(<GrelaDesignIcon className="test" />);

        expect(container).toMatchSnapshot();
      });
    });
  });
});
