import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import { IProps } from './types';

export const NumberTextInput: React.FC<IProps> = ({
  onChange,
  value,
  id = 'number-input',
  error,
  errorMessage,
  label,
  inputProps = {},
}) => {
  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = React.useCallback(
    (e) => {
      const { value } = e.target;

      if (value === '' || /^\d+$/g.test(`${value}`)) {
        let newValue = value === '' ? null : parseInt(value);

        if (newValue !== null && isNaN(newValue)) {
          newValue = null;
        }
        onChange(newValue);
      }
    },
    [onChange],
  );
  const errorTextId = `${id}-error-text`;
  return (
    <FormControl variant="standard" error={error}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        {...inputProps}
        id={id}
        value={value === null ? '' : value}
        aria-describedby={errorTextId}
        onChange={handleChange}
      />
      {error && (
        <FormHelperText id={errorTextId}>{errorMessage}</FormHelperText>
      )}
    </FormControl>
  );
};
