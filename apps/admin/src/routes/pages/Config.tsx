import { FC, useMemo } from 'react';
import Container from '@mui/material/Container';
import styled from '@mui/material/styles/styled';
import { alpha } from '@mui/system/colorManipulator';
import Grid from '@mui/material/Grid';

import IconButton from '@mui/material/IconButton';
import Clear from '@mui/icons-material/Clear';
import Save from '@mui/icons-material/Save';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Header, HeaderSpacer } from '../../components/Header';
import { ConfigForm } from '../../components/ConfigForm';
import { useConfigFormState } from '../../store/hooks';

const Main = styled('main')({
  marginTop: '1rem',
  marginBottom: '2.5rem',
});

export const Config: FC = () => {
  const { forms } = useConfigFormState();

  const numConfigChanged = useMemo(() => {
    return Object.entries(forms).reduce((changedCount, [, { isModified }]) => {
      if (isModified) {
        return changedCount + 1;
      }
      return changedCount;
    }, 0);
  }, [forms]);
  const changed = numConfigChanged > 0;

  return (
    <div className="config">
      <Container
        sx={{
          minHeight: '100vh',
        }}
      >
        <Header title="Configuration" />
        <HeaderSpacer />
        <Main>
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              ...(changed && {
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.action.activatedOpacity,
                  ),
              }),
              mb: 2,
              boxShadow: 1,
            }}
          >
            {!changed ? (
              <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                component="div"
              >
                Review configuration
              </Typography>
            ) : (
              <>
                <Typography
                  sx={{ flex: '1 1 100%' }}
                  color="inherit"
                  variant="subtitle1"
                  component="div"
                >
                  {numConfigChanged} changed
                </Typography>
                <Tooltip title="Reset all">
                  <IconButton
                    color="error"
                    size="small"
                    /* onClick={handleReview('reject-selected')} */
                  >
                    <Clear />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save all">
                  <IconButton
                    color="success"
                    size="small"
                    /* onClick={handleReview('approve-selected')} */
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Toolbar>
          <Grid container spacing={2}>
            {/*
            {isLoading && (
               <Grid item xs={12}>
                <LinearProgress />
              </Grid>
            )} */}

            {Object.entries(forms).map(([, entry]) => {
              return (
                <Grid item xs={12} md={6} key={entry.key}>
                  <ConfigForm configKey={entry.key} />
                </Grid>
              );
            })}
          </Grid>
        </Main>
      </Container>
    </div>
  );
};

export function Component() {
  return <Config />;
}

Component.displayName = 'LazyConfigPage';
