import { FC, useCallback } from 'react';
import Clear from '@mui/icons-material/Clear';
import Save from '@mui/icons-material/Save';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { IconButtonWithTooltip } from '../IconButtonWithTooltip';
import { useAppDispatch, useFormsModifiedState } from '../../store/hooks';
import { resetConfig } from '../../store/slices/config-form';

export const ConfigToolbar: FC = () => {
  const dispatch = useAppDispatch();
  const numConfigChanged = useFormsModifiedState();

  const changed = numConfigChanged > 0;

  const handleReset = useCallback(() => {
    dispatch(resetConfig());
  }, [dispatch]);

  return (
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
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
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
          <IconButtonWithTooltip
            tooltipProps={{
              title: 'Reset all',
            }}
            buttonProps={{
              color: 'error',
              size: 'small',
              onClick: handleReset,
            }}
          >
            <Clear />
          </IconButtonWithTooltip>

          <IconButtonWithTooltip
            tooltipProps={{
              title: 'Save all',
            }}
            buttonProps={{
              color: 'success',
              size: 'small',
              /* onClick:{handleReview('approve-selected')}, */
            }}
          >
            <Save />
          </IconButtonWithTooltip>
        </>
      )}
    </Toolbar>
  );
};
