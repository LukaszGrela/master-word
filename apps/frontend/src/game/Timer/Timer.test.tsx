import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, act } from '@testing-library/react';

import Timer from './Timer';

describe('game', () => {
  describe('Timer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(1979, 5, 13));
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    it('Renders with no props', () => {
      const { container } = render(<Timer />);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(container).toMatchSnapshot();
    });
    it('Renders with preset time - now', () => {
      const { container } = render(<Timer startMs={new Date().getTime()} />);

      act(() => {
        vi.advanceTimersByTime(10);
      });

      expect(container).toMatchSnapshot();
    });
    it('Renders with preset time - 7sec', () => {
      const { container } = render(
        <Timer startMs={new Date().getTime() - 3000} />,
      );

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(container).toMatchSnapshot();
    });
    it('Renders with preset time - over a minute', () => {
      const { container } = render(
        <Timer startMs={new Date().getTime() - 67000} />,
      );

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(container).toMatchSnapshot();
    });
    it('Renders with preset time - over an hour', () => {
      const { container } = render(
        <Timer startMs={new Date().getTime() - 3607000} />,
      );

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(container).toMatchSnapshot();
    });
  });
});
