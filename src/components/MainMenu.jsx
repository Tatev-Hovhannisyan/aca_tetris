import React from 'react';

export default function MainMenu({ onStartGame, onShowOptions }) {
  return (
    <div className="main-menu">
      <h1>Tetris Game</h1>
      <button onClick={onStartGame}>Play</button>
      <button onClick={onShowOptions}>Options</button>
    </div>
  );
}
