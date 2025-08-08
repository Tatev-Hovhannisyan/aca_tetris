import React from 'react';

export default function GameInfo({ score, level, lines }) {
  return (
    <div className="score-level-display">
      <div className="info-box">Score: {score}</div>
      <div className="info-box">Level: {level}</div>
      <div className="info-box">Lines: {lines}</div>
    </div>
  );
}
