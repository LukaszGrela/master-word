import { Connection } from 'mongoose';
import { getModelForConnection } from '../models/UnknownWord';
import { ObjectId } from 'mongoose';
import { TSupportedLanguages } from '../../types';
import { getStartOfDay } from '../../utils/datetime';

export const localeSorter =
  (language: TSupportedLanguages) => (a: string, b: string) => {
    try {
      return a.localeCompare(b, language);
    } catch (e) {
      /* istanbul ignore next */
      return 0;
    }
  };

const getAll = async (connection: Connection) => {
  const UnknownWordModel = getModelForConnection(connection);

  const list = await UnknownWordModel.find({}).exec();

  return list;
};

const getByDate = async (connection: Connection, date: Date) => {
  const UnknownWordModel = getModelForConnection(connection);

  const list = await UnknownWordModel.find({
    date,
  }).exec();

  return list;
};

const getById = async (connection: Connection, id: ObjectId | any) => {
  const UnknownWordModel = getModelForConnection(connection);

  const list = await UnknownWordModel.findById(id).exec();

  return list;
};

const purge = async (connection: Connection, id: ObjectId | any) => {
  const UnknownWordModel = getModelForConnection(connection);

  await UnknownWordModel.deleteMany({}).exec();
};

const removeById = async (connection: Connection, id: ObjectId | any) => {
  const UnknownWordModel = getModelForConnection(connection);

  const list = await UnknownWordModel.findByIdAndDelete(id).exec();

  return list;
};

const addUnknownWord = async (
  connection: Connection,
  word: string,
  language: TSupportedLanguages,
  length = 5
) => {
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

  if (
    doc.words.findIndex(
      (needle) => needle.language === language && needle.word === word
    ) === -1
  ) {
    // not found, add it
    doc.words.push({
      language,
      length,
      word,
    });
  }

  return doc.save();
};

export { getAll, getByDate, getById, purge, removeById, addUnknownWord };
