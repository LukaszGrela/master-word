import { FC } from 'react';
import Container from '@mui/material/Container';
import styled from '@mui/material/styles/styled';
import Grid from '@mui/material/Grid';

import { Header, HeaderSpacer } from '../../components/Header';
import { ConfigForm } from '../../components/ConfigForm';
import { useConfigFormState } from '../../store/hooks';
import { ConfigToolbar } from '../../components/ConfigToolbar';

const Main = styled('main')({
  marginTop: '1rem',
  marginBottom: '2.5rem',
});

export const Config: FC = () => {
  const { forms } = useConfigFormState();

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
          <ConfigToolbar />
          <Grid container spacing={2}>
            {/*
            {isLoading && (
               <Grid item xs={12}>
                <LinearProgress />
              </Grid>
            )} */}

            {Object.entries(forms).map(([, entry]) => {
              return (
                entry && (
                  <Grid item xs={12} md={6} key={entry.key}>
                    <ConfigForm configKey={entry.key} />
                  </Grid>
                )
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
