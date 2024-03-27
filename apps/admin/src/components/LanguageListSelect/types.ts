import { SelectProps } from '@mui/material/Select';

export interface IProps {
  selectStyleProps?: SelectProps['sx'];
  onChange?: (langauge: string) => void;
  disabled?: boolean;

  /**
   * Custom selected value, otherwise it will be taken from redux store
   */
  value?: string;
}
