import words from '../assets/5/pl/dictionary.json';

export type TGetRandomWordResponse = {
  session: string;
  word: string[];
  error?: string;
};

const CUSTOM_SESSION = 'static-local-session-id';

const getRandomWord = async (
  session = CUSTOM_SESSION
): Promise<TGetRandomWordResponse> => {
  const word =
    words[Math.floor(Math.random() * words.length)].toLocaleUpperCase();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ session, word: word.split('') });
    }, 10);
  });
};

export default getRandomWord;
