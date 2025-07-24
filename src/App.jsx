import { useEffect, useState, useCallback } from "react";
import "./App.scss";
import { BOARD_HEIGHT, BOARD_WIDTH, DIRECTIONS } from "./constants";
import { getRandomShape, clearFullRows, move, rotate } from "./service";

const initialBoard = () =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() =>
      Array(BOARD_WIDTH)
        .fill(null)
        .map(() => ({
          isMarked: false,
          color: null,
          isClearing: false,
          animationDelay: null,
        }))
    );


function getMergedBoard(board, shape) {
  const merged = board.map((row) => row.map((cell) => ({ ...cell })));

  if (shape) {
    shape.coords.forEach(({ i, j }) => {
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        merged[i][j] = {
          isMarked: true,
          color: shape.color,
          isClearing: false,
          animationDelay: null,
        };
      }
    });
  }
  return merged;
}

export default function App() {
  const [board, setBoard] = useState(initialBoard);
  const [currentShape, setCurrentShape] = useState(getRandomShape);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false); 


  const moveDown = useCallback(() => {
    if (isGameOver || isPaused) return; 

    try {
      // Attempt to move the shape down.
      const { newBoard, newShape } = move(board, currentShape, DIRECTIONS.DOWN);
      setBoard(newBoard);
      setCurrentShape(newShape);
    } catch (e) {
      // Check if any part of the shape is still above the board (game over condition).
      const isOver = currentShape.coords.some(({ i }) => i < 0);
      if (isOver) {
        setIsGameOver(true); 
      } else {
        // The shape has landed. Permanently merge it onto the board.
        const landedBoard = board.map((row) =>
          row.map((cell) => ({ ...cell }))
        );
        currentShape.coords.forEach(({ i, j }) => {
          if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
            landedBoard[i][j] = {
              isMarked: true,
              color: currentShape.color,
              isClearing: false,
              animationDelay: null,
            };
          }
        });

        // Check if there are full rows to clear
        const rowsToClearIndexes = [];
        for (let i = 0; i < landedBoard.length; i++) {
          if (landedBoard[i].every((cell) => cell && cell.isMarked)) {
            rowsToClearIndexes.push(i);
          }
        }

        if (rowsToClearIndexes.length > 0) {
          // If there are rows to clear, first trigger the disappearing animation
          const boardForAnimation = landedBoard.map((row, rowIndex) => {
            if (rowsToClearIndexes.includes(rowIndex)) {
              // Mark cells in this row as "clearing" and set animation delay
              return row.map((cell, colIndex) => ({
                ...cell,
                isClearing: true,
                // Animation delay: each subsequent cell to the right starts later
                animationDelay: `${colIndex * 30}ms`, // 30ms delay per column, can be adjusted
              }));
            }
            return row;
          });

          setBoard(boardForAnimation); // Update board to apply CSS .clearing class
          setCurrentShape(null); // Key change: remove shape so it doesn't display during clearing animation

          // Calculate total animation duration: max delay + transition duration
          const animationDuration = 300;
          const maxDelay = (BOARD_WIDTH - 1) * 30;
          const totalAnimationTime = animationDuration + maxDelay;

          // Wait for the entire animation to complete
          setTimeout(() => {
         
            const { newBoard: cleared, clearedLines } =
              clearFullRows(landedBoard); 
            setScore((prev) => prev + clearedLines * 100);
            setBoard(cleared);
            setCurrentShape(getRandomShape()); 
          }, totalAnimationTime);
        } else {
       
          setBoard(landedBoard);
          setCurrentShape(getRandomShape());
        }
      }
    }
  }, [board, currentShape, isGameOver, isPaused]);


  useEffect(() => {
    if (isGameOver || isPaused) {
      return;
    }
    const timer = setTimeout(moveDown, 500); 
    return () => clearTimeout(timer); 
  }, [ isGameOver, isPaused]); 


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return; 
  
      if (e.key === "p" || e.key === "P") {
        setIsPaused((prev) => !prev);
        return; 
      }

      if (isPaused) return; 
      console.log("Key pressed:", e.key); 

      try {
        if (e.key === "ArrowLeft") {
          const { newBoard, newShape } = move(
            board,
            currentShape,
            DIRECTIONS.LEFT
          );
          setBoard(newBoard);
          setCurrentShape(newShape);
        } else if (e.key === "ArrowRight") {
          const { newBoard, newShape } = move(
            board,
            currentShape,
            DIRECTIONS.RIGHT
          );
          setBoard(newBoard);
          setCurrentShape(newShape);
        } else if (e.key === "ArrowDown") {
          moveDown(); // Call the memoized moveDown function
        } else if (e.key === "ArrowUp") {
          console.log("Rotate triggered"); 
          const { newBoard, newShape } = rotate(board, currentShape);
          setBoard(newBoard);
          setCurrentShape(newShape);
        }
      } catch (error) {
        console.error("Invalid move:", error.message); // Output specific error message
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); 
  }, [board, currentShape, isGameOver, isPaused, moveDown]); 
  

  const restartGame = useCallback(() => {
    setBoard(initialBoard());
    setCurrentShape(getRandomShape());
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
  }, []);

  // Prepare the board for rendering by merging the current falling shape.
  const merged = getMergedBoard(board, currentShape);

  return (
    <div className="container">
      {isGameOver && <div className="game-over">Game Over</div>}
      {isPaused && !isGameOver && (
        <div className="game-paused">Paused</div>
      )}{" "}
      {}
      <div className="board">
        {merged.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`cell ${cell.isMarked ? "marked" : ""} ${
                cell.isClearing ? "clearing" : ""
              }`}
              style={{
                backgroundColor: cell.color || "transparent",
                transitionDelay: cell.animationDelay || "0s", 
              }}
            />
          ))
        )}
      </div>
      <div className="score">Score: {score}</div>
      <div className="controls">
        <button onClick={() => setIsPaused((prev) => !prev)}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button onClick={restartGame}>Restart</button>
      </div>
    </div>
  );
}
