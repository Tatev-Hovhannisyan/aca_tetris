import React from 'react';

function getShapeMatrixForDisplay(shape) {
  if (!shape || !shape.shape) return [];
  const matrix = shape.shape;
  let minRow = matrix.length, maxRow = -1, minCol = matrix[0].length, maxCol = -1;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j]) {
        if (i < minRow) minRow = i;
        if (i > maxRow) maxRow = i;
        if (j < minCol) minCol = j;
        if (j > maxCol) maxCol = j;
      }
    }
  }
  if (maxRow === -1) return [];
  const trimmedMatrix = [];
  for (let i = minRow; i <= maxRow; i++) {
    const newRow = [];
    for (let j = minCol; j <= maxCol; j++) {
      newRow.push(matrix[i][j]);
    }
    trimmedMatrix.push(newRow);
  }
  return trimmedMatrix;
}

export default function NextShapeDisplay({ nextShape }) {
  const nextShapeDisplayMatrix = getShapeMatrixForDisplay(nextShape);

  return (
    <div className="next-shape-container">
      <h3>Next Shape:</h3>
      <div className="next-shape-grid">
        {Array(4).fill(null).map((_, i) => (
          Array(4).fill(null).map((__, j) => {
            const isOccupied = nextShapeDisplayMatrix[i] && nextShapeDisplayMatrix[i][j];
            return (
              <div
                key={`next-${i}-${j}`}
                className={`cell-mini ${isOccupied ? "marked-mini" : ""}`}
                style={{ backgroundColor: isOccupied ? nextShape.color : "transparent" }}
              />
            );
          })
        ))}
      </div>
    </div>
  );
}
