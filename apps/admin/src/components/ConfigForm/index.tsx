import { FC, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import CardActions from '@mui/material/CardActions';
import Clear from '@mui/icons-material/Clear';
import Save from '@mui/icons-material/Save';
import SettingsBackupRestore from '@mui/icons-material/SettingsBackupRestore';

import { IProps } from './types';
import {
  useAppDispatch,
  useAppSelector,
  useConfigFormEntry,
} from '../../store/hooks';
import { NumberListForm } from './dataTypes/NumberListForm';
import { TConfigEntryKey } from '@repo/backend-types/db';
import { LanguageListForm } from './dataTypes/LanguageListForm';
import { IconButtonWithTooltip } from '../IconButtonWithTooltip';
import {
  resetConfigValue,
  resetFlag,
  setDefaultValue,
} from '../../store/slices/config-form';
import { usePostConfigurationValueMutation } from '../../store/slices/api/slice.config';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

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

const usePostConfiguration = (
  configKey: TConfigEntryKey,
): [
  () => void,
  {
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    isUninitialized: boolean;
    error?: FetchBaseQueryError | SerializedError;
  },
] => {
  const dispatch = useAppDispatch();
  const configEntry = useConfigFormEntry(configKey);

  const [post, { isError, isSuccess, isLoading, isUninitialized, error }] =
    usePostConfigurationValueMutation();

  const setConfigValue = useCallback(async () => {
    if (configEntry) {
      // reset flags of the saved entry
      dispatch(resetFlag(configEntry.key));
      return post(configEntry).unwrap();
    }
  }, [configEntry, dispatch, post]);

  return [
    setConfigValue,
    { isError, isSuccess, isLoading, isUninitialized, error },
  ];
};

export const ConfigForm: FC<IProps> = ({ configKey }) => {
  const dispatch = useAppDispatch();
  const [setConfigValue, { isLoading }] = usePostConfiguration(configKey);

  const sourceValuesKey = useAppSelector(
    (state) => state.configForm.forms[configKey]?.sourceValuesKey || 'none',
  );
  const value = useAppSelector(
    (state) => state.configForm.forms[configKey]?.value,
  );
  const isModified = useAppSelector(
    (state) => state.configForm.forms[configKey]?.isModified,
  );
  const isNew = useAppSelector(
    (state) => state.configForm.forms[configKey]?.isNew,
  );
  const hasDefaultsTo = useAppSelector(
    (state) => !!state.configForm.forms[configKey]?.defaultsTo,
  );

  const adminLabel = labels[configKey];

  const handleSave = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_configKey: TConfigEntryKey) => () => {
      setConfigValue();
    },
    [setConfigValue],
  );
  const handleReset = useCallback(
    (configKey: TConfigEntryKey) => () => {
      dispatch(resetConfigValue(configKey));
    },
    [dispatch],
  );
  const handleApplyDefault = useCallback(
    (configKey: TConfigEntryKey) => () => {
      dispatch(setDefaultValue(configKey));
    },
    [dispatch],
  );

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
            <NumberListForm configKey={configKey} />
          )}
        {Array.isArray(value) &&
          (configKey === 'enabledLanguages' ||
            configKey === 'supportedLanguages') && (
            <LanguageListForm configKey={configKey} />
          )}
      </CardContent>

      <CardActions disableSpacing>
        <IconButtonWithTooltip
          tooltipProps={{
            title: 'Save',
          }}
          buttonProps={{
            color: 'primary',
            size: 'small',
            onClick: handleSave(configKey),
            disabled: (!isModified && !isNew) || isLoading,
          }}
        >
          <Save />
        </IconButtonWithTooltip>

        <IconButtonWithTooltip
          tooltipProps={{
            title: 'Reset',
          }}
          buttonProps={{
            color: 'error',
            size: 'small',
            onClick: handleReset(configKey),
            disabled: (!isModified && !isNew) || isLoading,
          }}
        >
          <Clear />
        </IconButtonWithTooltip>

        <IconButtonWithTooltip
          tooltipProps={{
            title: 'Apply defaults',
          }}
          buttonProps={{
            color: 'warning',
            size: 'small',
            onClick: handleApplyDefault(configKey),
            disabled: !hasDefaultsTo || isLoading,
          }}
        >
          <SettingsBackupRestore />
        </IconButtonWithTooltip>
      </CardActions>
    </Card>
  );
};
