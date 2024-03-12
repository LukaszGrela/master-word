import { FC } from 'react';

import IconGrade, { TGrade } from '../icons/IconGrade';
import { IProps } from './types';
import { classNames } from '../../utils/classNames';

import './Stars.scss';

const Stars: FC<IProps> = ({ score }) => {
  let grade1: TGrade = 'zero';
  let grade2: TGrade = 'zero';
  let grade3: TGrade = 'zero';

  if (score > 0 && score < 1) {
    grade1 = 'half';
  }
  if (score >= 1) {
    grade1 = 'full';
  }

  if (score > 1 && score < 2) {
    grade2 = 'half';
  }
  if (score >= 2) {
    grade2 = 'full';
  }

  if (score > 2 && score < 3) {
    grade3 = 'half';
  }
  if (score >= 3) {
    grade3 = 'full';
  }

  return (
    <div className="stars">
      <IconGrade
        className={classNames(grade1 !== 'zero' && 'gold', 'size-medium')}
        grade={grade1}
      />
      <IconGrade
        className={classNames(grade2 !== 'zero' && 'gold', 'size-large')}
        grade={grade2}
      />
      <IconGrade
        className={classNames(grade3 !== 'zero' && 'gold', 'size-medium')}
        grade={grade3}
      />
    </div>
  );
};

export default Stars;
