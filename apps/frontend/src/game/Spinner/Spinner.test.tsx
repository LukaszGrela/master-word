import { describe, expect, it } from 'vitest';
import Spinner from './Spinner';
import { render } from '@testing-library/react';

describe('game', () => {
  describe('Spinner', () => {
    it('Renders', () => {
      const { container } = render(<Spinner />);

      expect(container).toMatchSnapshot();
    });
    it('Renders with all props', () => {
      const { container } = render(<Spinner className="test" />);

      expect(container).toMatchSnapshot();
    });
  });
});
