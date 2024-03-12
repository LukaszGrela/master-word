import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import connect from '../../../db/connect';
import { StatusCodes } from 'http-status-codes';
import { getModelForConnection } from '../../../db/models/Dictionary';
import { TAddWordRequestBody } from './types';
import { addUnknownWord } from '../../../db/crud/UnknownWord.crud';
import { TSupportedLanguages } from '../../../types';

let connection: mongoose.Connection | undefined;

export function ensureDictionaryDevConnection(): RequestHandler {
  return async function ensureDictionaryDevConnectionRequestHandler(
    req,
    res,
    next,
  ) {
    const connectToDb = async () => {
      try {
        /*
         connection = await createDictionaryDevConnection();
        /*/
        await connect();
        connection = mongoose.connection;
        // */
        console.log('DB Connection status', connection.readyState);

        // register models to that connection
        getModelForConnection(connection);

        next();
      } catch (error) {
        console.error(error);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json('DB Connection failure');
      }
    };
    if (connection) {
      if (connection.readyState === 1) {
        next();
      } else if (connection.readyState === 2) {
        // connecting - wait for connected
        const connectingOk = () => {
          connection?.off('connected', connectingOk);
          connection?.off('disconnected', connectingFailure);
          next();
        };
        const connectingFailure = async () => {
          connection?.off('connected', connectingOk);
          connection?.off('disconnected', connectingFailure);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json('DB Connection failure while connecting.');
        };
        connection.on('connected', connectingOk);
        connection.on('disconnected', connectingFailure);
      } else if (connection.readyState === 0) {
        await connectToDb();
      } else {
        // 3 = disconnecting
        // 99 = uninitialized
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json('DB Connection failure');
      }
    } else {
      // no connection at all
      await connectToDb();
    }
  };
}

export const dictionaryDevConnection = () => connection;

export const logUnknownWord = async (body: TAddWordRequestBody) => {
  const { word, language = 'pl', length = 5 } = body;

  try {
    if (mongoose.connection.readyState === 1) {
      await addUnknownWord(
        mongoose.connection,
        word,
        language as TSupportedLanguages,
        length,
      );
    } else {
      throw new Error('No DB Connection error');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Unknown error');
  }
};
