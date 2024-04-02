import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconGrade, TGrade } from './IconGrade';

describe('game', () => {
  describe('icons', () => {
    describe('IconGrade', () => {
      it('Renders with required props', () => {
        const { container } = render(<IconGrade />);

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props - grade zero', () => {
        const { container } = render(
          <IconGrade className="test" grade="zero" />,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props - grade half', () => {
        const { container } = render(
          <IconGrade className="test" grade="half" />,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props - grade full', () => {
        const { container } = render(
          <IconGrade className="test" grade="full" />,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with all props - grade invalid', () => {
        const { container } = render(
          <IconGrade className="test" grade={'invalid' as unknown as TGrade} />,
        );

        expect(container).toMatchSnapshot();
      });
    });
  });
});
