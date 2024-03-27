import React from 'react';
import { AppStorage, EStorageKeys, classNames } from '@repo/utils';
import { getFlag } from '@repo/shared-ui';
import { ILetter } from './types';
import { EditIcon } from '../icons/EditIcon';
import { LANGUAGE } from '..';
import './Letter.scss';

const Letter: React.FC<ILetter> = ({ className, letter }): JSX.Element => {
  const cn = classNames('letter', className);
  const language =
    AppStorage.getInstance().getItem(EStorageKeys.GAME_LANGUAGE) || LANGUAGE;

  return (
    <div className={cn}>
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
