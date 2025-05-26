

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


function getMatrix(id) {
        const table = document.getElementById(id);
        const matrix = [];
        for (let i = 0; i < table.rows.length; i++) {
        const row = [];
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const val = table.rows[i].cells[j].querySelector('input').value;
            row.push(Number(val) || 0);
        }
        matrix.push(row);
        }
        return matrix;
    }

    function setMatrix(id, matrix, readonly = false) {
        const table = document.getElementById(id);
        table.innerHTML = '';
        for (let i = 0; i < matrix.length; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < matrix[i].length; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.value = matrix[i][j];
            input.type = 'number';
            if (readonly) input.readOnly = true;
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
        }
    }

    function setResult(matrix) {
        setMatrix('resultMatrix', matrix, true);
    }

    function addMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const result = A.map((row, i) => row.map((val, j) => val + B[i][j]));
        setResult(result);
    }

    function subtractMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const result = A.map((row, i) => row.map((val, j) => val - B[i][j]));
        setResult(result);
    }

    function multiplyMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A[0].length !== B.length) {
        alert('Number of columns of A must equal number of rows of B');
        return;
        }
        const result = [];
        for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < A[0].length; k++) {
            sum += A[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
        }
        setResult(result);
    }

    function transposeMatrix(id) {
        const M = getMatrix(id);
        const result = M[0].map((_, i) => M.map(row => row[i]));
        setResult(result);
    }

    function determinantMatrix(id) {
        const M = getMatrix(id);
        if (M.length !== M[0].length) {
            alert('Matrix must be square');
            return;
        }
        function det(m) {
            if (m.length === 1) return m[0][0];
            if (m.length === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
            let sum = 0;
            for (let i = 0; i < m.length; i++) {
                const minor = m.slice(1).map(row => row.filter((_, j) => j !== i));
                sum += ((i%2===0?1:-1) * m[0][i] * det(minor));
            }
            return sum;
        }
        const d = det(M);
        setResult([[d]]);
    }

    function inverseMatrix(id) {
        const M = getMatrix(id);
        if (M.length !== M[0].length) {
        alert('Matrix must be square');
        return;
        }
        function det(m) {
        if (m.length === 1) return m[0][0];
        if (m.length === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
        let sum = 0;
        for (let i = 0; i < m.length; i++) {
            const minor = m.slice(1).map(row => row.filter((_, j) => j !== i));
            sum += ((i%2===0?1:-1) * m[0][i] * det(minor));
        }
        return sum;
        }
        const d = det(M);
        if (d === 0) {
        alert('Matrix is singular');
        return;
        }
        // Adjugate and inverse
        const n = M.length;
        const adj = [];
        for (let i = 0; i < n; i++) {
        adj[i] = [];
        for (let j = 0; j < n; j++) {
            const minor = M.filter((_, r) => r !== i).map(row => row.filter((_, c) => c !== j));
            adj[i][j] = (((i+j)%2===0?1:-1) * det(minor));
        }
        }
        // Transpose adjugate
        const adjT = adj[0].map((_, i) => adj.map(row => row[i]));
        const inv = adjT.map(row => row.map(val => val/d));
        setResult(inv);
    }

    function multiplyByScalar(id) {
        const scalar = Number(document.getElementById('scalarInput').value);
        if (isNaN(scalar)) {
        alert('Enter a scalar value');
        return;
        }
        const M = getMatrix(id);
        const result = M.map(row => row.map(val => val * scalar));
        setResult(result);
    }

    // Transpose A + B
    function transposeAddMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const At = A[0].map((_, i) => A.map(row => row[i]));
        const result = At.map((row, i) => row.map((val, j) => val + B[i][j]));
        setResult(result);
    }

    // Transpose B + A
    function transposeAddMatricesReverse() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const Bt = B[0].map((_, i) => B.map(row => row[i]));
        const result = Bt.map((row, i) => row.map((val, j) => val + A[i][j]));
        setResult(result);
    }

    // Transpose A + Transpose B
    function addTransposedMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const At = A[0].map((_, i) => A.map(row => row[i]));
        const Bt = B[0].map((_, i) => B.map(row => row[i]));
        const result = At.map((row, i) => row.map((val, j) => val + Bt[i][j]));
        setResult(result);
    }

    // Transpose A - B
    function transposeSubtractMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const At = A[0].map((_, i) => A.map(row => row[i]));
        const result = At.map((row, i) => row.map((val, j) => val - B[i][j]));
        setResult(result);
    }

    // Transpose B - A
    function transposeSubtractMatricesReverse() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const Bt = B[0].map((_, i) => B.map(row => row[i]));
        const result = Bt.map((row, i) => row.map((val, j) => val - A[i][j]));
        setResult(result);
    }

    // Transpose A - Transpose B
    function subtractTransposedMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        if (A.length !== B.length || A[0].length !== B[0].length) {
        alert('Matrices must be the same size');
        return;
        }
        const At = A[0].map((_, i) => A.map(row => row[i]));
        const Bt = B[0].map((_, i) => B.map(row => row[i]));
        const result = At.map((row, i) => row.map((val, j) => val - Bt[i][j]));
        setResult(result);
    }

    // Transpose A x B
    function transposeMultiplyMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        const At = A[0].map((_, i) => A.map(row => row[i]));
        if (At[0].length !== B.length) {
        alert('Number of columns of Transpose A must equal number of rows of B');
        return;
        }
        const result = [];
        for (let i = 0; i < At.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < At[0].length; k++) {
            sum += At[i][k] * B[k][j];
            }
            result[i][j] = sum;
        }
        }
        setResult(result);
    }

    // Transpose B x A
    function transposeMultiplyMatricesReverse() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        const Bt = B[0].map((_, i) => B.map(row => row[i]));
        if (Bt[0].length !== A.length) {
        alert('Number of columns of Transpose B must equal number of rows of A');
        return;
        }
        const result = [];
        for (let i = 0; i < Bt.length; i++) {
        result[i] = [];
        for (let j = 0; j < A[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < Bt[0].length; k++) {
            sum += Bt[i][k] * A[k][j];
            }
            result[i][j] = sum;
        }
        }
        setResult(result);
    }

    // Transpose A x Transpose B
    function multiplyTransposedMatrices() {
        const A = getMatrix('matrixA');
        const B = getMatrix('matrixB');
        const At = A[0].map((_, i) => A.map(row => row[i]));
        const Bt = B[0].map((_, i) => B.map(row => row[i]));
        if (At[0].length !== Bt.length) {
        alert('Number of columns of Transpose A must equal number of rows of Transpose B');
        return;
        }
        const result = [];
        for (let i = 0; i < At.length; i++) {
        result[i] = [];
        for (let j = 0; j < Bt[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < At[0].length; k++) {
            sum += At[i][k] * Bt[k][j];
            }
            result[i][j] = sum;
        }
        }
        setResult(result);
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

// Helper function to compute GCD
function gcd(a, b) {
    if (!b) return a;
    return gcd(b, a % b);
}

// Convert decimal to fraction string
function toFraction(decimal) {
    if (!isFinite(decimal) || isNaN(decimal)) return "";
    if (Number.isInteger(decimal)) return decimal.toString();
    let tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = decimal;
    let maxIterations = 50, iter = 0;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
        iter++;
        if (!isFinite(b) || isNaN(b)) break;
    } while (Math.abs(decimal - h1 / k1) > Math.abs(decimal) * tolerance && iter < maxIterations);

    let numerator = h1;
    let denominator = k1;
    if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) return "";
    let divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    return denominator === 1 ? `${numerator}` : `${numerator}/${denominator}`;
}

// Update the fraction result matrix based on resultMatrix
function updateFractionResultMatrix() {
    const resultTable = document.getElementById('resultMatrix');
    const fractionTable = document.getElementById('fractionResultMatrix');
    const rows = resultTable.rows.length;
    const cols = resultTable.rows[0].cells.length;

    // Adjust fraction table size if needed
    while (fractionTable.rows.length < rows) {
        let tr = fractionTable.insertRow();
        for (let c = 0; c < cols; c++) tr.insertCell().appendChild(document.createElement('input'));
    }
    while (fractionTable.rows.length > rows) {
        fractionTable.deleteRow(-1);
    }
    for (let r = 0; r < rows; r++) {
        let row = fractionTable.rows[r];
        while (row.cells.length < cols) {
            row.insertCell().appendChild(document.createElement('input'));
        }
        while (row.cells.length > cols) {
            row.deleteCell(-1);
        }
        for (let c = 0; c < cols; c++) {
            let val = resultTable.rows[r].cells[c].querySelector('input').value;
            let num = parseFloat(val);
            let frac = (val !== "" && !isNaN(num)) ? toFraction(num) : "";
            let input = row.cells[c].querySelector('input');
            input.value = frac;
            input.readOnly = true;
            attachAutoResize(input); // Ensure auto-resize is attached
            
        }
    }
}

// Patch all result-producing functions to also update the fraction matrix
function patchResultFunction(name) {
    if (typeof window[name] === "function") {
        const orig = window[name];
        window[name] = function () {
            orig.apply(this, arguments);
            updateFractionResultMatrix();
        };
    }
}
[
    "addMatrices",
    "subtractMatrices",
    "multiplyMatrices",
    "transposeMatrix",
    "determinantMatrix",
    "transposeAddMatrices",
    "transposeAddMatricesReverse",
    "addTransposedMatrices",
    "transposeSubtractMatrices",
    "transposeSubtractMatricesReverse",
    "subtractTransposedMatrices",
    "transposeMultiplyMatrices",
    "transposeMultiplyMatricesReverse",
    "multiplyTransposedMatrices",
    "inverseMatrix",
    "multiplyByScalar"
].forEach(patchResultFunction);

// Initial update on page load
window.addEventListener('DOMContentLoaded', updateFractionResultMatrix);

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

function exchangeMatrices() {
    const matrixA = document.getElementById('matrixA');
    const matrixB = document.getElementById('matrixB');

    // Get values from matrixA
    const aRows = matrixA.rows.length;
    const aCols = matrixA.rows[0].cells.length;
    const aValues = [];
    for (let i = 0; i < aRows; i++) {
        aValues[i] = [];
        for (let j = 0; j < aCols; j++) {
        aValues[i][j] = matrixA.rows[i].cells[j].querySelector('input').value;
        }
    }

    // Get values from matrixB
    const bRows = matrixB.rows.length;
    const bCols = matrixB.rows[0].cells.length;
    const bValues = [];
    for (let i = 0; i < bRows; i++) {
        bValues[i] = [];
        for (let j = 0; j < bCols; j++) {
        bValues[i][j] = matrixB.rows[i].cells[j].querySelector('input').value;
        }
    }

    // Resize matrixA to match matrixB
    while (matrixA.rows.length < bRows) addRow('matrixA');
    while (matrixA.rows.length > bRows) removeRow('matrixA');
    for (let i = 0; i < matrixA.rows.length; i++) {
        while (matrixA.rows[i].cells.length < bCols) addColumn('matrixA');
        while (matrixA.rows[i].cells.length > bCols) removeColumn('matrixA');
    }

    // Resize matrixB to match matrixA's original size
    while (matrixB.rows.length < aRows) addRow('matrixB');
    while (matrixB.rows.length > aRows) removeRow('matrixB');
    for (let i = 0; i < matrixB.rows.length; i++) {
        while (matrixB.rows[i].cells.length < aCols) addColumn('matrixB');
        while (matrixB.rows[i].cells.length > aCols) removeColumn('matrixB');
    }

    // Set matrixA values to bValues
    for (let i = 0; i < bRows; i++) {
        for (let j = 0; j < bCols; j++) {
        matrixA.rows[i].cells[j].querySelector('input').value = bValues[i][j];
        }
    }

    // Set matrixB values to aValues
    for (let i = 0; i < aRows; i++) {
        for (let j = 0; j < aCols; j++) {
        matrixB.rows[i].cells[j].querySelector('input').value = aValues[i][j];
        }
    }
    }

