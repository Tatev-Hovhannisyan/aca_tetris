
export const DIRECTIONS = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const SHAPES = [
  {
    name: "T",
    color: "#FF69B4", 
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
  },
  {
    name: "L",
    color: "#FFA500", 
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false],
    ],
  },
  {
    name: "J",
    color: "#00BFFF", 
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false],
    ],
  },
  {
    name: "O",
    color: "#FFFF00", 
    shape: [
      [true, true],
      [true, true],
    ],
  },
  {
    name: "S",
    color: "#32CD32", 
    shape: [
      [false, true, true],
      [true, true, false],
      [false, false, false],
    ],
  },
  {
    name: "Z",
    color: "#FF4500", 
    shape: [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ],
  },
  {
    name: "I",
    color: "#1E90FF", 
    shape: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
  },
];


// Super Rotation System (SRS) Kick Data
// Defines offsets for wall kicks during rotation.
// Each array corresponds to a rotation transition (0->R, R->2, 2->L, L->0).
export const SRS_KICK_DATA_JLSTZ = [
  // 0 -> R / R -> 0
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  // R -> 2 / 2 -> R
  [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  // 2 -> L / L -> 2
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  // L -> 0 / 0 -> L
  [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
];

// SRS Kick Data for I shape (unique behavior)
export const SRS_KICK_DATA_I = [
  // 0 -> R / R -> 0
  [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  // R -> 2 / 2 -> R
  [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  // 2 -> L / L -> 2
  [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  // L -> 0 / 0 -> L
  [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
];

export const ROTATION_STATES = {
  INITIAL: 0, 
  RIGHT: 1,   
  TWO: 2,    
  LEFT: 3,  
};


export const initialFallSpeed = 900; 
export const intervalDecreasePerLevel = 100; 
export const scorePerLevel = 1000; 
export const minFallInterval = 100; 