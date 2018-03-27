    const mazeRowsCols = 20;
    const roomSize = 10;

	const canvasWidth = 1100
	const canvasHeight = 700;


    var canvasDef = "<canvas id=\"myCanvas\" width=\"%WIDTH%\" height=\"%HEIGHT%\"></canvas>";
    canvasDef = canvasDef.replace("%WIDTH%", canvasWidth);
    canvasDef = canvasDef.replace("%HEIGHT%", canvasHeight);

	var mazeArray = new Array(mazeRowsCols);
	var allRooms = new Array();
    var inMaze = new Array();
    var edges = new Array();
    var connections = new Array();
    var frontier = new Array();     // set of edges where x in inMaze and y is not in inMaze

	// Setup (IFFE function)
	// Insert a drawable canvas element into the page

	var setup = function() {

        var mazeArea = document.getElementById('mazeArea');
        mazeArea.innerHTML = canvasDef

        console.log("Creating rooms...");
		for (var i = 0; i < mazeRowsCols; i++) {

			mazeArray[i] = new Array(mazeRowsCols);

			for (var j = 0; j < mazeRowsCols; j++) {

				var room = {
					row: i,
                  	col: j,
                  	edges : Array(),
                  	display : function() {
                  	    return "(" + this.row + "," + this.col + ")";
                  	}
                  };

                room.edges = new Array();

				allRooms.push(room);
				mazeArray[i][j] = room;
			}
		}

        console.log("Creating edges...");

        // Create list of edges

        for (var i = 0; i < mazeRowsCols; i++) {

            for (var j = 0; j < mazeRowsCols; j++) {

                var currentRoom = mazeArray[i][j];

                var up = getRoom(currentRoom.row - 1, currentRoom.col);
                if (up !== undefined) {

                        var e = {
                            v1: currentRoom,
                            v2: up,
                            display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                        };

                        edges.push(e);
                        currentRoom.edges.push(e);
                }

                var down = getRoom(currentRoom.row + 1, currentRoom.col);
                if (down !== undefined) {
                        var e = {
                            v1: currentRoom,
                            v2: down,
                            display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                        };

                        edges.push(e);
                        currentRoom.edges.push(e);
                }

                var right = getRoom(currentRoom.row, currentRoom.col + 1);
                if (right !== undefined) {
                        var e = {
                            v1: currentRoom,
                            v2: right,
                            display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                        };

                        edges.push(e);
                        currentRoom.edges.push(e);
                }

                 var left = getRoom(currentRoom.row, currentRoom.col - 1);
                if (left !== undefined) {
                    var e = {
                        v1: currentRoom,
                        v2: left,
                        display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                    };

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

       window.setInterval(createMaze, 1);

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
        var index = Math.floor(Math.random() * 1000 % (mazeRowsCols * mazeRowsCols));
        return allRooms[index]
    }