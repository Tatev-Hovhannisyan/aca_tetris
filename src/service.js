import { DIRECTIONS, BOARD_HEIGHT, BOARD_WIDTH } from "./constants";
import { SHAPES } from "./constants";
import {
  validateBoard,
  validateDownMove,
  validateLeftMove,
  validateRightMove,
  validateShape,
  validateRotation,
} from "./validations";

function cloneAffectedRows(board, oldCoords, newCoords) {
  // Collect all unique row indices in shapes that are part of either old or new coordinates.
  const affectedRows = new Set([
    ...oldCoords.map(({ i }) => i),
    ...newCoords.map(({ i }) => i),
  ]);

  const newBoard = board.map((row, i) =>
    affectedRows.has(i) ? row.map((cell) => ({ ...cell })) : row
  );

  return newBoard;
}

export const move = (board, shapeObj, direction) => {
  validateBoard(board);
  validateShape(shapeObj.coords);

  const shapeCoords = shapeObj.coords;
  const shapeColor = shapeObj.color;
  const shapeMatrix = shapeObj.shape;
  const shapeName = shapeObj.name;

  // Determine the potential future coordinates of the shape for cloning purposes.
  const futureShapeCoords = shapeCoords.map(({ i, j }) => {
    if (direction === DIRECTIONS.DOWN) return { i: i + 1, j };
    if (direction === DIRECTIONS.LEFT) return { i, j: j - 1 };
    if (direction === DIRECTIONS.RIGHT) return { i, j: j + 1 };
    return { i, j };
  });

  // Clone only the rows that will be affected by the move (old and new positions).
  const newBoard = cloneAffectedRows(board, shapeCoords, futureShapeCoords);

  const newShapeCoords = [];

  if (direction === DIRECTIONS.LEFT) {
    validateLeftMove(board, shapeCoords);

    shapeCoords.forEach(({ i, j }) => {
      // Clear the old position on the board if it's within bounds
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = { isMarked: false, color: null };
      }
      // Mark the new position on the board if it's within bounds
      if (i >= 0 && i < BOARD_HEIGHT && j - 1 >= 0 && j - 1 < BOARD_WIDTH) {
        newBoard[i][j - 1] = { isMarked: true, color: shapeColor };
      }
      newShapeCoords.push({ i, j: j - 1 });
    });
  } else if (direction === DIRECTIONS.RIGHT) {
    validateRightMove(board, shapeCoords);

    shapeCoords.forEach(({ i, j }) => {
      // Clear the old position on the board if it's within bounds
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = { isMarked: false, color: null };
      }
      // Mark the new position on the board if it's within bounds
      if (i >= 0 && i < BOARD_HEIGHT && j + 1 >= 0 && j + 1 < BOARD_WIDTH) {
        newBoard[i][j + 1] = { isMarked: true, color: shapeColor };
      }
      newShapeCoords.push({ i, j: j + 1 });
    });
  } else if (direction === DIRECTIONS.DOWN) {
    validateDownMove(board, shapeCoords); // Validate move using the original board and shape coordinates

    const sortedShape = [...shapeCoords].sort((a, b) => b.i - a.i);

    sortedShape.forEach(({ i, j }) => {
      // Clear the old position on the board if it's within bounds
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = { isMarked: false, color: null };
      }
      // Mark the new position on the board if it's within bounds
      if (i + 1 >= 0 && i + 1 < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i + 1][j] = { isMarked: true, color: shapeColor };
      }
      newShapeCoords.push({ i: i + 1, j });
    });
  }

  return {
    newBoard,
    newShape: {
      coords: newShapeCoords,
      shape: shapeMatrix,
      color: shapeColor,
      name: shapeName,
    },
  };
};

export function rotate(board, shape) {
  const { coords, shape: shapeMatrix, name, color } = shape;

  // 1. Find the top-left corner of the current shape's bounding box.
  // This is the reference point for calculating the new absolute coordinates after rotation.
  const minI = Math.min(...coords.map(({ i }) => i));
  const minJ = Math.min(...coords.map(({ j }) => j));

  // 2. Rotate the boolean matrix of the shape .
  const rotatedMatrix = rotateSHape(shapeMatrix);

  // 3. Generate potential new absolute coordinates for the shape.
  const potentialNewCoords = [];
  for (let i = 0; i < rotatedMatrix.length; i++) {
    for (let j = 0; j < rotatedMatrix[0].length; j++) {
      if (rotatedMatrix[i][j]) {
        potentialNewCoords.push({ i: minI + i, j: minJ + j });
      }
    }
  }

  // 4. Validate the potential new coordinates using the dedicated validation function.
  validateRotation(board, coords, rotatedMatrix);

  // 5. If validation passes, proceed to update the board state.
  const newBoard = cloneAffectedRows(board, coords, potentialNewCoords);

  // Clear the old shape's position from the board.
  coords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      newBoard[i][j] = { isMarked: false, color: null };
    }
  });

  // Mark the new shape's position on the board with its color.
  potentialNewCoords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      newBoard[i][j] = { isMarked: true, color: color };
    }
  });

  return {
    newBoard,
    newShape: {
      coords: potentialNewCoords,
      shape: rotatedMatrix,
      color,
      name,
    },
  };
}

export function getRandomShape() {
  const index = Math.floor(Math.random() * SHAPES.length);
  const selectedShape = SHAPES[index];
  const shapeMatrix = selectedShape.shape;
  const color = selectedShape.color;

  let count = 0;
  for (let i = 0; i < shapeMatrix.length; i++) {
    if (shapeMatrix[i].some((cell) => cell)) {
      // Check if any cell in the row is true
      count++;
    }
  }

  const offSetY = -count; // Start shapes above the board
  const coords = [];

  // Calculate a random starting column to center the shape horizontally
  const maxStartCol = BOARD_WIDTH - shapeMatrix[0].length;
  const startCol = Math.floor(Math.random() * (maxStartCol + 1));

  // Generate absolute coordinates for each 'true' cell in the shape matrix
  for (let i = 0; i < shapeMatrix.length; i++) {
    for (let j = 0; j < shapeMatrix[0].length; j++) {
      if (shapeMatrix[i][j]) {
        coords.push({ i: i + offSetY, j: j + startCol });
      }
    }
  }

  return {
    coords,
    color,
    shape: shapeMatrix,
    name: selectedShape.name,
    origin: { i: offSetY, j: startCol }, // Top-left corner of the shape's bounding box
  };
}

export function rotateSHape(shapeMatrix) {
  const height = shapeMatrix.length;
  const width = shapeMatrix[0].length;

  const rotated = Array(width)
    .fill(null)
    .map(() => Array(height).fill(false));

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      rotated[j][height - 1 - i] = shapeMatrix[i][j];
    }
  }
  return rotated;
}

export function clearFullRows(board) {
  const newBoard = [];
  let clearedLines = 0;

  for (let i = 0; i < board.length; i++) {
    const row = board[i];
    const isFull = row.every((cell) => cell && cell.isMarked);

    if (isFull) {
      clearedLines++;
    } else {
      newBoard.push(row);
    }
  }

  while (newBoard.length < board.length) {
    const emptyRow = Array(board[0].length).fill({
      isMarked: false,
      color: null,
    });
    newBoard.unshift(emptyRow);
  }

  return { newBoard, clearedLines };
}
