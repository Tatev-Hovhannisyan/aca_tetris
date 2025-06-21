import { useEffect, useState } from "react";
import "./App.scss";

function clearActiveCell(board) {
  return board.map((row) =>
    row.map((cell) => (cell === true ? null : cell))
  );
}

function App() {
  const width = 10;
  const height = 20;

  const [selectedRow, setSelectedRow] = useState(0);
  const [board, setBoard] = useState(() =>
    Array(height)
      .fill(null)
      .map(() => Array(width).fill(null))
  );
  const [isGameOver, setGameOver] = useState(false);
  const [selectedJ, setSelectedJ] = useState(Math.floor(Math.random() * width));

  useEffect(() => {
    if (isGameOver) return;

    const timer = setTimeout(() => {
      let newBoard = clearActiveCell(board);

      const isAtBottom = selectedRow === height - 1;
      const isFrozen =
        !isAtBottom && board[selectedRow + 1][selectedJ] === false;

      if (isAtBottom || isFrozen) {
        if (selectedRow === 0 && board[selectedRow][selectedJ] === false) {
          setGameOver(true);
          return;
        }

        newBoard[selectedRow][selectedJ] = false;
        setBoard(newBoard);
        setSelectedRow(0);
        setSelectedJ(Math.floor(Math.random() * width));
        return;
      }

      newBoard[selectedRow][selectedJ] = true;
      setBoard(newBoard);
      setSelectedRow((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedRow, board, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;

      const isLeft = e.key === "ArrowLeft";
      const isRight = e.key === "ArrowRight";

      let newBoard = clearActiveCell(board);

      if (
        isLeft &&
        selectedJ > 0 &&
        board[selectedRow][selectedJ - 1] !== false
      ) {
        newBoard[selectedRow][selectedJ - 1] = true;
        setSelectedJ((prev) => prev - 1);
      } else if (
        isRight &&
        selectedJ < width - 1 &&
        board[selectedRow][selectedJ + 1] !== false
      ) {
        newBoard[selectedRow][selectedJ + 1] = true;
        setSelectedJ((prev) => prev + 1);
      } else {
         newBoard[selectedRow][selectedJ] = true;
      }

      setBoard(newBoard);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedJ, selectedRow, board, isGameOver]);

  return (
    <div className="container">
      {isGameOver && <div className="game-over">Game Over</div>}
      {board.map((row, i) => (
        <div className="row" key={i}>
          {row.map((cell, j) => (
            <div
              className={`cell ${cell === true ? "marked" : ""} ${
                cell === false ? "frozen" : ""
              }`}
              key={j}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
