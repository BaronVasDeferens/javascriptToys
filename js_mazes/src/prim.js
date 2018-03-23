    const mazeRowsCols = 10;
	const canvasSize = 400
	const roomSize = canvasSize / mazeRowsCols;


	var mazeArray = new Array(mazeRowsCols);
	var allRooms = new Array();
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

        createMaze();
        drawMaze();

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

        // Define the "start room" and adjacent rooms...
        var startRoom = getRandomRoom();

        console.log("START " + startRoom.display());
        startRoom.open = true;
        inMaze.push(startRoom);
    }

	function drawMaze() {

		var canvas = document.getElementById("myCanvas");
		var context = canvas.getContext("2d");

        context.fillStyle = "#000000"; // black
        context.fillRect(0,0,canvasSize,canvasSize);

        context.fillStyle ="#FFFFFF"; // white
		allRooms.forEach(function (room) {

            if (room.open) {

                context.fillRect(
                    room.col * roomSize,
                    room.row * roomSize,
                    roomSize,
                    roomSize);

            }

		});

	}