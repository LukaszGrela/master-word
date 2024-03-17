import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  NativeSelect,
  Card,
  Stack,
  TextField,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { isCorrectWord } from '@repo/utils/isLetter';
import {
  usePostAddWordMutation,
  TPostAddWordParams,
} from '../../store/slices/api';

const NewWord: FC = () => {
  const wordLength = 5;

  const [addWord, { isLoading }] = usePostAddWordMutation();

  const [word, setWord] = useState('');
  const onWordChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const input = e.target;
      const value = input.value;
      // const { selectionDirection, selectionEnd, selectionStart } = input;

      if (value === '' || isCorrectWord(value)) {
        const newValue = value.toLocaleUpperCase();
        // let setCursor = noop;

        if (word !== newValue && value !== '') {
          // setCursor = () => {
          //   input.selectionStart = selectionEnd;
          //   input.selectionEnd = selectionEnd;
          // };
        }
        setWord(newValue);
        // runAfterUpdate(setCursor);
      }
    },
    [word],
  );
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);

      const params = Object.fromEntries(data) as unknown as TPostAddWordParams;
      if (params.length) {
        params.length = Number(params.length);
      }
      // call API
      addWord(params)
        .unwrap()
        .then((successMessage: string) => {
          // clear word
          setWord('');
          // show toast
          console.log(successMessage);
        })
        .catch(console.error);
    },
    [addWord],
  );

  return (
    <Card
      className="widget new-word"
      elevation={3}
      sx={{
        height: '100%',
      }}
    >
      <CardHeader title="Add new word" />
      <CardContent>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <Stack spacing={2} direction={'column'} alignItems={'stretch'}>
            <Stack spacing={2} direction={'row'}>
              <FormControl>
                <InputLabel variant="standard" htmlFor="language">
                  Language
                </InputLabel>
                <NativeSelect
                  disabled={isLoading}
                  defaultValue={'pl'}
                  inputProps={{
                    name: 'language',
                    id: 'language',
                  }}
                >
                  <option value={'pl'}>🇵🇱 Polish</option>
                  <option value={'en'}>🇺🇸 English</option>
                </NativeSelect>
              </FormControl>
              <input
                type="hidden"
                name="length"
                id="length"
                value={wordLength}
              />
              <TextField
                inputProps={{
                  name: 'length',
                  id: 'length',
                }}
                variant="standard"
                type="number"
                label="Length"
                disabled
                value={wordLength}
              />
            </Stack>

            <Stack spacing={2} direction={'row'}>
              <FormControl fullWidth>
                <TextField
                  variant="standard"
                  label="Word"
                  type="text"
                  inputProps={{
                    name: 'word',
                    id: 'word',
                    maxLength: wordLength,
                  }}
                  value={word}
                  onChange={onWordChange}
                  disabled={isLoading}
                />
              </FormControl>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={word.length !== wordLength || isLoading}
                type="submit"
              >
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewWord;
