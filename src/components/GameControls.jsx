import React from 'react';

export default function GameControls({ isPaused, onTogglePause, onRestartGame }) {
  return (
    <div className="controls">
      <button onClick={onTogglePause}>
        {isPaused ? "Resume" : "Pause"}
      </button>
      <button onClick={onRestartGame}>Restart</button>
    </div>
  );
}
