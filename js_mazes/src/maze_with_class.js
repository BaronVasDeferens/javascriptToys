    // CONSTANTS
    const mazeRows = 40;
    const mazeCols = 40;
    const roomSize = 10;

	const canvasWidth = 1100
	const canvasHeight = 800;

    const millisecondDelay = 1;


    class Room {

        constructor(row, col) {
            this.row = row;
            this.col = col;
        }

        display() {
            return "(" + this.row + "," + this.col + ")";
        }
    }

    class Edge {

        constructor(row, col) {
            this.row = row,
            this.col = col;
            this.open = false;
        }

        setVertexes(v1, v2) {
            this.v1 = v1;
            this.v2 = v2;
        }

        display() {
            return this.v1.display() + " <-> " + this.v2.display();
        }

        setToOpen() {
            this.open = true;
        }
    }


	var mazeArray = new Array(mazeRows);
	var allRooms = new Array();
    var inMaze = new Array();
    var edges = new Array();
    var connections = new Array();
    var frontier = new Array();     // set of edges where x in inMaze and y is not in inMaze

    var finalMaze = new Array();
    var finalMazeRows = (mazeRows * 2) - 1;
    var finalMazeCols = (mazeCols * 2) - 1;




    var newSetup = function() {

        insertHtmlElements();

        console.log("finalMaze rows / cols: " + finalMazeRows + " / " + finalMazeCols);

        finalMaze = new Array(finalMazeRows);

        // First pass: create the rooms and edges
        for (var i = 0; i < finalMazeRows; i++) {

            finalMaze[i] = new Array(finalMazeCols);

            for (var j = 0; j < finalMazeCols; j++) {

                if ((i % 2 == 0) && (j % 2 == 0)) {
                    var room = new Room(i,j);
                    allRooms.push(room);
                    finalMaze[i][j] = room;
                } else if ((i % 2 == 0) ^ (j % 2 == 0)) {
                    var edge = new Edge(i,j);
                    finalMaze[i][j] = edge;
                }

            }
        }

        // Second pass: connect edges (and add edges to the master list)
        for (var i = 0; i < finalMazeRows; i++) {

            for (var j = 0; j < finalMazeCols; j++) {

                var edge = finalMaze[i][j];

                if (edge === undefined) {
                    continue;
                }

                if (! edge instanceof Edge) {
                    continue;
                }

                if (i % 2 != 0) {
                    var up = getCell(edge.row - 1, edge.col);
                    var down = getCell(edge.row + 1, edge.col);
                    if (up instanceof Room && down instanceof Room) {
                        edge.setVertexes(up, down);
                        edges.push(edge);
                    }
                } else if (j % 2 != 0) {
                    var left = getCell(edge.row, edge.col - 1);
                    var right = getCell(edge.row, edge.col + 1);
                    if (left instanceof Room && right instanceof Room) {
                        edge.setVertexes(right, left);
                        edges.push(edge);
                    }
                }

            }
        }

        // Put initial room into maze
        var startRoom = getRandomRoom();
        console.log("START : " + startRoom.display());
        inMaze.push(startRoom);
        getAdjacentEdges(startRoom.row, startRoom.col).forEach ( function (edge) {
            frontier.push(edge);
        });

        drawFinalMaze();

        var interval = window.setInterval(
            function () {
                if (frontier.length > 0) {
                    createMaze();
                    drawFinalMaze();
                }
                else {
                    clearInterval(interval)
                    console.log("ALL DONE!");
                }
            }
        , millisecondDelay);



    }();

    function insertHtmlElements() {
        console.log("Inserting HTML...");
        var canvasDef = "<canvas id=\"myCanvas\" width=\"%WIDTH%\" height=\"%HEIGHT%\"></canvas>";
        canvasDef = canvasDef.replace("%WIDTH%", canvasWidth);
        canvasDef = canvasDef.replace("%HEIGHT%", canvasHeight);
        document.getElementById('mazeArea').innerHTML = canvasDef;
    }

    function getAdjacentEdges(row, col) {

        var room = getCell(row, col);
        var adjacentRooms = new Array();

        var up = getCell(row, col-1);
        if (up instanceof Edge) {
            adjacentRooms.push(up);
        }

        var down = getCell(row, col+1);
        if (down instanceof Edge) {
            adjacentRooms.push(down);
        }

        var left = getCell(row-1, col);
        if (left instanceof Edge) {
            adjacentRooms.push(left);
        }

        var right = getCell(row+1, col);
        if (right instanceof Edge) {
            adjacentRooms.push(right);
        }

        return adjacentRooms;
    }

    function getCell(row, col) {
        try {
            return finalMaze[row][col];
        } catch (e) {
            return undefined;
        }
    }

    function shuffleArray(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -=1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function getRandomRoom() {
        var index = Math.floor(Math.random() * 1000 % (mazeRows * mazeCols));
        return allRooms[index]
    }

    function createMaze() {

            if (frontier.length <= 0) {
                console.log("DONE");
            }

            frontier = shuffleArray(frontier);
            var edge = frontier.pop();

//            console.log("chose " + edge.display());

            var room;

            if (!inMaze.includes(edge.v1)) {
                room = edge.v1;
                inMaze.push(edge);
                inMaze.push(room);
                getAdjacentEdges(room.row, room.col).forEach( function (e) {
                    if (!frontier.includes(e)) {
                        frontier.push(e);
                    }
                });
            } else if (!inMaze.includes(edge.v2)) {
                room = edge.v2;
                inMaze.push(edge);
                inMaze.push(room);
                getAdjacentEdges(room.row, room.col).forEach( function (e) {
                    if (!frontier.includes(e)) {
                        frontier.push(e);
                    }
                });
            }
        }

    function drawFinalMaze() {

        var canvas = document.getElementById("myCanvas");
        var context = canvas.getContext("2d");

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,canvasWidth,canvasHeight);

        context.fillStyle ="#FF0000"; // red
        frontier.forEach(function (cell) {

            context.fillRect(
                cell.col * roomSize,
                cell.row * roomSize,
                roomSize,
                roomSize);
        });

        context.fillStyle ="#FFFFFF"; // white
        inMaze.forEach(function (cell) {

            context.fillRect(
                cell.col * roomSize,
                cell.row * roomSize,
                roomSize,
                roomSize);
        });


    }