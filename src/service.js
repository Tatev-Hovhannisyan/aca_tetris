import {
  DIRECTIONS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  SHAPES,
  ROTATION_STATES,
} from "./constants";
import {
  validateBoard,
  validateDownMove,
  validateLeftMove,
  validateRightMove,
  validateShape,
  validateRotation,
} from "./validations";

//Generates a random Tetris shape.

export function getRandomShape() {
  const index = Math.floor(Math.random() * SHAPES.length);
  const selectedShape = SHAPES[index];
  const shapeMatrix = selectedShape.shape;
  const color = selectedShape.color;

  let occupiedRowCount = 0;
  for (let i = 0; i < shapeMatrix.length; i++) {
    if (shapeMatrix[i].some((cell) => cell)) {
      occupiedRowCount++;
    }
  }

  const offSetY = -occupiedRowCount;
  const coords = [];

  const maxStartCol = BOARD_WIDTH - shapeMatrix[0].length;
  const startCol = Math.floor(Math.random() * (maxStartCol + 1));

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
    origin: { i: offSetY, j: startCol },
    rotationState: ROTATION_STATES.INITIAL,
  };
}

// Rotates a 2D boolean matrix 90 degrees clockwise.

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

//Clears full rows on the board.

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
      isClearing: false,
      animationDelay: null,
    });
    newBoard.unshift(emptyRow);
  }

  return { newBoard, clearedLines };
}

//Clones only affected rows of the board.

export function cloneAffectedRows(board, oldCoords, newCoords) {
  const affectedRows = new Set([
    ...oldCoords.map(({ i }) => i),
    ...newCoords.map(({ i }) => i),
  ]);

  const newBoard = board.map((row, i) =>
    affectedRows.has(i) ? row.map((cell) => ({ ...cell })) : row
  );

  return newBoard;
}

//Moves the shape on the board.

export const move = (board, shapeObj, direction) => {
  validateBoard(board);
  validateShape(shapeObj.coords);

  const shapeCoords = shapeObj.coords;
  const shapeColor = shapeObj.color;
  const shapeMatrix = shapeObj.shape;
  const shapeName = shapeObj.name;
  const rotationState = shapeObj.rotationState;

  const futureShapeCoords = shapeCoords.map(({ i, j }) => {
    if (direction === DIRECTIONS.DOWN) return { i: i + 1, j };
    if (direction === DIRECTIONS.LEFT) return { i, j: j - 1 };
    if (direction === DIRECTIONS.RIGHT) return { i, j: j + 1 };
    return { i, j };
  });

  const newBoard = cloneAffectedRows(board, shapeCoords, futureShapeCoords);
  const newShapeCoords = [];

  if (direction === DIRECTIONS.LEFT) {
    validateLeftMove(board, shapeCoords);

    shapeCoords.forEach(({ i, j }) => {
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = {
          isMarked: false,
          color: null,
          isClearing: false,
          animationDelay: null,
        };
      }
      if (i >= 0 && i < BOARD_HEIGHT && j - 1 >= 0 && j - 1 < BOARD_WIDTH) {
        newBoard[i][j - 1] = {
          isMarked: true,
          color: shapeColor,
          isClearing: false,
          animationDelay: null,
        };
      }
      newShapeCoords.push({ i, j: j - 1 });
    });
  } else if (direction === DIRECTIONS.RIGHT) {
    validateRightMove(board, shapeCoords);

    shapeCoords.forEach(({ i, j }) => {
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = {
          isMarked: false,
          color: null,
          isClearing: false,
          animationDelay: null,
        };
      }
      if (i >= 0 && i < BOARD_HEIGHT && j + 1 >= 0 && j + 1 < BOARD_WIDTH) {
        newBoard[i][j + 1] = {
          isMarked: true,
          color: shapeColor,
          isClearing: false,
          animationDelay: null,
        };
      }
      newShapeCoords.push({ i, j: j + 1 });
    });
  } else if (direction === DIRECTIONS.DOWN) {
    validateDownMove(board, shapeCoords);

    const sortedShape = [...shapeCoords].sort((a, b) => b.i - a.i);

    sortedShape.forEach(({ i, j }) => {
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = {
          isMarked: false,
          color: null,
          isClearing: false,
          animationDelay: null,
        };
      }
      if (i + 1 >= 0 && i + 1 < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i + 1][j] = {
          isMarked: true,
          color: shapeColor,
          isClearing: false,
          animationDelay: null,
        };
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
      rotationState: rotationState,
    },
  };
};

// Rotates the shape on the board without wall kicks.

export function rotate(board, shape) {
  const { coords, shape: shapeMatrix, name, color, rotationState } = shape;

  const nextRotationState = (rotationState + 1) % 4;

  const minI = Math.min(...coords.map(({ i }) => i));
  const minJ = Math.min(...coords.map(({ j }) => j));

  const rotatedMatrix = rotateSHape(shapeMatrix);

  const newCoords = [];
  for (let i = 0; i < rotatedMatrix.length; i++) {
    for (let j = 0; j < rotatedMatrix[0].length; j++) {
      if (rotatedMatrix[i][j]) {
        newCoords.push({ i: minI + i, j: minJ + j });
      }
    }
  }

  validateRotation(board, coords, rotatedMatrix, newCoords);

  const newBoard = cloneAffectedRows(board, coords, newCoords);

  coords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      newBoard[i][j] = {
        isMarked: false,
        color: null,
        isClearing: false,
        animationDelay: null,
      };
    }
  });

  newCoords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      newBoard[i][j] = {
        isMarked: true,
        color: color,
        isClearing: false,
        animationDelay: null,
      };
    }
  });

  return {
    newBoard,
    newShape: {
      coords: newCoords,
      shape: rotatedMatrix,
      color,
      name,
      rotationState: nextRotationState,
    },
  };
}
