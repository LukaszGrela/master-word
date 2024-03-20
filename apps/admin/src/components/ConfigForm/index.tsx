import { FC, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IConfigEntry } from '@repo/backend-types/db';

export const ConfigForm: FC = () => {
  const mock: IConfigEntry = {
    appId: ['frontend'],
    key: 'enabledLanguages',
    value: '["en","pl"]',
    validation: {
      type: 'string[]',
      sourceValuesKey: 'supportedLanguages',
    },
  };
  const mock2: IConfigEntry = {
    appId: ['frontend', 'admin'],
    key: 'supportedLanguages',
    value: '["en","fr","it","pl"]',
    validation: {
      type: 'string[]',
    },
  };
  console.log(mock, mock2);
  const supportedLanguages = {
    appId: ['frontend', 'admin'],
    key: 'supportedLanguages',
    value: ['en', 'fr', 'it', 'pl'],
    validation: {
      type: 'string[]',
    },
  };
  const enabledLanguages = {
    appId: ['frontend'],
    key: 'enabledLanguages',
    value: ['en', 'pl'],
    validation: {
      type: 'string[]',
    },
  };

  const [checked, setChecked] = useState(enabledLanguages.value);

  const handleToggle = (lang: string) => () => {
    const currentIndex = checked.indexOf(lang);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(lang);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <Card className="widget" elevation={3}>
      <CardHeader>Enabled Languages</CardHeader>
      <CardContent>
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        >
          {supportedLanguages.value.map((value) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
              <ListItem key={value} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(value)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked.indexOf(value) !== -1}
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
      </CardContent>
    </Card>
  );
};
