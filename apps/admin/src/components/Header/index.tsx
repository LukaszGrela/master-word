import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import { GrelaDesignIcon } from '../icons/GrelaDesignIcon';
import { Link as RouterLink } from 'react-router-dom';
import { EPaths } from '../../routes/enums/paths';
import { IProps } from './types';

export const Header: React.FC<IProps> = ({ title }) => {
  const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <SvgIcon
            sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }}
            viewBox="0 0 32 24"
          >
            <GrelaDesignIcon width={'2rem'} height={'1.5rem'} />
          </SvgIcon>
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to={EPaths.ROOT}
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Box sx={{ display: { xs: 'none', md: 'inline-block' }, m: 0 }}>
              Master&nbsp;Word
            </Box>{' '}
            Admin
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex' } }}>
            {title && (
              <Typography noWrap component={'h6'}>
                {title}
              </Typography>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Lukasz Grela" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
