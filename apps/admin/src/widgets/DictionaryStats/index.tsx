import { FC, useCallback, useState, ChangeEventHandler } from 'react';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import NativeSelect from '@mui/material/NativeSelect';
import Stack from '@mui/material/Stack';
import { useGetDictionaryStatsQuery } from '../../store/slices/api';

const DictionaryStats: FC = () => {
  const [language, setLanguage] = useState('pl');
  const { data, isLoading } = useGetDictionaryStatsQuery(
    {
      language,
    },
    {
      pollingInterval: 60000,
    },
  );

  const total = data && data.length > 0 ? data[0].wordCount : 0;

  const handleSelectChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      console.log(e.target.value);
      setLanguage(e.target.value);
    },
    [],
  );
  return (
    <Card
      className="widget dictionary-stats"
      elevation={3}
      sx={{
        height: '100%',
      }}
    >
      <CardHeader title="Total Words">
        {isLoading && <LinearProgress />}
      </CardHeader>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography component="div" variant="h2">
          {total}
        </Typography>
        <Stack spacing={2} direction={'row'} alignItems={'baseline'}>
          <FormControl>
            <NativeSelect
              inputProps={{
                name: 'language',
                id: 'language',
              }}
              value={language}
              onChange={handleSelectChange}
            >
              <option value={'pl'}>🇵🇱 Polish</option>
              <option value={'en'}>🇺🇸 English</option>
              <option value={'fr'}>🇫🇷 French</option>
            </NativeSelect>
          </FormControl>
          <Typography variant="caption">words stored</Typography>
        </Stack>
      </CardContent>
      {/* 
      <CardActions>
        <Button size='small' onClick={handleReview} disabled={total === 0}>
          Review
        </Button>
      </CardActions>
       */}
    </Card>
  );
};

export default DictionaryStats;
