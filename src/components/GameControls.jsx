import React from 'react';

export default function GameControls({ isPaused, onTogglePause, onRestartGame, onGoBackToMenu }) {
  return (
    <div className="controls">
      <button onClick={onTogglePause}>
        {isPaused ? "Resume" : "Pause"}
      </button>
      <button onClick={onRestartGame}>Restart</button>
      <button className="back-to-menu-button" onClick={onGoBackToMenu}>Back to Menu</button>
    </div>
  );
}
