/**
 * A Pong style game implemented in JavaScript using an HTML canvas for drawing. This is intended as a tool to teach game development
 * and computer science to the uninitiated.
 */

/**
 * These are our constant values.
 *
 * Constants are a necessity to good programming as they allow later changes to be made system-wide as long as the constant is used
 * instead of "magic values/numbers" across the code.
 */
// The size of our board and paddles in pixels.
var BOARD_WIDTH_PIXELS = 800;
var BOARD_HEIGHT_PIXELS = 400;
var PADDLE_WIDTH = 5;
var PADDLE_HEIGHT = 40;

// Some common math constants.
var BOARD_HALF_WIDTH = BOARD_WIDTH_PIXELS / 2;
var BOARD_HALF_HEIGHT = BOARD_HEIGHT_PIXELS / 2;
var PADDLE_HALF_HEIGHT = PADDLE_HEIGHT / 2;

// The x and y limits for the player paddles.
var PADDLE_TOP_LIMIT = PADDLE_HALF_HEIGHT + 5;
var PADDLE_BOTTOM_LIMIT = BOARD_HEIGHT_PIXELS - PADDLE_HALF_HEIGHT - 5;

// ASCII key codes stored as constants for readability.
var KEY_PRESS_W = 87;
var KEY_PRESS_S = 83;
var KEY_PRESS_DOWN = 40;
var KEY_PRESS_UP = 38;

/**
 * These are our game state variables. Variables are used to store pieces of data such as numbers, strings, boolean values, etc.
 * A variable can be assigned a value, and the value may be changed via numerous operators: + - * / =.
 */
// A reference to the canvas we use to draw the game.
var canvas = null;

// A collection of values we associate with Player 1: the current position of their paddle as (x, y) coordinates, the shape of their
// paddle as width and height values, and their current score.
var Player1 = {
  x: 10,
  y: BOARD_HALF_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  score: 0
};

// A collection of values we associate with Player 2: the current position of their paddle as (x, y) coordinates, the shape of their
// paddle as width and height values, and their current score.
var Player2 = {
  x: BOARD_WIDTH_PIXELS - 10,
  y: BOARD_HALF_HEIGHT,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  score: 0
};

// A collection of values we associate with the Ball: the current position of the ball as (x, y) coordinates, the shape of the
// ball as width, height, and radius values, and the current velocity.
var Ball = {
  x: BOARD_HALF_WIDTH,
  y: BOARD_HALF_HEIGHT,
  width: 10,
  height: 10,
  radius: 5,
  velocity: {x: 0, y: 0}
};

// Stores each key press individually so that multiple presses may be decoded.
var keyPresses = {
  KEY_PRESS_LEFT: false,
  KEY_PRESS_RIGHT: false,
  KEY_PRESS_DOWN: false,
  KEY_PRESS_UP: false
};

/**
 * Initialize position and a random starting velocity for the ball, where the x and y velocities are between -5 and 5.
 */
function resetBallPosition() {
  var angle = Math.random() * Math.PI * 2;
  Ball.x = BOARD_HALF_WIDTH;
  Ball.y = BOARD_HALF_HEIGHT;
  Ball.velocity = {
    x: 4 * Math.cos(angle),
    y: 4 * Math.sin(angle)
  };
}

/**
 * Helper function to check for an overlap of two rectangles.
 */
function checkCollision(rec1, rec2) {
  return oneDimensionalOverlap(rec1.x - rec1.width / 2, rec1.x + rec1.width / 2, rec2.x - rec2.width / 2, rec2.x + rec2.width / 2) &&
      oneDimensionalOverlap(rec1.y - rec1.height / 2, rec1.y + rec1.height / 2, rec2.y - rec2.height / 2, rec2.y + rec2.height / 2);
}

/**
 * Helper function to check for an overlap in one dimension.
 */
function oneDimensionalOverlap(oneStart, oneEnd, twoStart, twoEnd) {
  return contains(oneStart, oneEnd, twoStart) || contains(oneStart, oneEnd, twoEnd)
}


/**
 * Helper function to determine if a value is in between start and end.
 */
function contains(start, end, value) {
  return value > start && value < end;
}

/**
 * Helper function to take the canvas reference and draw rectangles without worrying about the math.
 */
function drawRect(color, x, y, width, height) {
  canvas.beginPath();
  canvas.rect(x - width / 2, y - height / 2, width, height);
  canvas.fillStyle = color;
  canvas.fill();
}

/**
 * Helper function to take the canvas reference and draw circles without worrying about the math.
 */
function drawCircle(color, x, y, radius) {
  canvas.beginPath();
  canvas.arc(x, y, radius, 0, 2 * Math.PI);
  canvas.fillStyle = color;
  canvas.fill();
}

/**
 * Helper function to see if an object has hit the bottom of the game board.
 */
function isOffBoardBottom(object) {
  return object.y > BOARD_HEIGHT_PIXELS - (object.height / 2);
}

/**
 * Helper function to see if an object has hit the top of the game board.
 */
function isOffBoardTop(object) {
  return object.y < (object.height / 2);
}

/**
 * Helper function to see if an object has reached the left side of the game board.
 */
function isOffBoardLeft(object) {
  return object.x < 0;
}

/**
 * Helper function to see if an object has reached the right side of the game board.
 */
function isOffBoardRight(object) {
  return object.x > BOARD_WIDTH_PIXELS;
}

/**
 * Helper function to see if an object has either hit the top or bottom of the game board.
 */
function isOffBoardY(object) {
  return isOffBoardBottom(object) || isOffBoardTop(object);
}

/**
 * Helper function to see if an object has either reached the left or right side of the board.
 * @param object
 * @returns {*}
 */
function isOffBoardX(object) {
  return isOffBoardLeft(object) || isOffBoardRight(object);
}

/**
 * Sets up our game. Stores a reference to the canvas, sets up key listening, and starts our game loop.
 */
function onLoad() {
  // Setup our game loop to listen for a change every 16 milliseconds.
  window.setInterval(gameLoop, 16);

  // We draw via the canvas's 2d context, so we store a reference for drawing.
  canvas = document.getElementById("canvas").getContext("2d");

  // Every time a key is pressed, store it to be processed in the game loop.
  document.addEventListener('keydown', function (event) {
    keyPresses[event.keyCode] = true;
  });

  // Make sure to set the key press to false when it's done being "pressed".
  document.addEventListener('keyup', function (event) {
    keyPresses[event.keyCode] = false;
  });

  // Setup a new game.
  resetBallPosition();
}

/**
 * The heart of the game, the game loop calls functions to handle inputs, control game state and draw the game.
 */
function gameLoop() {
  handleInput();
  step();
  drawGame();
}

/**
 * Update the position of the paddles based on the input.
 */
function handleInput() {

}

/**
 * Update the position of the ball over time.
 */
function step() {

}

/**
 * Draw our game board, two paddles, and ball.
 */
function drawGame() {

}
