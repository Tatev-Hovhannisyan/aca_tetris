import { useEffect, useState, useCallback } from "react";
import "./App.scss";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DIRECTIONS,
  initialFallSpeed, 
  scorePerLevel,    
  speedDecreasePerLevel, 
  minFallSpeed,     
} from "./constants";
import { getRandomShape, clearFullRows, move, rotate } from "./service"; 


 // Initializes an empty game board.
 
const initialBoard = () =>
  Array(BOARD_HEIGHT)
    .fill(null)
    .map(() =>
      Array(BOARD_WIDTH)
        .fill(null)
        .map(() => ({ isMarked: false, color: null, isClearing: false, animationDelay: null })) 
    );


 //Merges the current falling shape with a copy of the main board for display purposes.
 
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


 //Prepares a shape's matrix for display on a smaller grid (like the next shape preview).
 
function getShapeMatrixForDisplay(shape) {
  if (!shape || !shape.shape) return [];

  const matrix = shape.shape;
  let minRow = matrix.length;
  let maxRow = -1;
  let minCol = matrix[0].length;
  let maxCol = -1;

  // Find the actual occupied bounds within the shape's matrix
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


   // Handles the automatic downward movement of the current shape.
   
  const moveDown = useCallback(() => {
    if (isGameOver || isPaused) return; 

    try {      
      const { newBoard, newShape } = move(board, currentShape, DIRECTIONS.DOWN);
      setBoard(newBoard);
      setCurrentShape(newShape);
    } catch (e) {    
      console.error("Move Down Failed:", e.message); 

      // Check if any part of the shape is still above the board (game over condition).
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

        // Check if there are full rows to clear
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

          // Wait for the entire animation to complete
          setTimeout(() => {
            
            const { newBoard: cleared, clearedLines } = clearFullRows(landedBoard); 
            setScore((prev) => prev + clearedLines * 100);
            setBoard(cleared); 
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

  // Effect for the game loop (automatic downward movement).
  useEffect(() => {
    if (isGameOver || isPaused) { 
      return;
    }
    const timer = setTimeout(moveDown, fallSpeed); 
    return () => clearTimeout(timer); 
  }, [moveDown, isGameOver, isPaused, fallSpeed]); 
  // Effect to dynamically adjust fall speed and level based on score
  useEffect(() => {
   
    const newLevel = Math.floor(score / scorePerLevel) + 1; 
    let calculatedFallSpeed = initialFallSpeed - ((newLevel - 1) * speedDecreasePerLevel);
    
    calculatedFallSpeed = Math.max(calculatedFallSpeed, minFallSpeed);
    
    if (calculatedFallSpeed !== fallSpeed) {
      setFallSpeed(calculatedFallSpeed);
      console.log(`Score: ${score}. Level: ${newLevel}. New fall speed: ${calculatedFallSpeed}ms.`);
    }
    
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [score, fallSpeed, level, initialFallSpeed, speedDecreasePerLevel, scorePerLevel, minFallSpeed]); 

  // Effect for handling keyboard input (left, right, down, rotate).
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return; 

      
      if (e.key === "p" || e.key === "P" || e.key === " ") { 
        setIsPaused((prev) => !prev);
        return; 
      }

      if (isPaused) return; 

      console.log("Key pressed:", e.key); 

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
          console.log("Rotate triggered"); 
         
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

  // Function to restart the game
  const restartGame = useCallback(() => {
    setBoard(initialBoard());
    setCurrentShape(getRandomShape()); 
    setNextShape(getRandomShape()); 
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    setFallSpeed(initialFallSpeed); 
    setLevel(1); 
  }, [initialFallSpeed]); 

  const merged = getMergedBoard(board, currentShape);

  
  const nextShapeDisplayMatrix = getShapeMatrixForDisplay(nextShape);

  return (
    <div className="container">
      {isGameOver && <div className="game-over">Game Over</div>}
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
            <div className="score">Score: {score}</div>
            <div className="level">Level: {level}</div>
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
