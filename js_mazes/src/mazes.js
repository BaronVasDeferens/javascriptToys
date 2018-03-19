    const mazeRowsCols = 20;
	const roomSize = 10;

	var mazeArray = new Array(mazeRowsCols);
	var allRooms = new Array();

	// Setup (IFFE function)
	// Insert a drawable canvas element into the page
	// TODO: parameterize the canvas size
	var setup = function() {

        var mazeArea = document.getElementById('mazeArea');
        mazeArea.innerHTML = "<canvas id=\"myCanvas\" width=\"200\" height=\"200\"></canvas>"

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
		drawMaze();



	}();

    function getRandomRoom() {
        var index = Math.floor(Math.random() * 1000 % (mazeRowsCols * mazeRowsCols));
        return allRooms[index]
    }

    function getRoom(row, col) {
        try {
            return mazeArray[row][col];
        } catch (e) {
        console.log("room " + row + "," + col + " doesn't exist");
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

    function createMaze() {

        // Define the "start room"
        var startRoom = getRandomRoom();
        console.log("START " + startRoom.row + "," + startRoom.col);
        startRoom.open = true;

        var frontier = new Array();

        var adjacentRooms = getAdjacentRooms(startRoom.row, startRoom.col);
        adjacentRooms.forEach( function(r) {
            r.open = true;
        });

    }

	function drawMaze() {

		var canvas = document.getElementById("myCanvas");
		var context = canvas.getContext("2d");

		allRooms.forEach(function (room) {

            if (room.open) {
                context.fillStyle ="#FFFFFF";

                console.log(room.col * roomSize,
                            room.row * roomSize,
                            (room.col * roomSize) + roomSize,
                            (room.row * roomSize) + roomSize)

            } else {
                context.fillStyle = "#000000";
            }

            context.fillRect(
                room.col * roomSize,
                room.row * roomSize,
                (room.col * roomSize) + roomSize,
                (room.row * roomSize) + roomSize);
		});
	}