import { FC } from 'react';

export const Info: FC<{ text: string }> = ({ text }) => {
  return <p className="read-the-docs">{text}</p>;
};
