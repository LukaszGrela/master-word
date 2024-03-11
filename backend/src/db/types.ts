export type TConfig = {
  mongo: {
    hostString: string;
    user?: string;
    db: string;
  };
};

export interface IDictionaryEntry {
  language: string;
  length: number;
  letter: string;
  words?: string[];
}

export interface IUnknownWordEntry {
  date: Date;
  words: { language: string; word: string; length?: number }[];
}
