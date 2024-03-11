import { FC, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import { getDictionaryLanguages } from '../../api/getDictionaryLanguages';
import { getDictionaryStats } from '../../api/getDictionaryStats';

const DictionaryStats: FC = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getDictionaryLanguages()
      .then((response) => {
        if (response.length === 1) {
          // success
          const first = response[0];
          first.languages;
          console.log(first);
          getDictionaryStats('pl')
            .then((stats) => {
              setTotal(stats[0].wordCount);
            })
            .catch(console.error);
        } else {
          setTotal(0);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Card
      className='widget dictionary-stats'
      elevation={3}
      sx={{
        height: '100%',
      }}
    >
      <CardHeader title='Total Words'></CardHeader>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography component='div' variant='h2'>
          {total}
        </Typography>
        <Typography variant='caption'>Polish words stored</Typography>
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
