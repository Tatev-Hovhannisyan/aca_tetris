import { useEffect, useState, useCallback, useRef } from "react";
import "./App.scss";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DIRECTIONS,
  initialFallSpeed,
  intervalDecreasePerLevel,
  minFallInterval,
} from "./constants";
import {
  getRandomShape,
  move,
  rotate,
  clearFullRows,
} from "./service";

// App component and styling below for a complete, runnable example.
const initialBoard = () =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() =>
      Array(BOARD_WIDTH)
        .fill(null)
        .map(() => ({ isMarked: false, color: null, isClearing: false, animationDelay: null }))
    );

function getMergedBoard(board, shape) {
  const merged = board.map((row) => row.map((cell) => ({ ...cell })));
  if (shape) {
    shape.coords.forEach(({ i, j }) => {
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        merged[i][j] = { isMarked: true, color: shape.color, isClearing: false, animationDelay: null };
      }
    });
  }
  return merged;
}

function getShapeMatrixForDisplay(shape) {
  if (!shape || !shape.shape) return [];
  const matrix = shape.shape;
  let minRow = matrix.length, maxRow = -1, minCol = matrix[0].length, maxCol = -1;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j]) {
        if (i < minRow) minRow = i;
        if (i > maxRow) maxRow = i;
        if (j < minCol) minCol = j;
        if (j > maxCol) maxCol = j;
      }
    }
  }
  if (maxRow === -1) return [];
  const trimmedMatrix = [];
  for (let i = minRow; i <= maxRow; i++) {
    const newRow = [];
    for (let j = minCol; j <= maxCol; j++) {
      newRow.push(matrix[i][j]);
    }
    trimmedMatrix.push(newRow);
  }
  return trimmedMatrix;
}

export default function App() {
  const [board, setBoard] = useState(initialBoard);
  const [currentShape, setCurrentShape] = useState(getRandomShape);
  const [nextShape, setNextShape] = useState(getRandomShape);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fallSpeed, setFallSpeed] = useState(initialFallSpeed);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const gameRef = useRef(null);

  const moveDown = useCallback(() => {
    if (isGameOver || isPaused) return;
    try {
      const { newBoard, newShape } = move(board, currentShape, DIRECTIONS.DOWN);
      setBoard(newBoard);
      setCurrentShape(newShape);
    } catch (e) {
      const isOver = currentShape.coords.some(({ i }) => i < 0);
      if (isOver) {
        setIsGameOver(true);
      } else {
        const landedBoard = board.map((row) => row.map((cell) => ({ ...cell })));
        currentShape.coords.forEach(({ i, j }) => {
          if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
            landedBoard[i][j] = { isMarked: true, color: currentShape.color, isClearing: false, animationDelay: null };
          }
        });
        const rowsToClearIndexes = [];
        for (let i = 0; i < landedBoard.length; i++) {
          if (landedBoard[i].every(cell => cell && cell.isMarked)) {
            rowsToClearIndexes.push(i);
          }
        }
        if (rowsToClearIndexes.length > 0) {
          const boardForAnimation = landedBoard.map((row, rowIndex) => {
            if (rowsToClearIndexes.includes(rowIndex)) {
              return row.map((cell, colIndex) => ({
                ...cell,
                isClearing: true,
                animationDelay: `${colIndex * 30}ms`
              }));
            }
            return row;
          });
          setBoard(boardForAnimation);
          setCurrentShape(null);
          const animationDuration = 300;
          const maxDelay = (BOARD_WIDTH - 1) * 30;
          const totalAnimationTime = animationDuration + maxDelay;
          setTimeout(() => {
            const { newBoard: cleared } = clearFullRows(landedBoard);
            setScore((prev) => prev + rowsToClearIndexes.length * 100);
            setBoard(cleared);
            setLines(prev => prev + rowsToClearIndexes.length);
            setCurrentShape(nextShape);
            setNextShape(getRandomShape());
          }, totalAnimationTime);
        } else {
          setBoard(landedBoard);
          setCurrentShape(nextShape);
          setNextShape(getRandomShape());
        }
      }
    }
  }, [board, currentShape, isGameOver, isPaused, nextShape]);

  useEffect(() => {
    if (isGameOver || isPaused) {
      return;
    }
    const timer = setTimeout(moveDown, fallSpeed);
    return () => clearTimeout(timer);
  }, [moveDown, isGameOver, isPaused, fallSpeed]);

  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1; // Level up every 10 lines
    let calculatedFallSpeed = initialFallSpeed - ((newLevel - 1) * intervalDecreasePerLevel);
    calculatedFallSpeed = Math.max(calculatedFallSpeed, minFallInterval);
    if (calculatedFallSpeed !== fallSpeed) {
      setFallSpeed(calculatedFallSpeed);
    }
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [lines, fallSpeed, level, initialFallSpeed, intervalDecreasePerLevel, minFallInterval]);

  const restartGame = useCallback(() => {
    setBoard(initialBoard());
    setCurrentShape(getRandomShape());
    setNextShape(getRandomShape());
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    setFallSpeed(initialFallSpeed);
    setLevel(1);
    setLines(0);
    if (gameRef.current) {
        gameRef.current.focus();
    }
  }, [initialFallSpeed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;
      if (e.key === "p" || e.key === "P" || e.key === " ") {
        setIsPaused((prev) => !prev);
        return;
      }
      if (isPaused) return;
      try {
        if (e.key === "ArrowLeft") {
          const { newBoard, newShape } = move(board, currentShape, DIRECTIONS.LEFT);
          setBoard(newBoard);
          setCurrentShape(newShape);
        } else if (e.key === "ArrowRight") {
          const { newBoard, newShape } = move(board, currentShape, DIRECTIONS.RIGHT);
          setBoard(newBoard);
          setCurrentShape(newShape);
        } else if (e.key === "ArrowDown") {
          moveDown();
        } else if (e.key === "ArrowUp") {
          const { newBoard, newShape } = rotate(board, currentShape);
          setBoard(newBoard);
          setCurrentShape(newShape);
        }
      } catch (error) {
        console.error("Invalid move:", error.message);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, currentShape, isGameOver, isPaused, moveDown]);

  const merged = getMergedBoard(board, currentShape);
  const nextShapeDisplayMatrix = getShapeMatrixForDisplay(nextShape);

  return (
    <div className="container" ref={gameRef} tabIndex={0}>
      {isGameOver && (
        <div className="game-over">
          Game Over
          <button className="restart-button" onClick={restartGame}>Restart</button>
        </div>
      )}
      {isPaused && !isGameOver && <div className="game-paused">Paused</div>}
      <div className="board-and-info">
        <div className="board">
          {merged.map((row, i) => (
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
          ))}
        </div>
        <div className="side-info">
          <div className="score-level-display">
            <div className="info-box">Score: {score}</div>
            <div className="info-box">Level: {level}</div>
            <div className="info-box">Lines: {lines}</div>
          </div>
          <div className="next-shape-container">
            <h3>Next Shape:</h3>
            <div className="next-shape-grid">
              {Array(4).fill(null).map((_, i) => (
                Array(4).fill(null).map((__, j) => {
                  const isOccupied = nextShapeDisplayMatrix[i] && nextShapeDisplayMatrix[i][j];
                  return (
                    <div
                      key={`next-${i}-${j}`}
                      className={`cell-mini ${isOccupied ? "marked-mini" : ""}`}
                      style={{ backgroundColor: isOccupied ? nextShape.color : "transparent" }}
                    />
                  );
                })
              ))}
            </div>
          </div>
          <div className="controls">
            <button onClick={() => setIsPaused((prev) => !prev)}>
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button onClick={restartGame}>Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

