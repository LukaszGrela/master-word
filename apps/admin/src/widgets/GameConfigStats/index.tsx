import { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { TConfigEntryKey } from '@repo/backend-types/db';
import { IDictionary } from '@repo/common-types';

import { useGetConfigurationQuery } from '../../store/slices/api';
import { EPaths } from '../../routes/enums/paths';
import { FlexGrow } from '../../components/FlexGrow';

const labels: Partial<Record<TConfigEntryKey, string>> = {
  enabledLanguages: 'Enabled languages',
  enabledAttempts: 'Enabled attempts',
  enabledLength: 'Enabled word length',
};

const GameConfigStats: FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetConfigurationQuery('frontend');

  type TListEntry = { label: string; value: string };
  const list: IDictionary<TListEntry> | undefined = useMemo(
    () =>
      data?.reduce(
        (
          acc: IDictionary<TListEntry>,
          { key, value },
        ): IDictionary<TListEntry> => {
          if (
            key === 'enabledAttempts' ||
            key === 'enabledLanguages' ||
            key === 'enabledLength'
          ) {
            return {
              ...acc,
              [key]: {
                value: JSON.stringify(value),
                label: labels[key] || key,
              },
            };
          }
          return acc;
        },
        {},
      ),
    [data],
  );

  const handleReview = useCallback(() => {
    navigate(EPaths.CONFIG);
  }, [navigate]);

  return (
    <Card
      className="widget game-config"
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
      <FlexGrow />
      <CardActions>
        <Button size="small" onClick={handleReview}>
          Config
        </Button>
      </CardActions>
    </Card>
  );
};

export default GameConfigStats;
