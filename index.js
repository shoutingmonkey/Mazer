const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const rows = 10;
const columns = 20;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / columns;
const unitLengthY = height / rows;

const engine = Engine.create();
engine.world.gravity.y = 0;

const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }),
];

World.add(world, walls);

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    [arr[counter], arr[index]] = [arr[index], arr[counter]];
  }
  return arr;
};

const grid = createGrid(rows, columns);
const verticals = createGrid(rows, columns - 1);
const horizontals = createGrid(rows - 1, columns);
const [startRow, startColumn] = pickRandomCell(rows, columns);

const stepThroughCell = (row, column) => {
  // Check if cell has been visited
  if (grid[row][column]) return;

  // Mark the cell as visited
  grid[row][column] = true;

  // Assemble randomly ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  // For each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if neighbor is out of bounds
    if (grid[nextRow]?.[nextColumn] === undefined) continue;

    // If visited continue to next neighbor
    if (grid[nextRow][nextColumn]) continue;

    // Remove a wall from either horizontal or vertical
    switch (direction) {
      case "up":
        horizontals[row - 1][column] = true;
        break;
      case "right":
        verticals[row][column] = true;
        break;
      case "down":
        horizontals[row][column] = true;
        break;
      case "left":
        verticals[row][column - 1] = true;
        break;
    }

    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);
drawWall(horizontals, "horizontal");
drawWall(verticals, "vertical");

// Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "green",
    },
  }
);
World.add(world, goal);

// Ball
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  Math.min(unitLengthX, unitLengthY) / 4,
  {
    label: "ball",
  }
);
World.add(world, ball);

// Ball Controls
document.addEventListener("keydown", (e) => {
  const { x, y } = ball.velocity;
  switch (e.keyCode) {
    case 87:
      Body.setVelocity(ball, { x, y: y - 5 });
      break;
    case 68:
      Body.setVelocity(ball, { x: x + 5, y });
      break;
    case 83:
      Body.setVelocity(ball, { x, y: y + 5 });
      break;
    case 65:
      Body.setVelocity(ball, { x: x - 5, y });
      break;
  }
});

// Win Condition
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(".winner").classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") Body.setStatic(body, false);
      });
    }
  });
});
