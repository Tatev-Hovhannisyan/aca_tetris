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

/**
 * Генерирует случайную фигуру.
 * @returns {object} Новая фигура.
 */
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

  // Вычисляем начальное смещение, чтобы фигура появилась над доской.
  const offSetY = -occupiedRowCount;
  const coords = [];

  // Случайно определяем начальную горизонтальную позицию.
  const maxStartCol = BOARD_WIDTH - shapeMatrix[0].length;
  const startCol = Math.floor(Math.random() * (maxStartCol + 1));

  // Генерируем координаты для новой фигуры.
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

/**
 * Вращает 2D матрицу на 90 градусов по часовой стрелке.
 * @param {boolean[][]} shapeMatrix - Матрица фигуры.
 * @returns {boolean[][]} Повернутая матрица.
 */
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

/**
 * Очищает заполненные ряды на доске.
 * @param {Array<Array<Object>>} board - Текущая игровая доска.
 * @returns {{newBoard: Array<Array<Object>>, clearedLines: number}} Новая доска и количество очищенных линий.
 */
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

  // Добавляем новые пустые ряды сверху.
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

/**
 * Клонирует только затронутые ряды доски для улучшения производительности.
 * @param {Array<Array<Object>>} board - Текущая игровая доска.
 * @param {Array<Object>} oldCoords - Предыдущие координаты фигуры.
 * @param {Array<Object>} newCoords - Новые координаты фигуры.
 * @returns {Array<Array<Object>>} Новая доска с клонированными рядами.
 */
export function cloneAffectedRows(board, oldCoords, newCoords) {
  const affectedRows = new Set([
    ...oldCoords.map(({ i }) => i),
    ...newCoords.map(({ i }) => i),
  ]);

  return board.map((row, i) =>
    affectedRows.has(i) ? row.map((cell) => ({ ...cell })) : row
  );
}

/**
 * Перемещает фигуру по доске в заданном направлении.
 * @param {Array<Array<Object>>} board - Текущая игровая доска.
 * @param {Object} shapeObj - Фигура для перемещения.
 * @param {string} direction - Направление движения.
 * @returns {{newBoard: Array<Array<Object>>, newShape: Object}} Новая доска и новая фигура.
 */
export const move = (board, shapeObj, direction) => {
  validateBoard(board);
  validateShape(shapeObj.coords);

  const shapeCoords = shapeObj.coords;
  const shapeColor = shapeObj.color;
  const shapeMatrix = shapeObj.shape;
  const shapeName = shapeObj.name;
  const rotationState = shapeObj.rotationState;

  const newBoard = cloneAffectedRows(board, shapeCoords, shapeCoords);
  const newShapeCoords = [];
  let newOrigin = { ...shapeObj.origin };

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
      newShapeCoords.push({ i, j: j - 1 });
    });
    newOrigin.j -= 1;
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
      newShapeCoords.push({ i, j: j + 1 });
    });
    newOrigin.j += 1;
  } else if (direction === DIRECTIONS.DOWN) {
    validateDownMove(board, shapeCoords);
    shapeCoords.forEach(({ i, j }) => {
      if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
        newBoard[i][j] = {
          isMarked: false,
          color: null,
          isClearing: false,
          animationDelay: null,
        };
      }
      newShapeCoords.push({ i: i + 1, j });
    });
    newOrigin.i += 1;
  }

  // Рисуем фигуру на новых координатах.
  newShapeCoords.forEach(({ i, j }) => {
    if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
      newBoard[i][j] = {
        isMarked: true,
        color: shapeColor,
        isClearing: false,
        animationDelay: null,
      };
    }
  });

  return {
    newBoard,
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

/**
 * Вращает фигуру и выполняет проверку сдвига (wall kick) по правилам SRS.
 * @param {Array<Array<Object>>} board - Текущая игровая доска.
 * @param {Object} shape - Фигура для вращения.
 * @returns {{newBoard: Array<Array<Object>>, newShape: Object}} Новая доска и новая фигура.
 * @throws {Error} если вращение не удалось.
 */
export function rotate(board, shape) {
  const { coords, shape: shapeMatrix, name, color, rotationState, origin } = shape;
  const nextRotationState = (rotationState + 1) % 4;

  const kickData = name === "I" ? SRS_KICK_DATA_I : SRS_KICK_DATA_JLSTZ;
  const kicks = kickData[rotationState];

  const rotatedMatrix = rotateSHape(shapeMatrix);

  // Вычисляем потенциальные новые координаты на основе повернутой матрицы и текущего origin.
  const potentialNewCoords = [];
  for (let i = 0; i < rotatedMatrix.length; i++) {
    for (let j = 0; j < rotatedMatrix[0].length; j++) {
      if (rotatedMatrix[i][j]) {
        potentialNewCoords.push({ i: origin.i + i, j: origin.j + j });
      }
    }
  }

  // Применяем сдвиги (kicks) и проверяем валидность.
  for (const [kickJ, kickI] of kicks) {
    const kickedCoords = potentialNewCoords.map(({ i, j }) => ({
      i: i + kickI,
      j: j + kickJ,
    }));

    try {
      validateRotation(board, coords, kickedCoords);

      // Если проверка пройдена, это валидное вращение.
      const newBoard = cloneAffectedRows(board, coords, kickedCoords);

      // Очищаем старую позицию фигуры на доске.
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

      // Рисуем новую позицию фигуры на доске.
      kickedCoords.forEach(({ i, j }) => {
        if (i >= 0 && i < BOARD_HEIGHT && j >= 0 && j < BOARD_WIDTH) {
          newBoard[i][j] = {
            isMarked: true,
            color: color,
            isClearing: false,
            animationDelay: null,
          };
        }
      });

      // Обновляем origin с учетом сдвига.
      const newOrigin = {
        i: origin.i + kickI,
        j: origin.j + kickJ,
      };

      return {
        newBoard,
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
      // Если вращение не удалось, пробуем следующий сдвиг.
      continue;
    }
  }

  // Если ни один сдвиг не сработал, вращение невозможно.
  throw new Error("Rotation failed after all kick attempts");
}
