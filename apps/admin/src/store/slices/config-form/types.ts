import { IConfigEntry, TConfigEntryKey } from '@repo/backend-types/db';

// Add any new config keys with respective type
export type TConfigEntryKeyValueTypeMap = {
  supportedLanguages: string[];
  supportedAttempts: number[];
  supportedLength: number[];
  enabledLanguages: string[];
  enabledAttempts: number[];
  enabledLength: number[];
};

export type THydratedConfigValueTypeCombination<Key extends TConfigEntryKey> = {
  [Key in keyof TConfigEntryKeyValueTypeMap]: {
    key: Key;
    value: TConfigEntryKeyValueTypeMap[Key];
    defaultsTo?: TConfigEntryKeyValueTypeMap[Key];
    original: {
      value: TConfigEntryKeyValueTypeMap[Key];
      appId: IConfigEntry['appId'];
    };
    sourceValues?: TConfigEntryKeyValueTypeMap[Key];
  };
}[Key];

export type TSetHydrateConfigValueParamType<Key extends TConfigEntryKey> = Pick<
  THydratedConfigValueTypeCombination<Key>,
  'value' | 'key'
>;

export type THydratedEntry<Key extends TConfigEntryKey> = Pick<
  IConfigEntry,
  'appId' | 'sourceValuesKey'
> &
  THydratedConfigValueTypeCombination<Key> & {
    isModified: boolean;
    isNew: boolean;
    isDeleted: boolean;
  };

export type TForms = { [key in TConfigEntryKey]?: THydratedEntry<key> };

export interface IConfigFormState {
  forms: TForms;
}

// const a: THydratedEntry<'supportedLanguages'> = {
//   key: 'supportedLanguages',
//   appId: [],
//   isDeleted: false,
//   isModified: false,
//   isNew: false,
//   value: ['pl'],
//   original: {
//     appId: ['frontend'],
//     value: ['pl'],
//   },
//   defaultsTo: [],
//   sourceValues: [],
//   sourceValuesKey: 'supportedAttempts',
// };
// console.log(a);
// const form: TForms = {
//   enabledAttempts: {
//     key: 'enabledAttempts',
//     value: [5],

//     appId: ['frontend', 'backend'],

//     original: {
//       appId: ['frontend'],
//       value: [5],
//     },

//     defaultsTo: [5],
//     sourceValues: [],
//     sourceValuesKey: 'supportedAttempts',

//     isModified: true,
//     isNew: false,
//     isDeleted: false,
//   },
// };
// console.log(form.enabledAttempts);
