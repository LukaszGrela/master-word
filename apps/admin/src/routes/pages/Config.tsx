import { FC } from 'react';
import Container from '@mui/material/Container';
import styled from '@mui/material/styles/styled';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import { Header, HeaderSpacer } from '../../components/Header';
import { useGetConfigurationQuery } from '../../store/slices/api';
import { ConfigForm } from '../../components/ConfigForm';

const Main = styled('main')({
  marginTop: '1rem',
  marginBottom: '2.5rem',
});

export const Config: FC = () => {
  const { data, isLoading, isSuccess } = useGetConfigurationQuery(undefined);

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
          <Grid container spacing={2}>
            {isLoading && (
              <Grid item xs={12}>
                <LinearProgress />
              </Grid>
            )}
            {isSuccess &&
              !isLoading &&
              data &&
              data.map((entry) => {
                return (
                  <Grid item xs={12} key={entry.key}>
                    {entry.key === 'enabledLanguages' ? (
                      <ConfigForm />
                    ) : (
                      <Paper className="widget" elevation={3}>
                        {entry.key}
                      </Paper>
                    )}
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
