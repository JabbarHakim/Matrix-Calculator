


// Auto-resize input fields based on content
function autoResizeInput(input) {
    // Create a temporary span to measure the content width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'fixed';
    span.style.whiteSpace = 'pre';
    span.style.font = getComputedStyle(input).font;
    span.textContent = input.value || input.placeholder || '';
    document.body.appendChild(span);
    // Add some extra space for cursor/caret
    input.style.width = (span.offsetWidth + 16) + 'px';
    document.body.removeChild(span);
}

function attachAutoResize(input) {
    if (!input._autoResizeAttached) {
        autoResizeInput(input);
        input.addEventListener('input', function() {
            autoResizeInput(this);
        });
        input._autoResizeAttached = true;
    }
}

// Initial attach for existing inputs
document.querySelectorAll('input[type="number"], input[type="text"]').forEach(attachAutoResize);

// For dynamically added inputs
const observer = new MutationObserver(() => {
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach(attachAutoResize);
});
observer.observe(document.body, { childList: true, subtree: true });

// Move matrix containers into a flex row
window.addEventListener('DOMContentLoaded', function() {
    const matrixA = document.getElementById('A');
    const matrixAContainer = document.getElementById('matrixAContainer');
    const matrixB = document.getElementById('B');
    const matrixBContainer = document.getElementById('matrixBContainer');

// Create flex container
    const flexDiv = document.createElement('div');
    flexDiv.id = 'matrixContainer';

// Group A
    const groupA = document.createElement('div');
    groupA.appendChild(matrixA);
    groupA.appendChild(matrixAContainer);

// Group B
    const groupB = document.createElement('div');
    groupB.appendChild(matrixB);
    groupB.appendChild(matrixBContainer);

    flexDiv.appendChild(groupA);
    flexDiv.appendChild(groupB);

// Insert flex container before result
    const resultHeader = document.querySelector('h3:not([id])');
    document.body.insertBefore(flexDiv, resultHeader);
});

function addColumn(matrixId) {
    const table = document.getElementById(matrixId);
    for (let row of table.rows) {
        const cell = row.insertCell(-1);
        const input = document.createElement('input');
        input.type = 'number';
        cell.appendChild(input);
    }
}

function removeColumn(matrixId) {
    const table = document.getElementById(matrixId);
    if (table.rows[0].cells.length > 1) {
        for (let row of table.rows) {
            row.deleteCell(-1);
        }
    } else {
        alert("Cannot remove the last column!");
    }
}

function addRow(matrixId) {
    const table = document.getElementById(matrixId);
    const row = table.insertRow(-1);
    const columnCount = table.rows[0].cells.length;
    for (let i = 0; i < columnCount; i++) {
        const cell = row.insertCell(-1);
        const input = document.createElement('input');
        input.type = 'number';
        cell.appendChild(input);
    }
}

function removeRow(matrixId) {
    const table = document.getElementById(matrixId);
    if (table.rows.length > 1) {
        table.deleteRow(-1);
    } else {
        alert("Cannot remove the last row!");
    }
}

function addMatrices() {
    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');

    if (!areMatricesSameSize(matrixA, matrixB)) {
        alert("Matrices must be of the same size to add.");
        return;
    }

    const result = matrixA.map((row, i) =>
        row.map((val, j) => val + matrixB[i][j])
    );

    displayResult(result);
}

function subtractMatrices() {
    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');

    if (!areMatricesSameSize(matrixA, matrixB)) {
        alert("Matrices must be of the same size to subtract.");
        return;
    }

    const result = matrixA.map((row, i) =>
        row.map((val, j) => val - matrixB[i][j])
    );

    displayResult(result);
}

function multiplyMatrices() {
    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');

    if (matrixA[0].length !== matrixB.length) {
        alert("Number of columns in Matrix A must equal number of rows in Matrix B.");
        return;
    }

    const result = matrixA.map((row, i) =>
        matrixB[0].map((_, j) =>
            row.reduce((sum, val, k) => sum + val * matrixB[k][j], 0)
        )
    );

    displayResult(result);
}

function transposeMatrix(matrixId) {
    const matrix = getMatrixValues(matrixId);
    const transposed = matrix[0].map((_, i) => matrix.map(row => row[i]));
    displayResult(transposed);
}

function determinantMatrix(matrixId) {
    const matrix = document.getElementById(matrixId);
    const rows = matrix.getElementsByTagName('tr');
    const size = rows.length;

    if (size !== rows[0].getElementsByTagName('td').length) {
        alert('Matrix must be square to calculate determinant.');
        return;
    }

    const values = [];
    for (let i = 0; i < size; i++) {
        const row = rows[i].getElementsByTagName('input');
        values.push(Array.from(row).map(input => parseFloat(input.value) || 0));
    }

    const determinant = calculateDeterminant(values);
    alert(`The determinant of ${matrixId} is : ${determinant}`);
}

function calculateDeterminant(matrix) {
    const size = matrix.length;

    if (size === 1) {
        return matrix[0][0];
    }

    if (size === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    let determinant = 0;
    for (let i = 0; i < size; i++) {
        const subMatrix = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== i));
        determinant += matrix[0][i] * calculateDeterminant(subMatrix) * (i % 2 === 0 ? 1 : -1);
    }

    return determinant;
}

function transposeAddMatrices() {
    const sum = addMatrices();
    const transposed = transposeMatrixFromValues(sum);
    displayResult(transposed);
}

function transposeAddMatricesReverse() {
    const sum = addMatrices();
    const transposed = transposeMatrixFromValues(sum);
    displayResult(transposed);
}

function addTransposedMatrices() {
    const transposedA = transposeMatrix('matrixA');
    const transposedB = transposeMatrix('matrixB');
    const result = transposedA.map((row, i) => row.map((val, j) => val + transposedB[i][j]));
    displayResult(result);
}

function transposeSubtractMatrices() {
    const difference = subtractMatrices();
    const transposed = transposeMatrixFromValues(difference);
    displayResult(transposed);
}

function transposeSubtractMatricesReverse() {
    const difference = subtractMatrices();
    const transposed = transposeMatrixFromValues(difference);
    displayResult(transposed);
}

function subtractTransposedMatrices() {
    const transposedA = transposeMatrix('matrixA');
    const transposedB = transposeMatrix('matrixB');
    const result = transposedA.map((row, i) => row.map((val, j) => val - transposedB[i][j]));
    displayResult(result);
}

function transposeMultiplyMatrices() {
    const product = multiplyMatrices();
    const transposed = transposeMatrixFromValues(product);
    displayResult(transposed);
}

function transposeMultiplyMatricesReverse() {
    const product = multiplyMatrices();
    const transposed = transposeMatrixFromValues(product);
    displayResult(transposed);
}

function multiplyTransposedMatrices() {
    const transposedA = transposeMatrix('matrixA');
    const transposedB = transposeMatrix('matrixB');
    const result = multiplyMatricesFromValues(transposedA, transposedB);
    displayResult(result);
}

function transposeMatrixFromValues(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function multiplyMatricesFromValues(matrixA, matrixB) {
    const result = Array(matrixA.length).fill().map(() => Array(matrixB[0].length).fill(0));
    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixB[0].length; j++) {
            for (let k = 0; k < matrixB.length; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }
        return result;
    }

    function inverseMatrix(matrixId) {
        const matrix = getMatrixValues(matrixId);
        if (matrix.length !== matrix[0].length) {
            alert('Matrix must be square to calculate its inverse.');
            return;
        }

        const size = matrix.length;
        const identity = Array.from({ length: size }, (_, i) =>
            Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
        );

        for (let i = 0; i < size; i++) {
            let pivot = matrix[i][i];
            if (pivot === 0) {
                alert('Matrix is singular and cannot be inverted.');
                return;
            }

            for (let j = 0; j < size; j++) {
                matrix[i][j] /= pivot;
                identity[i][j] /= pivot;
            }

            for (let k = 0; k < size; k++) {
                if (k !== i) {
                    const factor = matrix[k][i];
                    for (let j = 0; j < size; j++) {
                        matrix[k][j] -= factor * matrix[i][j];
                        identity[k][j] -= factor * identity[i][j];
                    }
                }
            }
        }

        setMatrixValues('resultMatrix', identity);
    }

    
    function multiplyByScalar(matrixId) {
        const scalar = parseFloat(document.getElementById('scalarInput').value);
        if (isNaN(scalar)) {
            alert('Please enter a valid scalar value.');
            return;
        }

        const matrix = getMatrixValues(matrixId);
        const result = matrix.map(row => row.map(value => value * scalar));
        setMatrixValues('resultMatrix', result);
    }

function getMatrixValues(matrixId) {
    const table = document.getElementById(matrixId);
    return Array.from(table.rows).map(row =>
        Array.from(row.cells).map(cell => Number(cell.firstChild.value) || 0)
    );
}

function setMatrixValues(matrixId, values) {
    const rows = document.querySelectorAll(`#${matrixId} tr`);
    rows.forEach((row, i) => {
        const cells = row.querySelectorAll('input');
        cells.forEach((cell, j) => {
            cell.value = values[i] && values[i][j] !== undefined ? values[i][j] : '';
        });
    });
}


function areMatricesSameSize(matrixA, matrixB) {
    return (
        matrixA.length === matrixB.length &&
        matrixA[0].length === matrixB[0].length
    );
}

function getMatrixSize(matrixId) {
    const table = document.getElementById(matrixId);
    const rows = table.rows.length;
    const cols = rows > 0 ? table.rows[0].cells.length : 0;
    return { rows, cols };
}

function resizeResultTableToMatchInput() {
    // Get the size of Matrix A and Matrix B
    const sizeA = getMatrixSize('matrixA');
    const sizeB = getMatrixSize('matrixB');
    // Use the maximum rows and columns between A and B
    const rows = Math.max(sizeA.rows, sizeB.rows);
    const cols = Math.max(sizeA.cols, sizeB.cols);
    resizeResultTable(rows, cols);
}

function resizeResultTable(rows, cols) {
    const table = document.getElementById('resultMatrix');
    // Remove all rows
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
    // Add new rows and columns
    for (let i = 0; i < rows; i++) {
        const tr = table.insertRow();
        for (let j = 0; j < cols; j++) {
            const td = tr.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.readOnly = true;
            td.appendChild(input);
        }
    }
}

// Hook into add/remove row/column functions
const originalAddRow = window.addRow;
const originalRemoveRow = window.removeRow;
const originalAddColumn = window.addColumn;
const originalRemoveColumn = window.removeColumn;

window.addRow = function(matrixId) {
    originalAddRow(matrixId);
    resizeResultTableToMatchInput();
};
window.removeRow = function(matrixId) {
    originalRemoveRow(matrixId);
    resizeResultTableToMatchInput();
};
window.addColumn = function(matrixId) {
    originalAddColumn(matrixId);
    resizeResultTableToMatchInput();
};
window.removeColumn = function(matrixId) {
    originalRemoveColumn(matrixId);
    resizeResultTableToMatchInput();
};

// Initial resize on page load
resizeResultTableToMatchInput();

function displayResult(result) {
    const resultTable = document.getElementById('resultMatrix');
    resultTable.innerHTML = '';

    result.forEach(row => {
        const tr = resultTable.insertRow();
        row.forEach(value => {
            const td = tr.insertCell();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.readOnly = true;
            td.appendChild(input);
        });
    });
}

