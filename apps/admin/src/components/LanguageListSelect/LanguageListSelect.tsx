import { FC, useCallback, useMemo } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { getFlag } from '@repo/shared-ui';
import { useAppDispatch, useConfigState } from '../../store/hooks';
import { ILanguageSelectorOption } from '../../types';
import { IProps } from './types';
import { setLanguage } from '../../store/slices/config';

export const LanguageListSelect: FC<IProps> = ({
  selectStyleProps,
  onChange,
  disabled,
}) => {
  const { selectedLanguage, supportedLanguages } = useConfigState();

  const languageList = useMemo(() => {
    return supportedLanguages
      .map((language): ILanguageSelectorOption => ({
        value: language,
        label: language.toUpperCase(),
        flag: getFlag(language),
      }))
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

  const dispatch = useAppDispatch();

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent) => {
      const language = e.target.value;

      dispatch(setLanguage(language));
      onChange?.(language);
    },
    [onChange, dispatch],
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
