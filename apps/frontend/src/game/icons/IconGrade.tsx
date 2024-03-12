import { FC } from 'react';
import { classNames } from '@repo/utils';
import { IProps } from './types';

export type TGrade = 'zero' | 'half' | 'full';

export const IconGrade: FC<IProps & { grade?: TGrade }> = ({
  className,
  grade = 'full',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      className={classNames('grade-icon', className, grade)}
    >
      {grade === 'zero' && (
        <path d="m354-247 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Zm247-350Z" />
      )}
      {grade === 'half' && (
        <path d="m480-323 126 77-33-144 111-96-146-13-58-136v312ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Z" />
      )}
      {grade === 'full' && (
        <path d="m233-80 65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Z" />
      )}
    </svg>
  );
};

export default IconGrade;
