import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import { getUnknownWords } from '../../api/getUnknownWords';
import { EPaths } from '../../routes/enums/paths';

const UnknownWords: FC = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getUnknownWords()
      .then((list) => {
        // count
        const count = list.reduce((acc, { words }) => {
          return acc + words.length;
        }, 0);

        setTotal(count);
      })
      .catch(console.error);
  }, []);

  const handleReview = useCallback(() => {
    navigate(EPaths.UNKOWN_WORDS);
  }, [navigate]);

  return (
    <Card
      className='widget unknown-words'
      elevation={3}
      sx={{
        height: '100%',
      }}
    >
      <CardHeader title='Unknown Words'></CardHeader>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography component='div' variant='h2'>
          {total}
        </Typography>
        <Typography variant='caption'>Unknown words logged</Typography>
      </CardContent>

      <CardActions>
        <Button size='small' onClick={handleReview} disabled={total === 0}>
          Review
        </Button>
      </CardActions>
    </Card>
  );
};

export default UnknownWords;
