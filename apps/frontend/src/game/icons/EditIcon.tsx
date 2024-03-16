import { FC } from 'react';
import { classNames } from '@repo/utils';
import { IProps } from './types';

export const EditIcon: FC<IProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="48"
      viewBox="0 -960 960 960"
      width="48"
      className={classNames('edit-icon', className)}
    >
      <path d="M167-120q-21 5-36.5-10.5T120-167l40-191 198 198-191 40Zm191-40L160-358l473-473q17-17 42-17t42 17l114 114q17 17 17 42t-17 42L358-160Zm317-628L233-346l113 113 442-442-113-113Z" />
    </svg>
  );
};
