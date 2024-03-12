import { TSupportedLanguages } from '../../types';
import { Dictionary, getModelForConnection } from '../models/Dictionary';

const localeSorter =
  (language: TSupportedLanguages) => (a: string, b: string) => {
    try {
      return a.localeCompare(b, language);
    } catch (e) {
      /* istanbul ignore next */
      return 0;
    }
  };

/**
 * Returns an alphabet made out of existing dictionaries.
 * Note: This can work with default DB connection.
 *
 * @param language The language of the alphabet
 * @param length length of the words to collect alphabet
 * @returns sorted alphabet
 */
export const getAlphabet = async (
  language: TSupportedLanguages = 'pl',
  length = 5,
): Promise<string[]> => {
  const alphabet = (
    await Dictionary.find({ language, length }, { letter: 1 }).exec()
  ).map((d) => d.letter) as string[];

  return alphabet.sort(localeSorter(language));
};

export const getRandomWord = async (
  language: TSupportedLanguages = 'pl',
  length = 5,
) => {
  const alphabet = await getAlphabet(language, length);
  if (alphabet.length > 0) {
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    const match = await Dictionary.findOne({
      letter: randomLetter,
      length,
      language,
    }).exec();

    // if alphabet was collected then match must have result
    /* istanbul ignore else */
    if (match && match.words && match.words.length > 0) {
      const words = match.words.sort(localeSorter(language));
      const word = words[Math.floor(Math.random() * words.length)];

      return word;
    }
  }
  return null;
};

export const wordExists = async (
  word: string,
  language: TSupportedLanguages = 'pl',
  length = 5,
) => {
  const doc = await Dictionary.find({
    words: word,
    language,
    length,
  }).exec();

  return doc.length !== 0;
};

/**
 * Note: This will only work with dictionary dev connection
 * @param word Word to add
 * @param language language of dictionary to add the word to
 * @param length length of the word
 * @returns dictionary Document
 */
export const addWord = async (
  word: string,
  language: TSupportedLanguages = 'pl',
  length = 5,
) => {
  if (length === 0) {
    throw new Error('addWord: the length argument must not be 0.');
  }

  if (!word) {
    throw new Error('addWord: the word argument must not be empty.');
  }

  if (word.length !== length) {
    throw new Error(
      `addWord: the word value must have length as declared by "length" argument (${word.length} != ${length}).`,
    );
  }
  return addManyWords([word], language, length);
};

export const addManyWords = async (
  words: string[],
  language: TSupportedLanguages = 'pl',
  length = 5,
) => {
  if (length === 0) {
    throw new Error('addManyWords: the length argument must not be 0.');
  }
  if (words.length === 0 || (words.length === 1 && words[0].length === 0)) {
    throw new Error('addManyWords: the words argument must not be empty.');
  }

  const letter = words[0].charAt(0).toLocaleLowerCase();
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = i < words.length && words[i + 1];
    // check length of each word
    if (word.length !== length) {
      throw new Error(
        `addManyWords: the words must have length as declared by "length" argument ("${word}" ${word.length} != ${length}).`,
      );
    }
    // check all words are for the same letter dictionary
    if (nextWord && nextWord.charAt(0).toLocaleLowerCase() !== letter) {
      throw new Error(
        `addManyWords: the words must start with the same letter "${letter}". Invalid word: "${nextWord}".`,
      );
    }
  }

  let dictionaryDoc = await Dictionary.findOne({
    letter,
    language,
    length,
  });

  const wordsToAdd = words.map((word) => word.toLocaleLowerCase());
  if (dictionaryDoc === null) {
    dictionaryDoc = await Dictionary.create({
      letter,
      language,
      length,
    });
  }

  /* istanbul ignore else */
  if (dictionaryDoc.words) {
    const uniqueWords = new Set(dictionaryDoc.words.concat(wordsToAdd));
    dictionaryDoc.words = Array.from(uniqueWords);
    dictionaryDoc.words.sort(localeSorter(language));
  }

  return await dictionaryDoc.save();
};

type TCountDictionaryResponse = {
  language: string;
  length: number;
  alphabet: string[];
  wordCount: number;
};

export const countWords = async (
  language: TSupportedLanguages = 'pl',
  length = 5,
): Promise<TCountDictionaryResponse[]> => {
  const result = await Dictionary.aggregate<TCountDictionaryResponse>([
    {
      $match: {
        language,
        length,
      },
    },
    {
      $group: {
        _id: null,
        language: {
          $first: '$language',
        },
        length: {
          $first: '$length',
        },
        alphabet: {
          $push: '$letter',
        },
        wordCount: {
          $sum: {
            $size: '$words',
          },
        },
      },
    },
    {
      $set: {
        alphabet: {
          $sortArray: {
            input: '$alphabet',
            sortBy: 1,
          },
        },
      },
    },
    {
      $unset: '_id',
    },
  ])
    .collation({
      locale: language,
      strength: 1,
    })
    .exec();

  return result;
};

export const getLanguages = async (length = 5) => {
  const result = await Dictionary.aggregate<{ languages: string[] }[]>([
    {
      $match: {
        length,
      },
    },
    {
      $group: {
        _id: null,
        languages: {
          $addToSet: '$language',
        },
      },
    },
    {
      $unset: '_id',
    },
  ]);

  return result;
};

export const deleteWord = async (
  word: string,
  language: TSupportedLanguages = 'pl',
  length = 5,
) => {
  if (length === 0) {
    throw new Error('deleteWord: the length argument must not be 0.');
  }

  if (!word) {
    throw new Error('deleteWord: the word argument must not be empty.');
  }

  if (word.length !== length) {
    throw new Error(
      `deleteWord: the word value must have length as declared by "length" argument (${word.length} != ${length}).`,
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
  length = 5,
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
      `updateWord: the oldWord value must have length as declared by "length" argument (${oldWord.length} != ${length}).`,
    );
  }

  if (newWord.length !== length) {
    throw new Error(
      `updateWord: the newWord value must have length as declared by "length" argument (${newWord.length} != ${length}).`,
    );
  }

  if (
    newWord.toLocaleLowerCase().charAt(0) !==
    oldWord.toLocaleLowerCase().charAt(0)
  ) {
    throw new Error(
      `updateWord: You can only update words for the same letter.`,
    );
  }

  if (newWord.toLocaleLowerCase() !== oldWord.toLocaleLowerCase()) {
    await deleteWord(oldWord, language, length);
    await addWord(newWord, language, length);
  }
};
