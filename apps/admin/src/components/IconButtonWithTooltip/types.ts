import { TooltipProps, IconButtonProps } from '@mui/material';

export interface IProps {
  tooltipProps: Omit<TooltipProps, 'children'>;
  buttonProps: Omit<IconButtonProps, 'children'>;
}
