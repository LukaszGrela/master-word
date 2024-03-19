import React, { useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { GrelaDesignIcon } from '../icons/GrelaDesignIcon';
import { EPaths } from '../../routes/enums/paths';
import { EMenuItemTypes, IMenuItems, IProps } from './types';
import { IconButtonWithTooltip } from '../IconButtonWithTooltip';

export const Header: React.FC<IProps> = ({ title, menu }) => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemSelected = useCallback(
    (menuItem: IMenuItems) => () => {
      const { value, link } = menuItem;
      if (value === EMenuItemTypes.GAME) {
        window.open(
          `https://master-word.greladesign.co`,
          '_blank',
          'noopener, noreferrer',
        );
      }

      if (value === EMenuItemTypes.LINK && link) {
        navigate(link);
      }
      handleCloseUserMenu();
    },
    [navigate],
  );

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
            <IconButtonWithTooltip
              tooltipProps={{
                title: 'Open menu',
              }}
              buttonProps={{
                onClick: handleOpenUserMenu,
                sx: { p: 0 },
                disabled: !menu || menu.length === 0,
              }}
            >
              <Avatar alt="Lukasz Grela" />
            </IconButtonWithTooltip>
            {menu && (
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
                {menu.map((item, index) => {
                  const { value, label, icon, link } = item;
                  return value === EMenuItemTypes.SEPARATOR ? (
                    <Divider key={`${value}-${index}`} variant="middle" />
                  ) : (
                    <MenuItem
                      key={`${value}:${label}:${link}`}
                      onClick={handleMenuItemSelected(item)}
                    >
                      {icon && <ListItemIcon>{icon}</ListItemIcon>}
                      <ListItemText>{label}</ListItemText>
                    </MenuItem>
                  );
                })}
              </Menu>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
