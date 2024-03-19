import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';

import { EPaths } from '../../routes/enums/paths';
import { useGetUnknownWordsQuery } from '../../store/slices/api';

const UnknownWords: FC = () => {
  const navigate = useNavigate();

  const { data, error, isLoading } = useGetUnknownWordsQuery(undefined, {
    pollingInterval: 30000,
  });

  const total = data?.reduce((acc, { words }) => {
    return acc + words.length;
  }, 0);

  const handleReview = useCallback(() => {
    navigate(EPaths.UNKOWN_WORDS);
  }, [navigate]);

  return (
    <Card
      className="widget unknown-words"
      elevation={3}
      sx={{
        height: '100%',
      }}
    >
      <CardHeader title="Unknown Words">
        {isLoading && <LinearProgress />}
      </CardHeader>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography
          component="div"
          variant="h2"
          className={error ? 'error' : undefined}
        >
          {total}
        </Typography>
        <Typography variant="caption">Unknown words logged</Typography>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={handleReview} disabled={total === 0}>
          Review
        </Button>
      </CardActions>
    </Card>
  );
};

export default UnknownWords;
