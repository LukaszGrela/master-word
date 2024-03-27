import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { TArrayElementType } from '@repo/common-types';
import { noop } from '@repo/utils';
import {
  languageList,
  FlagIcon,
  countryNamesList,
  flagList,
} from '@repo/shared-ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import capitalize from '@mui/utils/capitalize';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import { useAppDispatch, useConfigFormEntry } from '../../../store/hooks';
import { ILangaugeListProps } from './types';
import { setConfigValue } from '../../../store/slices/config-form';

const options = Object.keys(languageList);

const filterLanguage = createFilterOptions<string>({
  matchFrom: 'any',
  ignoreCase: true,
  ignoreAccents: true,
  stringify: (language) =>
    `${language}:${languageList[language]}:${countryNamesList[language]}`,
});

export const LanguageListForm: FC<ILangaugeListProps> = ({ configKey }) => {
  const dispatch = useAppDispatch();
  const configEntry = useConfigFormEntry(configKey);

  const [autSelectionSource, setAutoSelectionSource] = useState<string[]>([]);

  const [configSelection, setConfigSelection] = useState<string[]>(
    configEntry?.sourceValues || configEntry?.value || [],
  );

  useEffect(() => {
    console.log(
      'Update configSelection',
      configEntry?.sourceValues || configEntry?.value || [],
    );
    setConfigSelection(configEntry?.sourceValues || configEntry?.value || []);
  }, [configEntry?.sourceValues, configEntry?.value]);

  const addLanguages = useCallback(() => {
    console.log('Add', autSelectionSource);

    dispatch(
      setConfigValue({
        key: configKey,
        value: configSelection.concat(autSelectionSource),
      }),
    );

    setAutoSelectionSource([]);
  }, [autSelectionSource, configKey, configSelection, dispatch]);

  const languageOptions = useMemo(() => {
    return options.filter(
      (language) => configSelection.indexOf(language) === -1,
    );
  }, [configSelection]);

  if (!configEntry) {
    console.warn(
      'Invalid data type passed to the list component, it must be defined.',
      configKey,
    );
  }
  const data = configEntry;
  const isEditList = !!data?.sourceValues !== true;

  const handleToggle = useCallback(
    (item: unknown) => () => {
      if (data) {
        type TListValue = TArrayElementType<typeof data.value>;
        const language = item as TListValue;
        console.log(
          isEditList ? 'Delete' : 'Select',
          language,
          configSelection.filter((sel) => sel !== language),
        );

        if (isEditList) {
          const action = {
            key: configKey,
            value: configSelection.concat().filter((sel) => sel !== language),
          };
          console.log(action);
          dispatch(setConfigValue(action));
        } else {
          const currentIndex = data.value.indexOf(language);
          const newChecked = [...data.value];

          if (currentIndex === -1) {
            newChecked.push(language);
          } else {
            newChecked.splice(currentIndex, 1);
          }

          dispatch(
            setConfigValue({
              key: configKey,
              value: newChecked,
            }),
          );
        }
      }
    },
    [configKey, configSelection, data, dispatch, isEditList],
  );

  return (
    <Box>
      {isEditList && (
        <Stack spacing={2} direction={'row'}>
          <Autocomplete
            fullWidth
            multiple
            id="add-language"
            options={languageOptions}
            limitTags={3}
            value={autSelectionSource}
            onChange={(_, newValue: string[] | undefined) => {
              setAutoSelectionSource(newValue || []);
            }}
            filterSelectedOptions
            filterOptions={filterLanguage}
            renderTags={(value: readonly string[], getTagProps) =>
              value.map((language: string, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    variant="outlined"
                    label={
                      <>
                        <FlagIcon countryCode={flagList[language]} />{' '}
                        {language.toUpperCase()}
                      </>
                    }
                    {...tagProps}
                  />
                );
              })
            }
            renderOption={(props, language) => (
              <Box
                component="li"
                sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                {...props}
              >
                <FlagIcon countryCode={flagList[language]} />{' '}
                {capitalize(languageList[language])}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a language to add"
                variant="standard"
              />
            )}
          />
          <IconButton
            disabled={!(autSelectionSource.length > 0)}
            onClick={addLanguages}
            color="primary"
            sx={{ p: '10px' }}
            aria-label="add"
          >
            <AddIcon />
          </IconButton>
        </Stack>
      )}
      <List
        sx={{
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper',
          overflow: 'auto',
          maxHeight: 4 * 60,
        }}
      >
        <TransitionGroup>
          {configSelection.map((languageCode, index) => {
            const labelId = `checkbox-list-label-${languageCode}`;

            return (
              <Collapse key={`${configKey}:${index}:${languageCode}`}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <FlagIcon countryCode={flagList[languageCode]} />
                  }
                >
                  <ListItemButton
                    role={undefined}
                    onClick={handleToggle(languageCode)}
                    dense
                  >
                    <ListItemIcon>
                      {isEditList ? (
                        <IconButton edge="start" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        <Checkbox
                          edge="start"
                          checked={
                            configEntry?.value.indexOf(languageCode) !== -1
                          }
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                          onChange={noop}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      id={labelId}
                      primary={capitalize(languageList[languageCode])}
                      secondary={languageCode}
                    />
                  </ListItemButton>
                </ListItem>
              </Collapse>
            );
          })}
        </TransitionGroup>
      </List>
    </Box>
  );
};
