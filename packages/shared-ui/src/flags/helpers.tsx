import { flagList } from './constants';
import { FlagIcon } from './FlagIcon';

export const getFlag = (language: string): React.ReactNode => (
  <FlagIcon countryCode={flagList[language]} />
);
