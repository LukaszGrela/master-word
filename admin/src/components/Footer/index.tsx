import { FC } from 'react';
import { GrelaDesignIcon } from '../icons/GrelaDesignIcon';
import Box from '@mui/material/Box';
import './Footer.scss';
import { Container, Typography } from '@mui/material';

export const Footer: FC = () => {
  return (
    <Box
      className='footer'
      component='footer'
      position={'fixed'}
      sx={{
        backgroundColor: 'background.paper',
        bottom: 0,
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: '2rem',
        left: 0,
        right: 0,
        width: '100vw',
      }}
    >
      <Container sx={{}}>
        <GrelaDesignIcon className='gd-logo' />
        <Typography component='span' variant='caption'>
          GrelaDesign (c) 2024
        </Typography>{' '}
        <Typography component='span' variant='caption'>
          [v{import.meta.env.VITE_VERSION}]
        </Typography>
      </Container>
    </Box>
  );
};
