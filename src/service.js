import {
  DIRECTIONS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  SHAPES,
  ROTATION_STATES,
  SRS_KICK_DATA_I,
  SRS_KICK_DATA_JLSTZ,
} from "./constants";
import {
  validateBoard,
  validateDownMove,
  validateLeftMove,
  validateRightMove,
  validateShape,
  validateRotation,
} from "./validations";


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

  // Calculate initial offset for the shape to appear above the board.
  const offSetY = -occupiedRowCount;
  const coords = [];

  // Randomly determine the initial horizontal position.
  const maxStartCol = BOARD_WIDTH - shapeMatrix[0].length;
  const startCol = Math.floor(Math.random() * (maxStartCol + 1));

  // Generate coordinates for the new shape.
  for (let i = 0; i < shapeMatrix.length; i++) {
    for (let j = 0; j < shapeMatrix[0].length; j++) {
      if (shapeMatrix[i][j]) {
        coords.push({ i: i + offSetY, j: j + startCol });
      }
    }
  }
  console.log("getRandomShape generated:", { coords, color, shape: shapeMatrix, name: selectedShape.name, origin: { i: offSetY, j: startCol }, rotationState: ROTATION_STATES.INITIAL });

  return {
    coords,
    color,
    shape: shapeMatrix,
    name: selectedShape.name,
    origin: { i: offSetY, j: startCol },
    rotationState: ROTATION_STATES.INITIAL,
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

  // Add new empty rows to the top.
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


//Clones only the affected rows of the board for performance improvement.

export function cloneAffectedRows(board, oldCoords, newCoords) {
  const affectedRows = new Set([
    ...oldCoords.map(({ i }) => i),
    ...newCoords.map(({ i }) => i),
  ]);

  return board.map((row, i) =>
    affectedRows.has(i) ? row.map((cell) => ({ ...cell })) : row
  );
}


export const move = (board, shapeObj, direction) => {
  validateBoard(board);
  validateShape(shapeObj.coords);

  const shapeCoords = shapeObj.coords;
  const shapeColor = shapeObj.color;
  const shapeMatrix = shapeObj.shape;
  const shapeName = shapeObj.name;
  const rotationState = shapeObj.rotationState;

  // Create a full copy of the board for all operations
  const tempBoard = board.map(row => row.map(cell => ({ ...cell })));

  // Clear the old position of the shape on this temporary board
  shapeCoords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      tempBoard[i][j] = {
        isMarked: false,
        color: null,
        isClearing: false,
        animationDelay: null,
      };
    }
  });

  const newShapeCoords = [];
  let newOrigin = { ...shapeObj.origin };

  if (direction === DIRECTIONS.LEFT) {
    validateLeftMove(tempBoard, shapeCoords); 
    shapeCoords.forEach(({ i, j }) => {
      newShapeCoords.push({ i, j: j - 1 });
    });
    newOrigin.j -= 1;
  } else if (direction === DIRECTIONS.RIGHT) {
    validateRightMove(tempBoard, shapeCoords); 
    shapeCoords.forEach(({ i, j }) => {
      newShapeCoords.push({ i, j: j + 1 });
    });
    newOrigin.j += 1;
  } else if (direction === DIRECTIONS.DOWN) {
    validateDownMove(tempBoard, shapeCoords); 
    shapeCoords.forEach(({ i, j }) => {
      newShapeCoords.push({ i: i + 1, j });
    });
    newOrigin.i += 1;
  }

  // Draw the shape at the new coordinates on the same temporary board.
  newShapeCoords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      tempBoard[i][j] = {
        isMarked: true,
        color: shapeColor,
        isClearing: false,
        animationDelay: null,
      };
    }
  });

  return {
    newBoard: tempBoard, 
    newShape: {
      coords: newShapeCoords,
      shape: shapeMatrix,
      color: shapeColor,
      name: shapeName,
      rotationState: rotationState,
      origin: newOrigin,
    },
  };
};


export function rotate(board, shape) {


  const { coords, shape: shapeMatrix, name, color, rotationState, origin } = shape;
  const nextRotationState = (rotationState + 1) % 4;

  const kickData = name === "I" ? SRS_KICK_DATA_I : SRS_KICK_DATA_JLSTZ;
  const kicks = kickData[rotationState];

  const rotatedMatrix = rotateSHape(shapeMatrix);


  // Calculate potential new coordinates based on the rotated matrix and current origin.
  const potentialNewCoords = [];
  for (let i = 0; i < rotatedMatrix.length; i++) {
    for (let j = 0; j < rotatedMatrix[0].length; j++) {
      if (rotatedMatrix[i][j]) {
        potentialNewCoords.push({ i: origin.i + i, j: origin.j + j });
      }
    }
  }
 
  // Create a full copy of the board for all operations
  const tempBoard = board.map(row => row.map(cell => ({ ...cell })));

  // Clear the old position of the shape on this temporary board for validation
  coords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      tempBoard[i][j] = {
        isMarked: false,
        color: null,
        isClearing: false,
        animationDelay: null,
      };
    }
  });
  
  // Loop through the kick data array to find the first available position.
  for (const [kickJ, kickI] of kicks) {
    const kickedCoords = potentialNewCoords.map(({ i, j }) => ({
      i: i + kickI,
      j: j + kickJ,
    }));
    console.log(`Trying kick [${kickJ}, ${kickI}]. Kicked coords:`, kickedCoords);

    try {
      // Validate the new shape position on the temporary board.
      validateRotation(tempBoard, coords, kickedCoords); 
      console.log(`Kick [${kickJ}, ${kickI}] succeeded!`);

      // If validation passes, this is a valid rotation.
      // Now, draw the new shape position on the same temporary board.
      kickedCoords.forEach(({ i, j }) => {
        if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
          tempBoard[i][j] = {
            isMarked: true,
            color: color,
            isClearing: false,
            animationDelay: null,
          };
        }
      });

      // Update the origin considering the kick.
      const newOrigin = {
        i: origin.i + kickI,
        j: origin.j + kickJ,
      };
      console.log("New origin after rotation and kick:", newOrigin);

      console.log("--- rotate function finished successfully ---");
      return {
        newBoard: tempBoard, // Return the modified temporary board
        newShape: {
          coords: kickedCoords,
          shape: rotatedMatrix,
          color,
          name,
          origin: newOrigin,
          rotationState: nextRotationState,
        },
      };
    } catch (e) {
      console.error(`Rotation failed with kick [${kickJ}, ${kickI}]:`, e.message);
      continue; // Try the next kick.
    }
  }

  // If no kick succeeded, rotation is impossible.
  console.error("Rotation failed after all kick attempts. No valid position found.");
  throw new Error("Rotation failed after all kick attempts");
}
