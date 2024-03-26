import { FC } from 'react';
import { IProps } from './types';

export const FlagEsperanto: FC<IProps> = ({
  className,
  width = '300',
  height = '221',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.0"
    viewBox="0 0 600 400"
    id="experanto"
    className={className}
    width={width}
    height={height}
  >
    <path d="m0,0h202v202H0" fill="#FFF" />
    <path
      d="m0,200H200V0H600V400H0m58-243 41-126 41,126-107-78h133"
      fill="#090"
    />
  </svg>
);
