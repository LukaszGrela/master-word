import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { isCorrectWord } from '@repo/utils/isLetter';
import {
  usePostAddManyWordsMutation,
  usePostAddWordMutation,
} from '../../store/slices/api';
import type {
  TPostAddManyWordsParams,
  TPostAddWordParams,
} from '../../store/slices/api';
import { useAppDispatch } from '../../store/hooks';
import { setLanguage } from '../../store/slices/config';
import { LanguageListSelect } from '../../components/LanguageListSelect';

const NewWord: FC = () => {
  const dispatch = useAppDispatch();

  const handleSelectChange = useCallback(
    (language: string) => {
      console.log(language);
      dispatch(setLanguage(language));
    },
    [dispatch],
  );

  const wordLength = 5;

  const [addWord, { isLoading }] = usePostAddWordMutation();
  const [addManyWords, { isLoading: isAddingMany }] =
    usePostAddManyWordsMutation();

  const [word, setWord] = useState('');
  const [wordList, setWordList] = useState('');
  const [listMode, setListMode] = useState(false);
  const busy = isLoading || isAddingMany;
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
  const words = wordList
    .replace(/^[ ,]+|[ ,]+$/g, '')
    .split(/[ ,]+/)
    .filter(Boolean);
  const listError = (() => {
    if (words.length === 0) return 'Enter at least one word.';
    if (words.some((item) => !isCorrectWord(item))) {
      return 'Use letters only, with words separated by spaces or commas.';
    }
    if (words.some((item) => item.length !== wordLength)) {
      return `Every word must contain ${wordLength} letters.`;
    }
    const firstLetter = words[0].charAt(0).toLocaleLowerCase();
    if (
      words.some((item) => item.charAt(0).toLocaleLowerCase() !== firstLetter)
    ) {
      return 'All words must start with the same letter.';
    }
    return null;
  })();
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);

      const params = Object.fromEntries(data) as unknown as TPostAddWordParams;
      if (params.length) {
        params.length = Number(params.length);
      }

      const request = listMode
        ? addManyWords({
            words: Array.from(new Set(words)),
            language: String(params.language),
            length: Number(params.length),
          } satisfies TPostAddManyWordsParams)
        : addWord(params);
      request
        .unwrap()
        .then((successMessage: string) => {
          if (listMode) setWordList('');
          else setWord('');
          console.log(successMessage);
        })
        .catch(console.error);
    },
    [addManyWords, addWord, listMode, words],
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
              <FormControl variant="standard">
                <InputLabel variant="standard" htmlFor="language">
                  Language
                </InputLabel>
                <LanguageListSelect
                  disabled={isLoading}
                  onChange={handleSelectChange}
                />
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={listMode}
                    onChange={(event) => setListMode(event.target.checked)}
                    disabled={busy}
                  />
                }
                label="List of words"
              />
            </Stack>

            <Stack spacing={2} direction={'row'} alignItems="flex-start">
              <FormControl fullWidth>
                {listMode ? (
                  <TextField
                    variant="standard"
                    label="Words"
                    multiline
                    minRows={3}
                    inputProps={{ id: 'word-list' }}
                    value={wordList}
                    onChange={(event) => setWordList(event.target.value)}
                    disabled={busy}
                    error={wordList.length > 0 && listError !== null}
                    helperText={
                      wordList.length > 0
                        ? listError
                        : 'Separate words with spaces or commas.'
                    }
                  />
                ) : (
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
                    disabled={busy}
                  />
                )}
              </FormControl>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={
                  busy ||
                  (listMode ? listError !== null : word.length !== wordLength)
                }
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
