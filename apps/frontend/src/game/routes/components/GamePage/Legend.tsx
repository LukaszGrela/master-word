import { FC } from 'react';

export const Legend: FC<{
  incorrect: string;
  correct: string;
  misplaced: string;
}> = ({ correct, incorrect, misplaced }) => {
  return (
    <div className="legend">
      <span className="incorrect">{incorrect}</span>
      <span className="misplaced">{misplaced}</span>
      <span className="correct">{correct}</span>
    </div>
  );
};
