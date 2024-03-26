import { FC, useCallback } from 'react';
import Clear from '@mui/icons-material/Clear';
import Save from '@mui/icons-material/Save';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/system/colorManipulator';
import { IconButtonWithTooltip } from '../IconButtonWithTooltip';
import {
  useAppDispatch,
  useConfigFormState,
  useFormsModifiedState,
} from '../../store/hooks';
import { THydratedEntry, resetConfig } from '../../store/slices/config-form';
import { usePostConfigurationMutation } from '../../store/slices/api/slice.config';
import { TConfigEntryKey } from '@repo/backend-types/db';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useSaveAll = (): [
  () => void,
  {
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    isUninitialized: boolean;
    error?: FetchBaseQueryError | SerializedError;
  },
] => {
  const [save, props] = usePostConfigurationMutation();

  const config = useConfigFormState();

  const saveAll = useCallback(async () => {
    console.log('saveAll');
    const toSave = Object.entries(config.forms)
      .filter(([, configEntry]) => {
        return (
          configEntry !== undefined &&
          (configEntry.isModified || configEntry.isNew)
        );
      })
      .map((tuple) => tuple[1]) as THydratedEntry<TConfigEntryKey>[];

    if (toSave.length > 0) {
      return save(toSave).unwrap();
    }
  }, [config.forms, save]);

  return [saveAll, { ...props }];
};

export const ConfigToolbar: FC = () => {
  const [save, { isLoading }] = useSaveAll();
  const dispatch = useAppDispatch();
  const numConfigChanged = useFormsModifiedState();

  const changed = numConfigChanged > 0;

  const handleReset = useCallback(() => {
    dispatch(resetConfig());
  }, [dispatch]);
  const handleSave = useCallback(() => {
    save();
  }, [save]);

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
              disabled: isLoading,
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
              onClick: handleSave,
              disabled: isLoading,
            }}
          >
            <Save />
          </IconButtonWithTooltip>
        </>
      )}
    </Toolbar>
  );
};
