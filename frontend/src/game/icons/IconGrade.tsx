/*
   Copyright 2024 Łukasz 'Severiaan' Grela GrelaDesign

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { FC } from 'react';
import { classNames } from '../../utils/classNames';
import { IProps } from './types';

export type TGrade = 'zero' | 'half' | 'full';

export const IconGrade: FC<IProps & { grade?: TGrade }> = ({
  className,
  grade = 'full',
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      height='24'
      viewBox='0 -960 960 960'
      width='24'
      className={classNames('grade-icon', className, grade)}
    >
      {grade === 'zero' && (
        <path d='m354-247 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Zm247-350Z' />
      )}
      {grade === 'half' && (
        <path d='m480-323 126 77-33-144 111-96-146-13-58-136v312ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Z' />
      )}
      {grade === 'full' && (
        <path d='m233-80 65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Z' />
      )}
    </svg>
  );
};

export default IconGrade;
