import { SelectProps } from '@mui/material/Select';

export interface IProps {
  selectStyleProps?: SelectProps['sx'];
  onChange?: (langauge: string) => void;
  disabled?: boolean;
}
