    const mazeRowsCols = 19;
	const canvasSize = 400
	const roomSize = 10;

    var canvasDef = "<canvas id=\"myCanvas\" width=\"%SIZE%\" height=\"%SIZE%\"></canvas>";
    canvasDef = canvasDef.replace("%SIZE%", canvasSize);
    canvasDef = canvasDef.replace("%SIZE%", canvasSize);

	var mazeArray = new Array(mazeRowsCols);
	var allRooms = new Array();
    var inMaze = new Array();
    var edges = new Array();
    var connections = new Array();

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
                  	open: false,
                  	reachable : false,
                  	display : function() {
                  	    return "(" + this.row + "," + this.col + ")";
                  	}
                  };

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
                        edges.push({
                            v1: currentRoom,
                            v2: up,
                            display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                        });
                }

                var down = getRoom(currentRoom.row + 1, currentRoom.col);
                if (down !== undefined) {
                        edges.push({
                            v1: currentRoom,
                            v2: down,
                            display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                        });
                }

                var right = getRoom(currentRoom.row, currentRoom.col + 1);
                if (right !== undefined) {
                        edges.push({
                            v1: currentRoom,
                            v2: right,
                            display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                        });
                }

                 var left = getRoom(currentRoom.row, currentRoom.col - 1);
                if (left !== undefined) {
                    edges.push({
                        v1: currentRoom,
                        v2: left,
                        display : function() { return this.v1.display() + " <-> " + this.v2.display(); }
                    });
                }

            }


        }

//        edges.forEach( function (e) {
//            console.log(e.display());
//        });

        // Select initial vertex (room)
        var startRoom = getRandomRoom();
        console.log("starting room : " + startRoom.display());
        inMaze.push(startRoom);
        edges = shuffleArray(edges);

        window.setInterval(createMaze, 10);

	}();

    function printRoom(room) {
        return "(" + room.row + "," + room.col + ")";
    }

    function getRoom(row, col) {
        try {
            return mazeArray[row][col];
        } catch (e) {
            return undefined;
        }
    }

    function getAdjacentRooms(row, col) {

        var room = getRoom(row, col);
        var adjacentRooms = new Array();

        var up = getRoom(row, col-1);
        if (up !== undefined) {
            adjacentRooms.push(up);
        }

        var down = getRoom(row, col+1);
        if (down !== undefined) {
            adjacentRooms.push(down);
        }

        var left = getRoom(row-1, col);
        if (left !== undefined) {
            adjacentRooms.push(left);
        }

        var right = getRoom(row+1, col);
        if (right !== undefined) {
            adjacentRooms.push(right);
        }

        return adjacentRooms;
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

    function createMaze() {

        var currentVertex = edges.pop();

        if (checkVertex(currentVertex.v1, currentVertex.v2) || checkVertex(currentVertex.v2, currentVertex.v1))
        {
            console.log("added " + currentVertex.display());
            connections.push(currentVertex);
            inMaze.push(currentVertex.v2);
        }
        else {
            edges.push(currentVertex);
        }

        edges = shuffleArray(edges);
        drawBigMaze();
    }

    // Prim: find an edge {x,y} such that:
    // x is in theMaze
    // y is not in theMaze
    function checkVertex(v1, v2) {

        if (!inMaze.includes(v1)) {
            return false;
        }

        if (inMaze.includes(v2)) {
            return false;
        }

        return true;

    }

	function drawMaze() {

		var canvas = document.getElementById("myCanvas");
		var context = canvas.getContext("2d");

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,canvasSize,canvasSize);

        context.fillStyle ="#FFFFFF"; // white

		inMaze.forEach(function (room) {
                context.fillRect(
                    room.col * roomSize,
                    room.row * roomSize,
                    roomSize,
                    roomSize);
		});

	}


	function drawBigMaze() {

	    var canvas = document.getElementById("myCanvas");
        var context = canvas.getContext("2d");

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,canvasSize,canvasSize);

        context.fillStyle ="#FFFFFF"; // white

        inMaze.forEach(function (room) {
                context.fillRect(
                    room.col * 2 * roomSize ,
                    room.row * 2 * roomSize,
                    roomSize,
                    roomSize);
        });

        context.fillStyle = "#FFFFFF"; // red

        connections.forEach(function (vtx) {
            var v1, v2, ox, oy;

            // v1 to the left
            if (vtx.v1.col > vtx.v2.col) {
                v1 = vtx.v1;
                v2 = vtx.v2;

                ox = v1.col * 2 * roomSize + roomSize;
                oy = v1.row * 2 * roomSize;

            }
            // v1 on top
            else if (vtx.v1.row > vtx.v2.row) {
              v1 = vtx.v1;
              v2 = vtx.v2;

              ox = v1.col * 2 * roomSize;
              oy = v1.row * 2 * roomSize + roomSize;

            }
            else {
                v1 = vtx.v2;
                v2 = vtx.v1;

                ox = v1.col * 2 * roomSize + roomSize;
                oy = v1.row * 2 * roomSize;
            }

            context.fillRect(ox, oy, roomSize, roomSize);

        });


	}