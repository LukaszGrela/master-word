import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import styled from '@mui/material/styles/styled';
import { Footer } from '../../components/Footer';
import { Header, HeaderSpacer } from '../../components/Header';
import {
  DictionaryStatsWidget,
  GameConfigStatsWidget,
  NewWordWidget,
  UnknownWordsWidget,
} from '../../widgets';
import { EMenuItemTypes, IMenuItems } from '../../components/Header/types';
import { EPaths } from '../enums/paths';

const menu: IMenuItems[] = [
  {
    label: 'Unknown Words',
    value: EMenuItemTypes.LINK,
    link: EPaths.UNKOWN_WORDS,
  },
  {
    label: 'Manage Configuration',
    value: EMenuItemTypes.LINK,
    link: EPaths.CONFIG,
  },
  {
    label: 'Manage Dictionaries',
    value: EMenuItemTypes.LINK,
    link: EPaths.DICTIONARIES,
  },
  { label: '', value: EMenuItemTypes.SEPARATOR },
  { label: 'Master Word', value: EMenuItemTypes.GAME },
  { label: 'Logout', value: EMenuItemTypes.LOGOUT },
];

const Main = styled('main')({
  marginTop: '1rem',
  marginBottom: '2.5rem',
});
export function Dashboard() {
  return (
    <div className="dashboard">
      <Container
        sx={{
          minHeight: '100vh',
        }}
      >
        <Header menu={menu} />
        <HeaderSpacer />
        <Main>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <NewWordWidget />
            </Grid>
            <Grid item xs={12} sm={4}>
              <GameConfigStatsWidget />
            </Grid>
            <Grid item xs={12} sm={4}>
              <UnknownWordsWidget />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DictionaryStatsWidget />
            </Grid>
            {/* 
            <Grid item xs={6} sm={4}>
              <Paper className='widget' elevation={3}>
                Active Games
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Paper className='widget' elevation={3}>
                Archived Games
              </Paper>
            </Grid>
             */}
          </Grid>
        </Main>
        <Footer />
      </Container>
    </div>
  );
}

export function Component() {
  return <Dashboard />;
}

Component.displayName = 'LazyDashboardPage';
