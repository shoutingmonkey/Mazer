const createGrid = (rows, columns) => {
  return Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(false));
};

const pickRandomCell = (rows, columns) => {
  const startRow = Math.floor(Math.random() * rows);
  const startColumn = Math.floor(Math.random() * columns);
  return [startRow, startColumn];
};

const drawWall = (arr, type) => {
  arr.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) return;

      let x, y, width, height;
      if (type === "horizontal") {
        x = columnIndex * unitLengthX + unitLengthX / 2;
        y = rowIndex * unitLengthY + unitLengthY;
        width = unitLengthX;
        height = 5;
      } else {
        x = columnIndex * unitLengthX + unitLengthX;
        y = rowIndex * unitLengthY + unitLengthY / 2;
        width = 5;
        height = unitLengthY;
      }

      const wall = Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      });
      World.add(world, wall);
    });
  });
};
