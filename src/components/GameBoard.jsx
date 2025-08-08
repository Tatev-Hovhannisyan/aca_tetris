import React from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

export default function GameBoard({ mergedBoard }) {
  return (
    <div className="board">
      {mergedBoard.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`cell ${cell.isMarked ? "marked" : ""} ${cell.isClearing ? "clearing" : ""}`}
            style={{
              backgroundColor: cell.color || "transparent",
              transitionDelay: cell.animationDelay || '0s'
            }}
          />
        ))
      )}
    </div>
  );
}
