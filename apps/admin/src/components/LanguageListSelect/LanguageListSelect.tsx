import { FC, useCallback, useMemo } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { getFlag } from '@repo/shared-ui';
import { useConfigState } from '../../store/hooks';
import { ILanguageSelectorOption } from '../../types';
import { IProps } from './types';

export const LanguageListSelect: FC<IProps> = ({
  selectStyleProps,
  onChange,
  disabled,
}) => {
  const { selectedLanguage, supportedLanguages } = useConfigState();

  const languageList = useMemo(() => {
    return supportedLanguages
      .map(
        (language): ILanguageSelectorOption => ({
          value: language,
          label: language.toUpperCase(),
          flag: getFlag(language),
        }),
      )
      .map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{ gap: '0.5rem' }}
        >
          {option.flag} {option.label}
        </MenuItem>
      ));
  }, [supportedLanguages]);

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  return (
    <Select
      sx={{
        minWidth: '4rem',
        ...selectStyleProps,
      }}
      disabled={disabled}
      value={selectedLanguage}
      inputProps={{
        name: 'language',
        id: 'language',
      }}
      onChange={handleSelectChange}
    >
      {languageList}
    </Select>
  );
};
