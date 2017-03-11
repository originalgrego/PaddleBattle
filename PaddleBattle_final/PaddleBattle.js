/**
 * A Pong style game implemented in JavaScript using an HTML canvas for drawing. This is intended as a tool to teach game development
 * and computer science to the uninitiated.
 */

/**
 * These are our constant values.
 *
 * Constants are a necessity to good programming as they allow later changes to be made system wide as long as the constant is used
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
var PADDLE_HALF_WIDTH = PADDLE_WIDTH / 2;
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
 * The heart of the game, the game loop calls functions to handle inputs, control game state and draw the game.
 */
function gameLoop() {
  handleInput();
  step();
  drawGame();
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
 * Update the position of the ball over time.
 */
function step() {
  // Increment the ball's position based on its current velocity. We do this in small steps (1/20th ball speed)
  // to ensure a fast moving ball does not warp through the paddle.
  var xIncrement = Ball.velocity.x / 20;
  for (var x = 0; x < 20; x++) {
    Ball.x += xIncrement;

    // If the ball hits Player 1's paddle, bounce off by negating velocity,
    // increase the velocity, and set the xIncrement.
    if (checkCollision(Player1, Ball) && Ball.velocity.x < 0) {
      Ball.velocity.x = -Ball.velocity.x;
      Ball.velocity.x += 0.5;
      xIncrement = Ball.velocity.x / 20;
    }

    // If the ball hits Player 2's paddle, bounce off by negating velocity,
    // increase the velocity, and set the xIncrement.
    if (checkCollision(Player2, Ball) && Ball.velocity.x > 0) {
      Ball.velocity.x = -Ball.velocity.x;
      Ball.velocity.x -= 0.5;
      xIncrement = Ball.velocity.x / 20;
    }
  }

  // If Player 1 scores on Player 2, increase Player 1's score, and reset the ball.
  // Out-of-bounds is 30 pixels outside of the board.
  if (Ball.x > BOARD_WIDTH_PIXELS + 30) {
    Player1.score++;
    resetBallPosition();
  }
  // If Player 2 scores on Player 1, increase Player 2's score, and reset the ball.
  // Out-of-bounds is 30 pixels outside of the board.
  else if (Ball.x < -30) {
    Player2.score++;
    resetBallPosition();
  }

  // Increment the ball's position in the y dimension, and bounce it off the ceiling or floor.
  // Out of bounds is 8 pixels outside of the board.
  Ball.y += Ball.velocity.y;
  if (Ball.y < 8 || Ball.y > BOARD_HEIGHT_PIXELS - 8) {
    Ball.velocity.y = -Ball.velocity.y;
  }
}

/**
 * Update the position of the paddles based on the input.
 */
function handleInput() {
  // Player 1 down.
  if (keyPresses[KEY_PRESS_S]) {
    Player1.y += 4;
    if (Player1.y > PADDLE_BOTTOM_LIMIT) {
      Player1.y = PADDLE_BOTTOM_LIMIT;
    }
  }

  // Player 1 up.
  else if (keyPresses[KEY_PRESS_W]) {
    Player1.y -= 4;
    if (Player1.y < PADDLE_TOP_LIMIT) {
      Player1.y = PADDLE_TOP_LIMIT;
    }
  }

  // Player 2 down.
  if (keyPresses[KEY_PRESS_DOWN]) {
    Player2.y += 4;
    if (Player2.y > PADDLE_BOTTOM_LIMIT) {
      Player2.y = PADDLE_BOTTOM_LIMIT;
    }
  }

  // Player 2 up.
  else if (keyPresses[KEY_PRESS_UP]) {
    Player2.y -= 4;
    if (Player2.y < PADDLE_TOP_LIMIT) {
      Player2.y = PADDLE_TOP_LIMIT;
    }
  }
}

/**
 * Draw our game board, two paddles, and ball.
 */
function drawGame() {
  // Game board.
  drawRect("black", BOARD_HALF_WIDTH, BOARD_HALF_HEIGHT, BOARD_WIDTH_PIXELS, BOARD_HEIGHT_PIXELS);

  // The ball.
  drawCircle("red", Ball.x, Ball.y, Ball.radius);

  // Player 1's paddle.
  drawRect("white", Player1.x, Player1.y, Player1.width, Player1.height);

  // Player 2's paddle.
  drawRect("white", Player2.x, Player2.y, Player2.width, Player2.height);

  // Top and bottom of the board in a solid green line.
  // We don't want to draw on top of our board, so these lines are drawn right outside the limits of the board.
  canvas.beginPath();
  canvas.setLineDash([0, 0]);
  canvas.lineWidth = 5;
  canvas.rect(-4, 2, BOARD_WIDTH_PIXELS + 8, BOARD_HEIGHT_PIXELS - 4);
  canvas.strokeStyle = "green";
  canvas.stroke();

  // Exact middle of the board in a faint dashed green line.
  canvas.beginPath();
  canvas.setLineDash([15, 10]);
  canvas.rect(BOARD_HALF_WIDTH, 0, BOARD_HALF_WIDTH, BOARD_HEIGHT_PIXELS);
  canvas.lineWidth = 1;
  canvas.strokeStyle = "green";
  canvas.stroke();

  // Players' scores, with Player 1 slightly to the left of center and Player 2 slightly to the right of center.
  canvas.fillStyle = "orange";
  canvas.font = "20px Arial";
  canvas.textAlign = "center";
  canvas.fillText(Player1.score, BOARD_HALF_WIDTH - 40, BOARD_HEIGHT_PIXELS - 10);
  canvas.fillText(Player2.score, BOARD_HALF_WIDTH + 40, BOARD_HEIGHT_PIXELS - 10);
}
