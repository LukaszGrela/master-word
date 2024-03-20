import { FC } from 'react';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { IDictionary } from '@repo/common-types';

import { useGetConfigurationQuery } from '../../store/slices/api';

const GameConfigStats: FC = () => {
  const { data, isLoading } = useGetConfigurationQuery('frontend');

  type TListEntry = { label: string; value: string };
  const list: IDictionary<TListEntry> | undefined = data?.reduce(
    (
      acc: IDictionary<TListEntry>,
      { key, value, admin },
    ): IDictionary<TListEntry> => {
      if (
        key === 'enabledAttempts' ||
        key === 'enabledLanguages' ||
        key === 'enabledLength'
      ) {
        return { ...acc, [key]: { value, label: admin?.label || key } };
      }
      return acc;
    },
    {},
  );

  return (
    <Card className="widget game-config">
      <CardHeader title="Game Config">
        {isLoading && <LinearProgress />}
      </CardHeader>
      <CardContent sx={{ textAlign: 'left' }}>
        <Stack>
          {list && list.enabledLanguages && (
            <Box>
              <Typography variant="subtitle2">
                {list.enabledLanguages.label}
              </Typography>
              <Typography variant="body2">
                {list.enabledLanguages.value}
              </Typography>
            </Box>
          )}{' '}
          {list && list.enabledAttempts && (
            <Box>
              <Typography variant="subtitle2">
                {list.enabledAttempts.label}
              </Typography>
              <Typography variant="body2">
                {list.enabledAttempts.value}
              </Typography>
            </Box>
          )}{' '}
          {list && list.enabledLength && (
            <Box>
              <Typography variant="subtitle2">
                {list.enabledLength.label}
              </Typography>
              <Typography variant="body2">
                {list.enabledLength.value}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GameConfigStats;
