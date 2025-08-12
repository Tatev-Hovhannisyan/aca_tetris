import React from 'react';

export default function OptionsScreen({ onGoBack }) {
  return (
    <div className="options-container">
      <h2>Controls</h2>
      <ul>
        <li><strong>Left Arrow:</strong> Move Left</li>
        <li><strong>Right Arrow:</strong> Move Right</li>
        <li><strong>Down Arrow:</strong> Move Down</li>
        <li><strong>Up Arrow:</strong> Rotate Shape</li>
        <li><strong>P / Space:</strong> Pause / Resume</li>
      </ul>
      <button onClick={onGoBack}>Back to Menu</button>
    </div>
  );
}
