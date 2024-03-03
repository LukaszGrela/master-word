import { TSupportedLanguages } from '../../types';
import { Dictionary } from '../models/Dictionary';

export const getAlphabet = async (
  language: TSupportedLanguages = 'pl',
  length = 5
): Promise<string[]> => {
  const alphabet = (
    await Dictionary.find({ language, length }, { letter: 1 }).exec()
  ).map((d) => d.letter) as string[];

  return alphabet.sort();
};

export const getRandomWord = async (
  language: TSupportedLanguages = 'pl',
  length = 5
) => {
  const alphabet = await getAlphabet(language, length);

  if (alphabet.length > 0) {
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    const match = await Dictionary.findOne({
      letter: randomLetter,
      length,
      language,
    }).exec();
    if (match && match.words && match.words.length > 0) {
      const words = match.words.sort();
      const word = words[Math.floor(Math.random() * words.length)];

      return word;
    }
  }
  return null;
};

export const addWord = async (
  word: string,
  language: TSupportedLanguages = 'pl',
  length = 5
) => {
  if (length === 0) {
    throw new Error('addWord: the length argument must not be 0.');
  }

  if (!word) {
    throw new Error('addWord: the word argument must not be empty.');
  }

  if (word.length !== length) {
    throw new Error(
      `addWord: the word value must have length as declared by "length" argument (${word.length} != ${length}).`
    );
  }

  const wordToAdd = word.toLocaleLowerCase();
  const letter = word.charAt(0).toLocaleLowerCase();

  let dictionaryDoc = await Dictionary.findOne({
    letter,
    language,
    length,
  });

  if (dictionaryDoc === null) {
    dictionaryDoc = await Dictionary.create({
      letter,
      language,
      length,
    });
  }

  dictionaryDoc.words?.push(wordToAdd);
  dictionaryDoc.words?.sort();

  return await dictionaryDoc.save();
};

export const countWords = async (
  language: TSupportedLanguages = 'pl',
  length = 5
) => {
  const words = (
    await Dictionary.find({ language, length }, { words: 1 }).exec()
  ).reduce(
    (acc, d) => acc.concat(d.words || ([] as string[])),
    [] as string[]
  ) as string[];

  return words.length;
};

export const deleteWord = async (
  word: string,
  language: TSupportedLanguages = 'pl',
  length = 5
) => {
  if (length === 0) {
    throw new Error('deleteWord: the length argument must not be 0.');
  }

  if (!word) {
    throw new Error('deleteWord: the word argument must not be empty.');
  }

  if (word.length !== length) {
    throw new Error(
      `deleteWord: the word value must have length as declared by "length" argument (${word.length} != ${length}).`
    );
  }

  const wordToRemove = word.toLocaleLowerCase();
  const letter = word.charAt(0).toLocaleLowerCase();

  let dictionaryDoc = await Dictionary.findOne({
    letter,
    language,
    length,
  });

  if (dictionaryDoc && dictionaryDoc.words) {
    const index = dictionaryDoc.words.indexOf(wordToRemove);
    if (index !== -1) {
      dictionaryDoc.words.splice(index, 1);

      await dictionaryDoc.save();
    }
  }
};

export const updateWord = async (
  oldWord: string,
  newWord: string,
  language: TSupportedLanguages = 'pl',
  length = 5
) => {
  if (length === 0) {
    throw new Error('updateWord: the length argument must not be 0.');
  }

  if (!oldWord) {
    throw new Error('updateWord: the oldWord argument must not be empty.');
  }
  if (!newWord) {
    throw new Error('updateWord: the newWord argument must not be empty.');
  }

  if (oldWord.length !== length) {
    throw new Error(
      `updateWord: the oldWord value must have length as declared by "length" argument (${oldWord.length} != ${length}).`
    );
  }

  if (newWord.length !== length) {
    throw new Error(
      `updateWord: the newWord value must have length as declared by "length" argument (${newWord.length} != ${length}).`
    );
  }

  if (
    newWord.toLocaleLowerCase().charAt(0) !==
    oldWord.toLocaleLowerCase().charAt(0)
  ) {
    throw new Error(
      `updateWord: You can only update words for the same letter.`
    );
  }

  if (newWord.toLocaleLowerCase() !== oldWord.toLocaleLowerCase()) {
    await deleteWord(oldWord, language, length);
    await addWord(newWord, language, length);
  }
};
