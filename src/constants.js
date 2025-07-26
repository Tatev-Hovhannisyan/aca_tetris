
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


export const ROTATION_STATES = {
  INITIAL: 0, 
  RIGHT: 1,   
  TWO: 2,    
  LEFT: 3,  
};


export const initialFallSpeed = 500; 
export const speedDecreasePerLevel = 100; 
export const scorePerLevel = 10000; 
export const minFallSpeed = 100; 
