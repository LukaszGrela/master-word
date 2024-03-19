import { store } from '../index';

type TStore = typeof store;

export const getStore = (): TStore => store;
