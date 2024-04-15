import React, { useMemo } from 'react';
import { classNames } from '@repo/utils';
import { IBoard } from '../types';
import './Board.scss';

/* Grid Board */
const Board: React.FC<IBoard> = ({
  children,
  columns,
  rows,
  className,
}): JSX.Element => {
  const style = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      width: `calc(calc(${
        columns - 1
      } * var(--gd-board-gap)) + calc(${columns} * var(--gd-board-size)))`,
    }),
    [columns, rows],
  );

  return (
    <div
      data-testid="board"
      className={classNames('board', className)}
      style={style}
    >
      {children}
    </div>
  );
};

export default Board;
