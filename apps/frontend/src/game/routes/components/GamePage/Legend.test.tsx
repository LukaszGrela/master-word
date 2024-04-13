import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Legend } from './Legend';

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        describe('Legend', () => {
          it('renders', () => {
            const { container } = render(<Legend 
            correct='Correct'
            incorrect='Incorrect'
            misplaced='Misplaced' />)
            expect(container).toMatchSnapshot()
          });

        });
      });
    });
  });
});
