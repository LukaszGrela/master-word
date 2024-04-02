import { describe, expect, it } from 'vitest';
import Stars from './index';
import { render } from '@testing-library/react';

describe('game', () => {
  describe('Stars', () => {
    it.each([0, 0.75, 1, 1.25, 2, 2.5, 3, 42])('Renders score %s', (score) => {
      const { container } = render(<Stars score={score} />);

      expect(container).toMatchSnapshot();
    });
  });
});
