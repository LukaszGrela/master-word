import { Connection } from 'mongoose';
import { getModelForConnection } from '../models/UnknownWord';
import { ObjectId } from 'mongoose';
import { getStartOfDay } from '@repo/utils/getStartOfDay';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TObjectId = ObjectId | any;

export const getAll = async (connection: Connection) => {
  const UnknownWordModel = getModelForConnection(connection);

  const list = await UnknownWordModel.find({}).exec();

  return list;
};

export const getByDate = async (connection: Connection, date: Date) => {
  const UnknownWordModel = getModelForConnection(connection);

  const result = await UnknownWordModel.findOne({
    date,
  }).exec();

  return result;
};

export const getById = async (connection: Connection, id: TObjectId) => {
  const UnknownWordModel = getModelForConnection(connection);

  const result = await UnknownWordModel.findById(id).exec();

  return result;
};

export const removeById = async (connection: Connection, id: TObjectId) => {
  const UnknownWordModel = getModelForConnection(connection);

  const list = await UnknownWordModel.findByIdAndDelete(id).exec();

  return list;
};

export const removeWordById = async (
  connection: Connection,
  id: TObjectId,
  word: string,
  language: string,
  /* TODO verify the need for this param */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  length = 5,
) => {
  const UnknownWordModel = getModelForConnection(connection);

  const doc = await UnknownWordModel.findById(id).exec();
  if (!doc) return null;

  const index = doc.words.findIndex(
    (needle) => needle.language === language && needle.word === word,
  );
  if (index !== -1) {
    // remove it
    doc.words.splice(index, 1);
  }

  return doc.save();
};

export const purge = async (connection: Connection) => {
  const UnknownWordModel = getModelForConnection(connection);

  return await UnknownWordModel.deleteMany({}).exec();
};

export const getDocsByWord = async (connection: Connection, word: string) => {
  const UnknownWordModel = getModelForConnection(connection);
  const wordToMatch = word.toLocaleLowerCase();
  const result = await UnknownWordModel.find({
    'words.word': wordToMatch,
  }).exec();

  return result;
};

export const addUnknownWord = async (
  connection: Connection,
  word: string,
  language: string,
  length = 5,
) => {
  const wordToAdd = word.toLocaleLowerCase();

  const UnknownWordModel = getModelForConnection(connection);
  const today = getStartOfDay();

  let doc = await UnknownWordModel.findOne({
    date: today,
  }).exec();

  if (doc === null) {
    doc = await UnknownWordModel.create({
      date: today,
    });
  }

  // check other days first
  const other = await getDocsByWord(connection, wordToAdd);
  if (other && other.length > 0) {
    // we have a match, no need to store another copy
  } else {
    // we dont have other words like that, check todays
    if (
      doc.words.findIndex(
        (needle) => needle.language === language && needle.word === wordToAdd,
      ) === -1
    ) {
      // not found, add it
      doc.words.push({
        language,
        length,
        word: wordToAdd,
      });
    }
  }

  return doc.save();
};
