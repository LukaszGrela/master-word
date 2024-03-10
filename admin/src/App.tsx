import { FC } from 'react';
import { CssBaseline } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { Router } from './routes/Router';
import { SnackbarProvider } from 'notistack';

const App: FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <SnackbarProvider maxSnack={5}>
        <div className='App'>
          <CssBaseline />
          <Router />
        </div>
      </SnackbarProvider>
    </StyledEngineProvider>
  );
};

export default App;
