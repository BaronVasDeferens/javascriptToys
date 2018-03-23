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
        mazeArea.innerHTML = "<canvas id=\"myCanvas\" width=\"800\" height=\"800\"></canvas>"

		for (var i = 0; i < mazeRowsCols; i++) {

			mazeArray[i] = new Array(mazeRowsCols);

			for (var j = 0; j < mazeRowsCols; j++) {

				var room = Object.create(
                  {	row: i,
                  	col: j,
                  	open: false
                  });

				allRooms.push(room);
				mazeArray[i][j] = room;
			}
		}

        createMaze();

	}();

    function getRandomRoom() {
        var index = Math.floor(Math.random() * 1000 % (mazeRowsCols * mazeRowsCols));
        return allRooms[index]
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

    //
    function areDiagonalsOpen(room) {

        var diag = getRoom(room.row-1, room.col-1);

        if (diag !== undefined) {
            if (diag.open) { return true; }
        }

        diag = getRoom(room.row-1, room.col+1);
            if (diag !== undefined) {
                if (diag.open) { return true; }
        }

        diag = getRoom(room.row+1, room.col-1);
        if (diag !== undefined) {
            if (diag.open) { return true; }
        }

        diag = getRoom(room.row+1, room.col+1);
            if (diag !== undefined) {
                if (diag.open) { return true; }
        }

        return false;
    }

    function createMaze() {

        // Define the "start room" and adjacent rooms...
        var startRoom = getRandomRoom();
        console.log("START " + startRoom.row + "," + startRoom.col);
        startRoom.open = true;
        inMaze.push(startRoom);
        reachable.push(startRoom);

        var adjacentRooms = getAdjacentRooms(startRoom.row, startRoom.col);
        adjacentRooms.forEach( function(r) {
            frontier.push(r);
            reachable.push(r);
        });

        drawMaze();
        debugger;

        while (reachable.length != allRooms.length) {

            frontier = shuffleArray(frontier);

            var newRoom = frontier.pop();

            // Disqualify any room whose neighbors are all already reachable

//            if (getAdjacentRooms(newRoom.row, newRoom.col).length == 0)
//                continue;

            if (getAdjacentRooms(newRoom.row, newRoom.col).every(function (r) {
                if (reachable.includes(r)) {
                    return true;
                }

            })) { continue; }


            if (! inMaze.includes(newRoom)) {

                // Disqualify any room whose diagonal is already open
//                if (areDiagonalsOpen(newRoom)) {
//                    console.log("skipping " + newRoom.row + "," + newRoom.col);
//                    continue;
//                }

                newRoom.open = true;
                inMaze.push(newRoom);

                getAdjacentRooms(newRoom.row, newRoom.col).forEach( function (r) {
                    if (!frontier.includes(r)) {
                        frontier.push(r);

                        if(!reachable.includes(r)) {
                            reachable.push(r);
                        }
                    }
                });

            }

//            console.log("frontier size = " + frontier.length);
        }

        drawMaze();
    }

	function drawMaze() {

		var canvas = document.getElementById("myCanvas");
		var context = canvas.getContext("2d");

		allRooms.forEach(function (room) {

            if (room.open) {
                context.fillStyle ="#FFFFFF";

            } else {
                context.fillStyle = "#000000";
            }

            context.fillRect(
                room.col * roomSize,
                room.row * roomSize,
                roomSize,
                roomSize);
		});
	}