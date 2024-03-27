import { FC, useCallback, useState } from 'react';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { useGetDictionaryStatsQuery } from '../../store/slices/api';
import { LanguageListSelect } from '../../components/LanguageListSelect';

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

  const handleSelectChange = useCallback((language: string) => {
    console.log(language);
    setLanguage(language);
  }, []);

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
          <FormControl variant="standard">
            <LanguageListSelect
              disabled={isLoading}
              onChange={handleSelectChange}
              value={language}
            />
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
