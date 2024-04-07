import React from 'react';
import { classNames } from '@repo/utils';
import { getFlag } from '@repo/shared-ui';
import { ILetter } from './types';
import { EditIcon } from '../icons/EditIcon';
import { LANGUAGE } from '..';
import './Letter.scss';

const Letter: React.FC<ILetter> = ({
  className,
  letter,
  language = LANGUAGE,
  ...testId
}): JSX.Element => {
  const cn = classNames('letter', className);

  return (
    <div className={cn} {...testId}>
      <span className="flag">
        <span className="flag-wrapper">{getFlag(language)}</span>
      </span>
      <span className="icon">
        <EditIcon />
      </span>
      <span className="container">{letter}</span>
    </div>
  );
};

export default Letter;
