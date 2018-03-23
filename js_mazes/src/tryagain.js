    const mazeRowsCols = 10;
	const roomSize = 25;

	var mazeArray = new Array(mazeRowsCols);
	var allRooms = new Array();
    var frontier = new Array();
    var reachable = new Array();
    var inMaze = new Array();

	// Setup (IFFE function)
	// Insert a drawable canvas element into the page
	// TODO: parameterize the canvas size
	var setup = function() {

        var mazeArea = document.getElementById('mazeArea');
        mazeArea.innerHTML = "<canvas id=\"myCanvas\" width=\"400\" height=\"400\"></canvas>"

		for (var i = 0; i < mazeRowsCols; i++) {

			mazeArray[i] = new Array(mazeRowsCols);

			for (var j = 0; j < mazeRowsCols; j++) {

				var room = Object.create(
                  {	row: i,
                  	col: j,
                  	open: false,
                  	reachable : false
                  });

				allRooms.push(room);
				mazeArray[i][j] = room;
			}
		}

        createMaze();

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

    function makeReachable(room) {
        room.reachable = true;
        if (!reachable.includes(room)) {
            reachable.push(room);
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

    function createMaze() {

        // Define the "start room" and adjacent rooms...
        var startRoom = getRandomRoom();

        console.log("START " + printRoom(startRoom));
        startRoom.open = true;
        makeReachable(startRoom);
        inMaze.push(startRoom);

        drawMaze();
        debugger;

        var adjacentRooms = getAdjacentRooms(startRoom.row, startRoom.col);
        adjacentRooms.forEach( function(r) {
           makeReachable(r);
           frontier.push(r);
        });

        drawMaze();
        debugger;

        while (reachable.length != allRooms.length) {
//        while (frontier.length > 0) {

            frontier = shuffleArray(frontier);
            var newRoom = frontier.pop();

            if (newRoom === undefined) {
                console.log("newRoom UNDEFINED!!!");
                break;
            }

            console.log("chose : " + printRoom(newRoom));
            if (newRoom.open) {
                console.log("\talready open...");
                continue;
            }


            adjacentRooms = getAdjacentRooms(newRoom.row, newRoom.col);
            var unreachableNeighbors = adjacentRooms.filter(function (r) {
                return r.reachable === false;
            });

            if (unreachableNeighbors.length === 0) {
                console.log("\t no unreachable neighbors");
                continue;
            }

            unreachableNeighbors = shuffleArray(unreachableNeighbors);
            var neighbor = unreachableNeighbors.pop();
            newRoom.open = true;
            neighbor.open = true;
            makeReachable(newRoom);
            makeReachable(neighbor);
            getAdjacentRooms(neighbor.row, neighbor.col).forEach (function (r) {
                makeReachable(r);
                if (!frontier.includes(r)) {
                    frontier.push(r);
                }
            });

            drawMaze();
            debugger;
        }

        drawMaze();
    }

	function drawMaze() {

		var canvas = document.getElementById("myCanvas");
		var context = canvas.getContext("2d");

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,800,800);

        console.log("frontier size : " + frontier.length);

        context.fillStyle ="#FFFFFF"; // white
		allRooms.forEach(function (room) {

            if (room.open) {
                console.log("drawing " + printRoom(room),
                room.col * roomSize,
                room.row * roomSize,
                roomSize,
                roomSize);

                context.fillRect(
                    room.col * roomSize,
                    room.row * roomSize,
                    roomSize,
                    roomSize);

            }

		});

//        context.fillStyle = "#FF0000";  // red
//        frontier.forEach (function (room) {
//
//            context.fillRect(
//                            room.col * roomSize,
//                            room.row * roomSize,
//                            (room.col * roomSize) + roomSize,
//                            (room.row * roomSize) + roomSize);
//
//            });


	}