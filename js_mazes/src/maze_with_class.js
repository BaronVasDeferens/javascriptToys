    // CONSTANTS
    const mazeRows = 30;
    const mazeCols = 30;
    const roomSize = 10;

	const canvasWidth = 1100
	const canvasHeight = 700;

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

        constructor(v1, v2) {
            this.v1 = v1;
            this.v2 = v2;
        }

        display() {
            return this.v1.display() + " <-> " + this.v2.display();
        }
    }


    var canvasDef = "<canvas id=\"myCanvas\" width=\"%WIDTH%\" height=\"%HEIGHT%\"></canvas>";
    canvasDef = canvasDef.replace("%WIDTH%", canvasWidth);
    canvasDef = canvasDef.replace("%HEIGHT%", canvasHeight);

	var mazeArray = new Array(mazeRows);
	var allRooms = new Array();
    var inMaze = new Array();
    var edges = new Array();
    var connections = new Array();
    var frontier = new Array();     // set of edges where x in inMaze and y is not in inMaze

    var finalMaze = new Array(mazeRows * 2 - 1);
    for (var i = 0; i < mazeCols; i++) {
        finalMaze[i] = new Array(mazeCols * 2 - 1);
    }

	// Setup (IFFE function)
	// Insert a drawable canvas element into the page

	var setup = function() {

        var mazeArea = document.getElementById('mazeArea');
        mazeArea.innerHTML = canvasDef

        console.log("Creating rooms...");
		for (var i = 0; i < mazeRows; i++) {

			mazeArray[i] = new Array(mazeCols);

			for (var j = 0; j < mazeCols; j++) {

				var room = new Room(i,j);

                room.edges = new Array();

				allRooms.push(room);
				mazeArray[i][j] = room;
			}
		}

        console.log("Creating edges...");

        // Create list of edges

        for (var i = 0; i < mazeRows; i++) {

            for (var j = 0; j < mazeCols; j++) {

                var currentRoom = mazeArray[i][j];

                var up = getRoom(currentRoom.row - 1, currentRoom.col);
                if (up !== undefined) {
                        var e = new Edge(currentRoom, up);
                        edges.push(e);
                        currentRoom.edges.push(e);
                }

                var down = getRoom(currentRoom.row + 1, currentRoom.col);
                if (down !== undefined) {
                        var e = new Edge(currentRoom, down);
                        edges.push(e);
                        currentRoom.edges.push(e);
                }

                var right = getRoom(currentRoom.row, currentRoom.col + 1);
                if (right !== undefined) {
                        var e = new Edge(currentRoom, right);
                        edges.push(e);
                        currentRoom.edges.push(e);
                }

                 var left = getRoom(currentRoom.row, currentRoom.col - 1);
                if (left !== undefined) {
                    var e = new Edge(currentRoom, left);
                    edges.push(e);
                    currentRoom.edges.push(e);
                }

            }

        }


        // Select initial vertex (room)
        var startRoom = getRandomRoom();
        inMaze.push(startRoom);

        startRoom.edges.forEach(function (r) {
            frontier.push(r);
        });

        var interval = window.setInterval(
            function () {
                if (frontier.length > 0) {
                    createMaze()
                }
                else {
                    clearInterval(interval)
                    console.log("ALL DONE!")
                }
            }
        , millisecondDelay);

	}();

    function printRoom(room) {
        return "(" + room.row + "," + room.col + ")";
    }



    function createMaze() {

        if (frontier.length <= 0) {
            console.log("DONE");
        }

        frontier = shuffleArray(frontier);
        var edge = frontier.pop();

        if (!inMaze.includes(edge.v2)) {
            inMaze.push(edge.v2);
            connections.push(edge);
            edge.v2.edges.forEach( function (e) {
                if (!inMaze.includes(e.v2)) {
                    frontier.push(e);
                }
            })

            drawBigMaze();
        }

        else {
//            console.log("."); // 361 extra edges :(
        }
    }


	function drawBigMaze() {

	    var canvas = document.getElementById("myCanvas");
        var context = canvas.getContext("2d");

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,canvasWidth,canvasHeight);

        context.fillStyle ="#FFFFFF"; // white

        inMaze.forEach(function (room) {
                context.fillRect(
                    room.col * 2 * roomSize,
                    room.row * 2 * roomSize,
                    roomSize,
                    roomSize);
        });

        context.fillStyle = "#FFFFFF";

        connections.forEach(function (vtx) {
            var v1, v2, ox, oy;

            // v1 to the left
            if (vtx.v1.col < vtx.v2.col) {
                v1 = vtx.v1;
                v2 = vtx.v2;

                ox = v1.col * 2 * roomSize + roomSize;
                oy = v1.row * 2 * roomSize;

            }
            // v1 on top
            else if (vtx.v1.row < vtx.v2.row) {
              v1 = vtx.v1;
              v2 = vtx.v2;
              ox = v1.col * 2 * roomSize;
              oy = v1.row * 2 * roomSize + roomSize;
            }

            else if (vtx.v1.col == vtx.v2.col) {
                    v1 = vtx.v2;
                    v2 = vtx.v1;
                    ox = v1.col * 2 * roomSize ;
                    oy = v1.row * 2 * roomSize + roomSize;
            }
            else {
                v1 = vtx.v2;
                v2 = vtx.v1;
                ox = v1.col * 2 * roomSize +roomSize;
                oy = v1.row * 2 * roomSize ;
            }

            context.fillRect(ox, oy, roomSize, roomSize);

        });


	}

    function getRoom(row, col) {
        try {
            return mazeArray[row][col];
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