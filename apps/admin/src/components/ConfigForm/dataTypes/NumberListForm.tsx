import { FC, useEffect, useState, useCallback } from 'react';
import { TransitionGroup } from 'react-transition-group';
import Box from '@mui/material/Box';

import List from '@mui/material/List';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { TArrayElementType } from '@repo/common-types';

import { useAppDispatch, useConfigFormEntry } from '../../../store/hooks';
import { INumberListProps } from './types';
import { setConfigValue } from '../../../store/slices/config-form';
import { NumberTextInput } from '../../NumberInput';
import { noop } from '@repo/utils';

export const NumberListForm: FC<INumberListProps> = ({ configKey }) => {
  const dispatch = useAppDispatch();
  const configEntry = useConfigFormEntry(configKey);

  const [num, setNum] = useState<number | null>(null);

  const [configSelection, setConfigSelection] = useState<number[]>(
    configEntry?.sourceValues || configEntry?.value || [],
  );

  useEffect(() => {
    setConfigSelection(configEntry?.sourceValues || configEntry?.value || []);
  }, [configEntry?.sourceValues, configEntry?.value]);

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
        const num = item as TListValue;
        console.log(
          isEditList ? 'Delete' : 'Select',
          num,
          configSelection.filter((sel) => sel !== num),
        );

        if (isEditList) {
          const action = {
            key: configKey,
            value: configSelection.concat().filter((sel) => sel !== num),
          };
          console.log(action);
          dispatch(setConfigValue(action));
        } else {
          const currentIndex = data.value.indexOf(num);
          const newChecked = [...data.value];

          if (currentIndex === -1) {
            newChecked.push(num);
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

  const addNumber = useCallback(() => {
    console.log('Add', num);
    setNum(null);
    if (num !== null) {
      dispatch(
        setConfigValue({
          key: configKey,
          value: Array.from(new Set(configSelection.concat(num))),
        }),
      );
    }
  }, [num, configKey, configSelection, dispatch]);
  return (
    <Box>
      {isEditList && (
        <>
          <Stack spacing={2} direction={'row'}>
            <NumberTextInput
              id={`${configKey}-number-input`}
              value={num}
              onChange={(n) => {
                setNum(n);
              }}
              label="Add a number"
            />
            <IconButton
              disabled={false}
              onClick={addNumber}
              color="primary"
              sx={{ p: '10px' }}
              aria-label="add"
            >
              <AddIcon />
            </IconButton>
          </Stack>
        </>
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
          {configSelection.map((value, index) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
              <Collapse key={`${configKey}:${index}:${value}`}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleToggle(value)} dense>
                    <ListItemIcon>
                      {isEditList ? (
                        <IconButton edge="start" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        <Checkbox
                          edge="start"
                          checked={configEntry?.value.indexOf(value) !== -1}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                          onChange={noop}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={value} />
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
