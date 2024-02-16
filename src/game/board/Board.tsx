import React from 'react';
import { IBoard } from '../types';
import './Board.css';

/* Grid Board */
const Board: React.FC<IBoard> = ({ children, columns, rows }): JSX.Element => {
  const style = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    width: `calc(calc(${columns - 1} * 0.25rem) + calc(${columns} * 4rem))`,
  };

  return (
    <div className='board' style={style}>
      {children}
    </div>
  );
};

export default Board;
