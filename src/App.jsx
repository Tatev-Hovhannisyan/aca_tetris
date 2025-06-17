import { useEffect, useState } from "react";
import "./App.scss";

function App() {
  const width = 10;
  const height = 20;

  const [selectedRow, setSelectedRow] = useState(0);
  const [board, setBoard] = useState(() =>
    Array(height)
      .fill(null)
      .map(() => Array(width).fill(null))
  );
  const [gameOver, setGameOver] = useState(false);
  const selectedJ = 5;

  useEffect(() => {
    if (gameOver) return;

    const timer = setTimeout(() => {
      const newBoard = board.map((row) => [...row]);
      const atBottom = selectedRow === height - 1;
      const belowIsFrozen =
        !atBottom && board[selectedRow + 1][selectedJ] === false;

      if (selectedRow > 0) {
        newBoard[selectedRow - 1][selectedJ] = null;
      }

      if (atBottom || belowIsFrozen) {
        if (selectedRow === 0 && board[selectedRow][selectedJ] === false) {
          setGameOver(true);
          return;
        }

        newBoard[selectedRow][selectedJ] = false;
        setBoard(newBoard);
        setSelectedRow(0);
        return;
      }

      newBoard[selectedRow][selectedJ] = true;
      setBoard(newBoard);
      setSelectedRow((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedRow, board, gameOver]);

  return (
    <div className="container">
      {gameOver && <div className="game-over">Game Over</div>}
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
