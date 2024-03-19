import { Container, Grid, styled } from '@mui/material';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import {
  DictionaryStatsWidget,
  NewWordWidget,
  UnknownWordsWidget,
} from '../../widgets';
import { IMenuItems } from '../../components/Header/types';
import { EPaths } from '../enums/paths';

const menu: IMenuItems[] = [
  { label: 'Unknown Words', value: 'link', link: EPaths.UNKOWN_WORDS },
  { label: 'Manage Configuration', value: 'link', link: EPaths.CONFIG },
  { label: 'Manage Dictionaries', value: 'link', link: EPaths.DICTIONARIES },
  { label: '', value: 'SEPARATOR' },
  { label: 'Master Word', value: 'game' },
  { label: 'Logout', value: 'logout' },
];

const HeaderSpacer = styled('div')(({ theme }) => theme.mixins.toolbar);
const Main = styled('main')({
  marginTop: '1rem',
  marginBottom: '2.5rem',
});
export default function Dashboard() {
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
              <UnknownWordsWidget />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DictionaryStatsWidget />
            </Grid>
            {/* 
            <Grid item xs={6} sm={4}>
              <Paper className='widget' elevation={3}>
                Dictionary
              </Paper>
            </Grid>
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
