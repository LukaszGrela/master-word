import { FC } from 'react';
import { IProps } from './types';
import { FlagEsperanto, FlagSPQR } from '../icons';

export const FlagIcon: FC<IProps> = ({ countryCode }) => {
  if (countryCode === 'spqr') {
    return <FlagSPQR width={20} height={14} />;
  }
  if (countryCode === 'esperanto') {
    return <FlagEsperanto width={20} height={14} />;
  }
  return (
    <img
      loading="lazy"
      width="20"
      srcSet={`https://flagcdn.com/w40/${countryCode}.png 2x`}
      src={`https://flagcdn.com/w20/${countryCode}.png`}
      alt=""
    />
  );
};
