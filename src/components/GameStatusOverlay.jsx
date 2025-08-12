import React from "react";

export default function GameStatusOverlay({
  isGameOver,
  isPaused,
  onRestartGame,
}) {
  if (isGameOver) {
    return (
      <div className="game-status-overlay">
        <div className="game-over">Game Over</div>
        <button className="restart-button" onClick={onRestartGame}>
          Restart
        </button>
      </div>
    );
  }
  if (isPaused) {
    // Изменено: Оборачиваем div с классом "game-paused" в "game-status-overlay"
    return (
      <div className="game-status-overlay">
        <div className="game-paused">Paused</div>
      </div>
    );
  }
  return null;
}
