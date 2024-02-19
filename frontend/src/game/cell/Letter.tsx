import React from 'react';
import { classNames } from '../../utils/classNames';
import { ILetter } from './types';
import './Letter.css';
import { EditIcon } from '../icons/EditIcon';

const Letter: React.FC<ILetter> = ({ className, letter }): JSX.Element => {
  const cn = classNames('letter', className);
  return (
    <div className={cn}>
      <span className='icon'>
        <EditIcon />
      </span>
      <span className='container'>{letter}</span>
    </div>
  );
};

export default Letter;
