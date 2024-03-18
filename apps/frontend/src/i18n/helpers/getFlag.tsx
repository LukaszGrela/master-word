import React from 'react';

export const getFlag = (language: string): React.ReactNode => {
  switch (language) {
    case 'pl':
      return <>🇵🇱</>;
    case 'en':
      return <>🇺🇸</>;
    default:
      return <>{language.toUpperCase()}</>;
  }
};
