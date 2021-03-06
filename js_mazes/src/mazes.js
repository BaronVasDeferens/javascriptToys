    const mazeRowsCols = 5;
	const roomSize = 160;

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

    function printRoom(room) {
        return "(" + room.row + "," + room.col + ")";
    }

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

    // Examines diagonals to prevent four square opening
    function ableToOpen(room) {

        var up = getRoom(room.row - 1, room.col);
        var down = getRoom(room.row + 1, room.col);
        var left = getRoom(room.row, room.col -1);
        var right = getRoom(room.row, room.col + 1);

        // Upper left
        var diag = getRoom(room.row-1, room.col-1);

        if (diag !== undefined) {
            // both up and left are defined if upperLeft is!
            if (diag.open && up.open && left.open) { return false; }
        }

        // Upper right
        diag = getRoom(room.row-1, room.col+1);
            if (diag !== undefined) {
                if (diag.open && up.open && right.open) { return false; }
        }

        // lower left
        diag = getRoom(room.row+1, room.col-1);
        if (diag !== undefined) {
            if (diag.open && down.open && left.open) { return false; }
        }

        // lower right
        diag = getRoom(room.row+1, room.col+1);
            if (diag !== undefined) {
                if (diag.open && down.open && right.open) { return false; }
        }

        return true;
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

        while (reachable.length != allRooms.length) {

            frontier = shuffleArray(frontier);

            var newRoom = frontier.pop();
            console.log("considering " + printRoom(newRoom));

            // Disqualify any room whose neighbors are all already reachable
            if (getAdjacentRooms(newRoom.row, newRoom.col).every(function (r) {
                 if (reachable.includes(r)) {
                    return true;
                }

            })) {
                  console.log("\tall neighbors reachable...");
                  if(!reachable.includes(newRoom)) {
                        reachable.push(newRoom);
                   }
                    continue;
                }

            // Disqualify any room whose diagonal is already open
            if (ableToOpen(newRoom)) {
                console.log("\topening " + printRoom(newRoom) + "...");
                newRoom.open = true;
            }
            else {
                console.log("\tclosing " + printRoom(newRoom) + "...");
            }


            getAdjacentRooms(newRoom.row, newRoom.col).forEach( function (r) {

                if (!inMaze.includes(newRoom)) {

                    if (!frontier.includes(r)) {
                        frontier.push(r);
                    }

                    if(!reachable.includes(r)) {
                        reachable.push(r);
                    }
                }
            });

            if (! inMaze.includes(newRoom)) {
                inMaze.push(newRoom);
            }
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