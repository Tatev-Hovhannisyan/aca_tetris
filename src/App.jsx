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
import GameBoard from "./components/GameBoard";
import GameInfo from "./components/GameInfo";
import NextShapeDisplay from "./components/NextShapeDisplay";
import GameControls from "./components/GameControls";
import GameStatusOverlay from "./components/GameStatusOverlay";
import MainMenu from "./components/MainMenu";
import OptionsScreen from "./components/OptionsScreen";

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

export default function App() {
  const [board, setBoard] = useState(initialBoard);
  const [currentShape, setCurrentShape] = useState(null); 
  const [nextShape, setNextShape] = useState(getRandomShape);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fallSpeed, setFallSpeed] = useState(initialFallSpeed);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState('menu');

  const startGame = useCallback(() => {
    setBoard(initialBoard());
    setCurrentShape(getRandomShape());
    setNextShape(getRandomShape());
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    setFallSpeed(initialFallSpeed);
    setLevel(1);
    setLines(0);
    setGameState('playing');
    if (gameRef.current) {
      gameRef.current.focus();
    }
  }, [initialFallSpeed]);

  const showOptions = useCallback(() => {
    setGameState('options');
  }, []);

  const goBackToMenu = useCallback(() => {
    setGameState('menu');
    setBoard(initialBoard());
    setCurrentShape(null);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const moveDown = useCallback(() => {
    if (gameState !== 'playing' || isGameOver || isPaused) return;
    if (!currentShape) return;

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
                isMarked: false, 
                color: null,
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
  }, [board, currentShape, isGameOver, isPaused, nextShape, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || isGameOver || isPaused) {
      return;
    }
    const timer = setTimeout(moveDown, fallSpeed);
    return () => clearTimeout(timer);
  }, [moveDown, isGameOver, isPaused, fallSpeed, currentShape, gameState]);

  useEffect(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    let calculatedFallSpeed = initialFallSpeed - (newLevel - 1) * intervalDecreasePerLevel;
    calculatedFallSpeed = Math.max(calculatedFallSpeed, minFallInterval);
    if (calculatedFallSpeed !== fallSpeed) {
      setFallSpeed(calculatedFallSpeed);
    }
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [lines, fallSpeed, level, initialFallSpeed, intervalDecreasePerLevel, minFallInterval]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleTogglePause = useCallback(() => {
    if (gameState === 'playing') {
      setIsPaused((prev) => !prev);
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || isGameOver) return;

      if (e.key === "p" || e.key === "P" || e.key === " ") {
        handleTogglePause();
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
        console.error("Invalid move or rotation:", error.message);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, currentShape, isGameOver, isPaused, moveDown, handleTogglePause, gameState]);

  const mergedBoard = getMergedBoard(board, currentShape);

  return (
    <div className="container" ref={gameRef} tabIndex={0}>
      {gameState === 'menu' && (
        <MainMenu onStartGame={startGame} onShowOptions={showOptions} />
      )}
      {gameState === 'options' && (
        <OptionsScreen onGoBack={goBackToMenu} />
      )}
      {gameState === 'playing' && (
        <>
          {(isGameOver || isPaused) && (
            <GameStatusOverlay isGameOver={isGameOver} isPaused={isPaused} onRestartGame={restartGame} />
          )}
          <div className="board-and-info">
            <GameBoard mergedBoard={mergedBoard} />
            <div className="side-info">
              <GameInfo score={score} level={level} lines={lines} />
              <NextShapeDisplay nextShape={nextShape} />
              <GameControls 
                isPaused={isPaused} 
                onTogglePause={handleTogglePause} 
                onRestartGame={restartGame}
                onGoBackToMenu={goBackToMenu} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
