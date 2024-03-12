import { useRouteError, Link as RouterLink } from 'react-router-dom';
import { EPaths } from '../enums/paths';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import Button from '@mui/material/Button';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

export default function GeneralError() {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <div id="error-page">
      <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100%',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              mt: '3rem',
            }}
          >
            <Typography align="center" sx={{ mb: 3 }} variant="h1">
              Oops!
            </Typography>
            <Typography align="center" sx={{ mb: 3 }} variant="h3">
              Something went wrong
            </Typography>
            <Typography align="center" color="text.secondary" variant="body1">
              {error.statusText || error.message}
            </Typography>
            <Button
              component={RouterLink}
              to={EPaths.ROOT}
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
              sx={{ mt: 3 }}
              variant="contained"
            >
              Go back to dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </div>
  );
}
