import { FC, PropsWithChildren } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { IProps } from './types';

export const IconButtonWithTooltip: FC<PropsWithChildren<IProps>> = ({
  tooltipProps,
  buttonProps,
  children,
}) => {
  const button = <IconButton {...buttonProps}>{children}</IconButton>;

  return buttonProps.disabled ? (
    button
  ) : (
    <Tooltip {...tooltipProps}>{button}</Tooltip>
  );
};
