import React from 'react';
import { LanguageContext } from '.';

export function useLanguage() {
  return React.useContext(LanguageContext);
}
