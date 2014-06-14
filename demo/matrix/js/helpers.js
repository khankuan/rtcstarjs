
//	Generates a 2d grid, with the option to randomise values, otherwise, values are 0
function generateMatrix(n, m, random){
	var matrix = [];
	for (var i = 0; i < n; i++){
		matrix.push([]);
		for (var j = 0; j < m; j++){
			if (random)
				matrix[i].push(Math.random());
			else
				matrix[i].push(0);
		}
	}
	return matrix;
}

//	Computes matrix based on inputs
function computeMatrix(data){
	var matrixA = data.matrixA;
	var matrixB = data.matrixB;
	var rowStart = data.rowStart;
	var rowEndExclusive = data.rowEndExclusive;

	var result = generateMatrix(matrixA.length, matrixA.length, false);
	for (var i = rowStart; i < Math.min(rowEndExclusive,matrixA.length); i++)
		for (var j = 0; j < matrixA.length; j++)
			for (var k = 0; k < matrixA.length; k++)
				result[i][j] += matrixA[i][k] * matrixB[k][j];
	return result;
}
