import { FC } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { Router } from './routes/Router';
import { store } from './store';

const App: FC = () => {
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <SnackbarProvider maxSnack={5}>
          <div className="App">
            <CssBaseline />
            <Router />
          </div>
        </SnackbarProvider>
      </StyledEngineProvider>
    </Provider>
  );
};

export default App;
