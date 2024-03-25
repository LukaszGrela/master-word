import { FC } from 'react';
import List from '@mui/material/List';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import { useConfigFormEntry } from '../../../store/hooks';
import { IProps } from './types';
import { TArrayElementType } from '@repo/common-types';

export const ListForm: FC<IProps> = ({ configKey }) => {
  const configEntry = useConfigFormEntry(configKey);

  if (!configEntry) {
    console.warn(
      'Invalid data type passed to the list component, it must be defined.',
      configKey,
    );
    return null;
  }
  const data = configEntry;

  // const [checked, setChecked] = useState<string[]>(data?.value || []);
  type TListValue = TArrayElementType<typeof data.value>;
  const handleToggle = (item: TListValue) => () => {
    console.log(item);
    //   const currentIndex = checked.indexOf(lang);
    //   const newChecked = [...checked];

    //   if (currentIndex === -1) {
    //     newChecked.push(lang);
    //   } else {
    //     newChecked.splice(currentIndex, 1);
    //   }

    //   setChecked(newChecked);
  };

  const isEditList = !!data.sourceValues !== true;

  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {isEditList && <p>Add new item</p>}
      <ListItem>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search Google Maps"
          inputProps={{ 'aria-label': 'search google maps' }}
        />
        <IconButton color="primary" sx={{ p: '10px' }} aria-label="add">
          <AddIcon />
        </IconButton>
      </ListItem>
      <Divider />
      {(data.sourceValues || data.value)?.map((value, index) => {
        const labelId = `checkbox-list-label-${value}`;

        return (
          <ListItem key={`${configKey}:${index}:${value}`} disablePadding>
            <ListItemButton
              role={undefined}
              onClick={handleToggle(value)}
              dense
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  // checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
