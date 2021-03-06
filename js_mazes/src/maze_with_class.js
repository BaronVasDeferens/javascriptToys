    // CONSTANTS
    const mazeRows = 20;
    const mazeCols = 20;
    const roomSize = 15;

	const canvasWidth = 800
	const canvasHeight = 800;

    const millisecondDelay = 0;
    
    const showFrontier = true;
    const frontierColor = "#888888"

    class Room {

        constructor(row, col) {
            this.row = row;
            this.col = col;
            this.isInMaze = false;
        }

        setInMaze() {
            this.isInMaze = true;
        }

        display() {
            return "(" + this.row + "," + this.col + ")";
        }
    }

    class Edge {

        constructor(row, col) {
            this.row = row,
            this.col = col;
            this.inFrontier = false;
            this.isInMaze = false;
        }

        setVertexes(v1, v2) {
            this.v1 = v1;
            this.v2 = v2;
            if (v1 === v2) {
                console.log("somethings wrong with " + display())
            }
        }

        setInFrontier() {
            this.inFrontier = true;
        }

        setInMaze() {
            this.isInMaze = true;
        }

        display() {
            return this.v1.display() + " <-> " + this.v2.display();
        }
    }

    class Player {

        constructor(row, col) {
            this.room = new Room(row, col);
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

    var canvas;
    var context;

    var player;


    var setup = function() {

        insertHtmlElements();

        window.addEventListener('keypress', function (event) {
            movePlayer(event.key);
        });

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
                } if (j % 2 != 0) {
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
        startRoom.setInMaze();
        inMaze.push(startRoom);
        getAdjacentEdges(startRoom.row, startRoom.col).forEach ( function (edge) {
            edge.setInFrontier();
            frontier.push(edge);
        });

        frontier = shuffleArray(frontier);

        player = new Player(startRoom.row, startRoom.col);

        drawAllSteps();

    }();

    function movePlayer(key) {

        var nextRoom;

        switch(key) {
            case 'w':
                nextRoom = getCell(player.room.row - 1, player.room.col);
                break;
            case 's':
                nextRoom = getCell(player.room.row + 1, player.room.col);
                break;
            case 'a':
                nextRoom = getCell(player.room.row, player.room.col - 1);
                break;
            case 'd':
                nextRoom = getCell(player.room.row, player.room.col + 1);
                break;

        }

        if ((nextRoom !== undefined) && (nextRoom.isInMaze)){
            player.room= nextRoom;
        }

    }

    function drawOnce() {
        while (frontier.length > 0) {
            createMaze();
        }
        drawFinalMaze();
    }

    function drawAllSteps() {

        var interval = window.setInterval(
            function () {
                createMaze();
                drawFinalMaze();
            }
        , millisecondDelay);

    }



    function insertHtmlElements() {
        var canvasDef = "<canvas id=\"myCanvas\" width=\"%WIDTH%\" height=\"%HEIGHT%\"></canvas>";
        canvasDef = canvasDef.replace("%WIDTH%", canvasWidth);
        canvasDef = canvasDef.replace("%HEIGHT%", canvasHeight);
        document.getElementById('mazeArea').innerHTML = canvasDef;

        canvas = document.getElementById("myCanvas");
        context = canvas.getContext("2d");
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

            var edge = shuffleArray(frontier).pop()

            var room;

            if (edge !== undefined) {

                if (! edge.v1.isInMaze) {
                    room = edge.v1;
                    room.setInMaze();
                    edge.setInMaze();
                    inMaze.push(edge);
                    inMaze.push(room);
                    getAdjacentEdges(room.row, room.col).forEach( function (e) {
                        if (! e.inFrontier) {
                            e.setInFrontier();
                            frontier.push(e);
                        }
                    });
                }

                else if (! edge.v2.isInMaze) {
                    room = edge.v2;
                    room.setInMaze();
                    edge.setInMaze();
                    inMaze.push(edge);
                    inMaze.push(room);
                    getAdjacentEdges(room.row, room.col).forEach( function (e) {
                        if (! e.inFrontier) {
                            e.setInFrontier();
                            frontier.push(e);
                        }
                    });
                }
            }
        }

    function drawFinalMaze() {

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,canvasWidth,canvasHeight);

        if (showFrontier) {
            context.fillStyle = frontierColor
            frontier.forEach(function (cell) {

                context.fillRect(
                    cell.col * roomSize,
                    cell.row * roomSize,
                    roomSize,
                    roomSize);
            });
        }

        context.fillStyle ="#FFFFFF"; // white
        inMaze.forEach(function (cell) {

            context.fillRect(
                cell.col * roomSize,
                cell.row * roomSize,
                roomSize,
                roomSize);
        });

        context.fillStyle = "#FF0000";
        context.fillRect(
                        player.room.col * roomSize,
                        player.room.row * roomSize,
                        roomSize,
                        roomSize);
    }