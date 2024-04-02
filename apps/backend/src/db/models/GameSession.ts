import mongoose from 'mongoose';
import { TGameSession } from '@repo/backend-types';
import { GameSessionSchema } from '../schemas/GameSessionSchema';

const MODEL_NAME = 'GameSession' as const;
const GameSession = mongoose.model<TGameSession>(MODEL_NAME, GameSessionSchema);

const getModelForConnection = (connection: mongoose.Connection) => {
  const GameSessionModel = connection.model<TGameSession>(
    MODEL_NAME,
    GameSessionSchema,
  );

  return GameSessionModel;
};

export { GameSession, getModelForConnection };
