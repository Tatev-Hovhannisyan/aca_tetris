import React from 'react';

export default function GameStatusOverlay({ isGameOver, isPaused, onRestartGame }) {
  if (isGameOver) {
    return (
      <div className="game-over">
        Game Over
        <button className="restart-button" onClick={onRestartGame}>Restart</button>
      </div>
    );
  }
  if (isPaused) {
    return <div className="game-paused">Paused</div>;
  }
  return null;
}
