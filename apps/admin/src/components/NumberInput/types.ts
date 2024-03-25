import { InputProps } from '@mui/material/Input';
export interface IProps {
  value: number | null;
  onChange: (newValue: number | null) => void;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  label?: string;

  inputProps?: Omit<InputProps, 'onChange' | 'value' | 'id' | 'error'>;
}
