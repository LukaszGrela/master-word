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
