import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";

const checkIsShapePart = (shapeCoords, newI, newJ) =>
  shapeCoords.some((cell) => cell.i === newI && cell.j === newJ);

export const validateBoard = (board) => {
  if (!Array.isArray(board)) throw new Error();

  const hasInvalidRow = board.some((row) => !Array.isArray(row));
  if (hasInvalidRow) throw new Error();
};

export const validateShape = (shape) => {
  if (!Array.isArray(shape)) throw new Error();

  const hasInvalidCell = shape.some(
    (cell) =>
      typeof cell !== "object" ||
      !Number.isFinite(cell.i) ||
      !Number.isFinite(cell.j)
  );

  if (hasInvalidCell)
    throw new Error("Shape contains invalid {i,j} coordinates");
};

export const validateLeftMove = (board, shape) => {
  shape.forEach(({ i, j }) => {
    const isTargetCellPartOfCurrentShape = checkIsShapePart(shape, i, j - 1);

    if (
      j === 0 ||
      (board[i]?.[j - 1]?.isMarked && !isTargetCellPartOfCurrentShape)
    ) {
      throw new Error("Left move failed");
    }
  });
};

export const validateRightMove = (board, shape) => {
  shape.forEach(({ i, j }) => {
    const isTargetCellPartOfCurrentShape = checkIsShapePart(shape, i, j + 1);

    if (
      j === BOARD_WIDTH - 1 ||
      (board[i]?.[j + 1]?.isMarked && !isTargetCellPartOfCurrentShape)
    ) {
      throw new Error("Right move failed");
    }
  });
};

export const validateDownMove = (board, shape) => {
  shape.forEach(({ i, j }) => {
    const isTargetCellPartOfCurrentShape = checkIsShapePart(shape, i + 1, j);

    if (
      i === BOARD_HEIGHT - 1 ||
      (board[i + 1]?.[j]?.isMarked && !isTargetCellPartOfCurrentShape)
    ) {
      throw new Error("Down move failed");
    }
  });
};

export function validateRotation(
  board,
  originalShapeCoords,
  rotatedShapeMatrix
) {
  // Find the top-left corner of the original shape's bounding box.
  // This is crucial because the rotation happens relative to its current position.
  let minI = Infinity;
  let minJ = Infinity;

  originalShapeCoords.forEach(({ i, j }) => {
    if (i < minI) minI = i;
    if (j < minJ) minJ = j;
  });

  // Loop through the rotated shape matrix to check each potential new cell.
  for (let i = 0; i < rotatedShapeMatrix.length; i++) {
    for (let j = 0; j < rotatedShapeMatrix[0].length; j++) {
      if (!rotatedShapeMatrix[i][j]) continue;

      const boardI = minI + i;
      const boardJ = minJ + j;

      // 1. Check if the rotated cell is out of horizontal bounds or below the board.
      // We allow cells to be above the board (boardI < 0) as shapes start there.
      if (boardJ < 0 || boardJ >= BOARD_WIDTH || boardI >= BOARD_HEIGHT) {
        throw new Error("Rotation is out of bounds (hit wall or bottom)");
      }

      // 2. Check for collision with already landed blocks.
      const isCellCurrentlyPartOfOriginalShape = checkIsShapePart(
        originalShapeCoords,
        boardI,
        boardJ
      );

      if (
        boardI >= 0 &&
        board[boardI][boardJ]?.isMarked &&
        !isCellCurrentlyPartOfOriginalShape
      ) {
        throw new Error("Rotation collides with another landed shape");
      }
    }
  }
}
