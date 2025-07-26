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

export function validateRotation(board, originalShapeCoords, newShapeCoords) {
  for (const {i, j} of newShapeCoords) {
    // Allow coordinates above the board (negative i)
    if (j < 0 || j >= BOARD_WIDTH || i >= BOARD_HEIGHT) {
      throw new Error("Rotation would go out of bounds");
    }
    
    // Check for collisions with existing blocks (but ignore original shape positions)
    const isOriginalPosition = originalShapeCoords.some(
      cell => cell.i === i && cell.j === j
    );
    
    if (i >= 0 && board[i][j]?.isMarked && !isOriginalPosition) {
      throw new Error("Rotation would collide with existing block");
    }
  }
  }