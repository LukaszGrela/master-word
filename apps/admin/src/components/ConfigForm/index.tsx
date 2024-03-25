import { FC } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { IProps } from './types';
import { useAppSelector } from '../../store/hooks';
import { ListForm } from './dataTypes/ListForm';
import { TConfigEntryKey } from '@repo/backend-types/db';
import { LanguageListForm } from './dataTypes/LanguageListForm';

const labels: Partial<Record<TConfigEntryKey, string>> = {
  enabledLanguages: 'Enabled languages',
  enabledAttempts: 'Enabled attempts',
  enabledLength: 'Enabled word length',
  supportedLanguages: 'Supported languages',
  supportedAttempts: 'Supported attempts',
  supportedLength: 'Supported word length',
};

const printType = (t: unknown): string => {
  if (typeof t !== 'object') {
    return typeof t;
  }
  if (Array.isArray(t)) {
    if (t.length > 0) {
      return `${printType(t[0])}[]`;
    } else {
      return '[]';
    }
  }
  return '';
};

export const ConfigForm: FC<IProps> = ({ configKey }) => {
  const sourceValuesKey = useAppSelector(
    (state) => state.configForm.forms[configKey]?.sourceValuesKey || 'none',
  );
  const value = useAppSelector(
    (state) => state.configForm.forms[configKey]?.value,
  );

  const adminLabel = labels[configKey];

  return (
    <Card className="widget" elevation={3}>
      <CardHeader
        title={adminLabel || configKey}
        subheader={`Type: ${printType(value)}, list source key: ${sourceValuesKey}`}
      />
      <CardContent>
        {Array.isArray(value) &&
          configKey !== 'enabledLanguages' &&
          configKey !== 'supportedLanguages' && (
            <ListForm configKey={configKey} />
          )}
        {Array.isArray(value) &&
          (configKey === 'enabledLanguages' ||
            configKey === 'supportedLanguages') && (
            <LanguageListForm configKey={configKey} />
          )}
      </CardContent>
    </Card>
  );
};
