export const Directions = Object.freeze({
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

// ------------------------------ VERTEX ---------------------------------------

export class Vertex {

    x = 0;
    y = 0;
    radius = 1;
    size = 100;
    color = "#2c2c2cff"

    isObstructed = false;

    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        if (size != null) {
            this.size = size;
        }

        if (color != null) {
            this.color = color;
        }
    }

    /**
    * Computes the center point of the room. When an offset is provided, this calculates
    * the upper-left corner point for an entity place at the center
    */
    getCenterCoordsWithOffset(offset) {
        if (offset == null) {
            offset = 0;
        }

        return {
            x: (this.x * this.size) + (this.size / 2) - (offset / 2),
            y: (this.y * this.size) + (this.size / 2) - (offset / 2)
        }
    }

    containsPoint(point) {
        let containsPt = (point.x >= (this.x * this.size)
            && point.x <= (this.x * this.size) + this.size
            && point.y >= (this.y * this.size)
            && point.y <= (this.y * this.size) + this.size);

        return containsPt && this.isObstructed;
    }

    render(context, drawBorder) {
        let offset = 0;
        context.fillStyle = this.color;
        context.beginPath();
        context.ellipse(
            (this.x * this.size) + (this.size / 2) + offset,
            (this.y * this.size) + (this.size / 2),
            this.radius,
            this.radius,
            2 * Math.PI,
            2 * Math.PI,
            false);
        context.fill();

        if (drawBorder == true) {
            context.strokeStyle = this.color;
            context.strokeRect(this.x * this.size, this.y * this.size, this.size, this.size);
        }

    }
}

// ------------------------------ PLACEMENT GRID -----------------------------

export class PlacementGrid {

    vertices = new Array();
    obstacles = new Array();

    constructor(numRows, numCols, roomSize) {

        console.log(`placement grid ${numRows} x ${numCols} @ size ${roomSize}`)

        this.numRows = numRows;
        this.numCols = numCols;
        this.roomSize = roomSize;

        for (var i = 0; i < numCols; i++) {
            for (var j = 0; j < numRows; j++) {
                this.vertices.push(new Vertex(i, j, roomSize))
            }
        }
    }

    resetObstructions() {
        this.vertices.forEach(vtx => {
            vtx.isObstructed = false;
        });

        this.obstacles = new Array();;
    }

    getVertexByArrayPosition(x, y) {
        return this.vertices.filter(vertex => { return (vertex.x == x && vertex.y == y) })[0];
    }

    getVertexAtClick(click) {

        let xClick = click.offsetX;
        let yClick = click.offsetY;

        return this.vertices.filter(vertex => {
            return (xClick >= (vertex.x * vertex.size))
                && (xClick <= (vertex.x * vertex.size) + vertex.size)
                && (yClick >= vertex.y * vertex.size)
                && (yClick <= (vertex.y * vertex.size) + vertex.size)
        })[0];
    }

    getRandomizedVertices() {
        let shuffledVertices = this.vertices.slice();
        this.shuffleArray(shuffledVertices);
        return shuffledVertices;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Given a source and destination vertex and a interval (in pixels), this methods returns
     * a list of (x,y) pairs representing points between the two points, spaced by the interval.
     * Used for computing line of sight.
     */
    getPointsAtInterval(sourceVertex, destinationVertex, interval) {

        let points = [];

        if (interval == null) {
            interval = 1;
        }

        let sourceCoords = sourceVertex.getCenterCoordsWithOffset()
        let destinationCoords = destinationVertex.getCenterCoordsWithOffset();

        let startX = sourceCoords.x;
        let startY = sourceCoords.y;
        let endX = destinationCoords.x;
        let endY = destinationCoords.y;

        let hypoteneus = Math.sqrt(Math.pow((endY - startY), 2) + Math.pow((endX - startX), 2));
        hypoteneus = Math.abs(hypoteneus);

        let rise = endY - startY;           // vertical difference: rise
        let run = endX - startX;           // horizontal difference: run
        let theta = Math.atan(Math.abs(rise) / Math.abs(run));

        let deltaX = Math.cos(theta) * interval;
        if (run < 0 && deltaX > 0) {
            deltaX = deltaX * -1;
        }

        let deltaY = Math.sin(theta) * interval;
        if (rise < 0 && deltaY > 0) {
            deltaY = deltaY * -1;
        }

        for (let i = interval; i < (hypoteneus / interval); i += interval) {

            let point = {
                x: startX + (i * deltaX),
                y: startY + (i * deltaY),
            };

            points.push(
                {
                    x: point.x,
                    y: point.y,
                    isObstructed: this.vertices.some(vtx => {
                        return vtx.containsPoint(point)
                    })
                }
            )
        }

        return points;
    }

    getVerticesForPoints(points) {

        let intersections = new Set();

        points.map(vtx => {
            return {
                x: Math.floor(vtx.x / this.roomSize),
                y: Math.floor(vtx.y / this.roomSize)
            }
        }).forEach(coord => {
            intersections.add(this.getVertexByArrayPosition(coord.x, coord.y));
        });

        return intersections;
    }

    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }

    /**
     * Shifts the map's obstacles in the specified direction by a number of vertices (shiftBy).
     * New obstacles will be computed for the newly-generated vertices.
     */
    shiftObstacles(direction, shiftBy, numObstacles) {

        let deltaX = 0;
        let deltaY = 0;

        switch (direction) {
            case Directions.DOWN:
                deltaY = 1 * shiftBy;
                break;
            case Directions.UP:
                deltaY = -1 * shiftBy;
                break;
            case Directions.LEFT:
                deltaX = -1 * shiftBy;
                break;
            case Directions.RIGHT:
                deltaX = 1 * shiftBy;
                break;
        }

        // Shift obstacles
        let cullTheseObstacles = [];
        this.obstacles.forEach(obs => {
            let currentVertex = obs.vertex;
            let newVertex = this.getVertexByArrayPosition(
                currentVertex.x + deltaX,
                currentVertex.y + deltaY
            );

            obs.setVertex(newVertex);

            if (newVertex == null) {
                cullTheseObstacles.push(obs);
            }
        });

        cullTheseObstacles.forEach( obs => {
            let index = this.obstacles.indexOf(obs);
            this.obstacles.splice(index, 1);
        });
    }

    /**
     * Given a list of entites, this returns a list of (entity, obstacle) pairs that co-occupy
     * the same vertex
     */
    entityObstacleCollision(entities) {

    }

    render(context, drawBorder) {
        this.vertices.forEach(vtx => {
            vtx.render(context, drawBorder);
        });

        this.obstacles.forEach( obs => {
            obs.render(context)
        });
    }
}


// ------------------------------- OBSTACLE -----------------------------

export class ObstacleSimple {

    constructor(vertex, size, color) {
        this.vertex = vertex;
        this.size = size;
        this.color = color;

        this.vertex.isObstructed = true;
    }

    setVertex(vertex) {
        this.vertex.isObstructed = false;
        if (vertex != null) {
            this.vertex = vertex;
            this.vertex.isObstructed = true;
        }

    }

    render(context) {
        context.fillStyle = this.color;
        context.fillRect(this.vertex.x * this.vertex.size, this.vertex.y * this.vertex.size, this.size, this.size);
    }

}


// ------------------------------- BORDER -------------------------------

export class Border {

    constructor(xStart, yStart, width, height) {

        this.xStart = xStart;
        this.yStart = yStart;
        this.width = width;
        this.height = height;

        this.xEnd = this.xStart + width;
        this.yEnd = this.yStart + height;
    }

    render(context) {
        context.fillStyle = "#5c5c5c";
        context.fillRect(this.xStart, this.yStart, this.width, this.height);
    }
}

export const Visibility = Object.freeze({
    DARK: "#000000",
    DIM: "#383737",
    BRIGHT: "#ffffff"
});

// --------------------------------- ROOM -------------------------------

export class Room {

    x = 0;
    y = 0;
    size = 50;
    visibility = Visibility.DARK;
    color = this.visibility;

    borders = new Array();

    upOpen = false;
    downOpen = false;
    leftOpen = false;
    rightOpen = false;

    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.wallWidth = this.size * 0.02;
    }

    isOpen() {
        return (this.upOpen || this.downOpen || this.leftOpen || this.rightOpen);
    }

    isBorderCollision(click) {
        return this.borders.some(border => {
            return click.offsetX >= border.xStart && click.offsetX <= border.xEnd && click.offsetY >= border.yStart && click.offsetY <= border.yEnd
        })
    }

    /**
     * Computes the center point of the room. When an offset is provided, this calculates the upper-left corner point for an entity place at the center
     */
    getCenterCoordsWithOffset(offset) {

        if (offset == null) {
            offset = 0;
        }

        return {
            x: (this.x * this.size) + (this.size / 2) - (offset / 2),
            y: (this.y * this.size) + (this.size / 2) - (offset / 2)
        }
    }

    render(context) {
        this.renderRoom(context);
        this.renderBorders(context);
    }

    renderRoom(context) {
        // Draw the base color
        context.fillStyle = this.visibility;
        context.fillRect(this.x * this.size, this.y * this.size, this.size, this.size);
    }

    renderBorders(context) {
        // Draw the borders
        this.borders.forEach(border => {
            border.render(context);
        });
    }

    openDirection(direction) {

        switch (direction) {
            case Directions.UP:
                this.upOpen = true;
                break;
            case Directions.DOWN:
                this.downOpen = true;
                break;
            case Directions.LEFT:
                this.leftOpen = true;
                break;
            case Directions.RIGHT:
                this.rightOpen = true;
                break;
        }
    }

    closeDirection(direction) {

        switch (direction) {
            case Directions.UP:
                this.upOpen = false;
                break;
            case Directions.DOWN:
                this.downOpen = false;
                break;
            case Directions.LEFT:
                this.leftOpen = false;
                break;
            case Directions.RIGHT:
                this.rightOpen = false;
                break;
        }

        this.computeBorders();
    }

    computeBorders() {

        this.borders = new Array();

        if (this.upOpen) {
            this.borders.push(new Border(this.x * this.size, this.y * this.size, this.size / 3, this.wallWidth));
            this.borders.push(new Border((this.x * this.size) + (2 / 3 * this.size), this.y * this.size, this.size / 3, this.wallWidth));
        } else {
            this.borders.push(new Border(this.x * this.size, this.y * this.size, this.size, this.wallWidth));
        }

        if (this.rightOpen) {
            this.borders.push(new Border((this.x * this.size) + this.size - this.wallWidth, (this.y * this.size), this.wallWidth, this.size / 3));
            this.borders.push(new Border((this.x * this.size) + this.size - this.wallWidth, (this.y * this.size) + ((2 / 3) * this.size), this.wallWidth, this.size / 3));
        } else {
            this.borders.push(new Border((this.x * this.size) + this.size - this.wallWidth, (this.y * this.size), this.wallWidth, this.size));
        }

        if (this.downOpen) {
            this.borders.push(new Border(this.x * this.size, (this.y * this.size) + this.size - this.wallWidth, this.size / 3, this.wallWidth));
            this.borders.push(new Border((this.x * this.size) + (2 / 3 * this.size), (this.y * this.size) + this.size - this.wallWidth, this.size / 3, this.wallWidth));
        } else {
            this.borders.push(new Border(this.x * this.size, (this.y * this.size) + this.size - this.wallWidth, this.size, this.wallWidth));
        }

        if (this.leftOpen) {
            this.borders.push(new Border((this.x * this.size), this.y * this.size, this.wallWidth, this.size / 3));
            this.borders.push(new Border((this.x * this.size), (this.y * this.size) + (2 / 3 * this.size), this.wallWidth, this.size / 3));
        } else {
            this.borders.push(new Border((this.x * this.size), this.y * this.size, this.wallWidth, this.size));
        }
    }

    getRandomColor() {

        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
// ---------------------------- MAZE ----------------------------

export class Maze {

    rooms = new Array();

    constructor(numRows, numCols, roomSize) {

        this.numRows = numRows;
        this.numCols = numCols;
        this.roomSize = roomSize;

        for (var i = 0; i < numCols; i++) {
            for (var j = 0; j < numRows; j++) {
                var room = new Room(i, j, roomSize);
                this.rooms.push(room)
            }
        }
    }

    computeBorders() {

        this.rooms.forEach(room => {
            room.computeBorders();
        });
    }

    render(context) {

        this.rooms.forEach(room => {
            room.renderRoom(context);
        });


        this.rooms.forEach(room => {
            room.renderBorders(context);
        });
    }

    getRoomByArrayPosition(x, y) {
        return this.rooms.filter(room => { return (room.x == x && room.y == y) })[0];
    }

    computeVisibility(playerEntities) {

        this.rooms.forEach(room => {
            room.visibility = Visibility.DARK;
        });

        playerEntities.forEach(player => {
            var playerRoom = player.getRoom();
            playerRoom.visibility = Visibility.BRIGHT;
            this.getOpenNeighborsToRoom(playerRoom).forEach(neighbor => {
                if (neighbor.visibility == Visibility.DARK) {
                    neighbor.visibility = Visibility.DIM;
                } else if (neighbor.visibility == Visibility.DIM) {
                    neighbor.visibility = Visibility.BRIGHT;
                }
            })
        })
    }

    getOpenNeighborsToRoom(room) {

        var neighbors = new Array();
        if (room.upOpen) {
            neighbors.push(this.getRoomByArrayPosition(room.x, room.y - 1));
        }

        if (room.downOpen) {
            neighbors.push(this.getRoomByArrayPosition(room.x, room.y + 1));
        }

        if (room.leftOpen) {
            neighbors.push(this.getRoomByArrayPosition(room.x - 1, room.y));
        }

        if (room.rightOpen) {
            neighbors.push(this.getRoomByArrayPosition(room.x + 1, room.y));
        }

        return neighbors;
    }

    getAdjacentRooms(room) {
        var neighbors = new Array();
        neighbors.push(this.getRoomByArrayPosition(room.x, room.y - 1));
        neighbors.push(this.getRoomByArrayPosition(room.x, room.y + 1));
        neighbors.push(this.getRoomByArrayPosition(room.x - 1, room.y));
        neighbors.push(this.getRoomByArrayPosition(room.x + 1, room.y));
        return neighbors.filter(neighbor => {
            return neighbor != null
        });
    }

    getAdjacentRoomsWithDirection(room) {
        var neighbors = new Array();
        neighbors.push(
            {
                room: this.getRoomByArrayPosition(room.x, room.y - 1),
                direction: Directions.UP
            });

        neighbors.push(
            {
                room: this.getRoomByArrayPosition(room.x, room.y + 1),
                direction: Directions.DOWN
            });

        neighbors.push(
            {
                room: this.getRoomByArrayPosition(room.x - 1, room.y),
                direction: Directions.LEFT
            });

        neighbors.push(
            {
                room: this.getRoomByArrayPosition(room.x + 1, room.y),
                direction: Directions.RIGHT
            });

        return neighbors.filter(neighbor => {
            return neighbor.room != null
        });
    }

    getRoomAtClick(click) {

        var xClick = click.offsetX;
        var yClick = click.offsetY;

        return this.rooms.filter(room => {
            return (xClick >= (room.x * room.size))
                && (xClick <= (room.x * room.size) + room.size)
                && (yClick >= room.y * room.size)
                && (yClick <= (room.y * room.size) + room.size)
        })[0];
    }

    openNeighboringRooms(x, y, dir) {

        var targetRoom = this.getRoomByArrayPosition(x, y);

        if (targetRoom != null) {

            this.openRoomSingle(targetRoom, dir);

            // Find the neighbor and open it
            var neighborRoom;

            switch (dir) {
                case Directions.UP:
                    neighborRoom = this.getRoomByArrayPosition(x, y - 1);
                    this.openRoomSingle(neighborRoom, Directions.DOWN);
                    break;
                case Directions.DOWN:
                    neighborRoom = this.getRoomByArrayPosition(x, y + 1);
                    this.openRoomSingle(neighborRoom, Directions.UP);
                    break;
                case Directions.LEFT:
                    neighborRoom = this.getRoomByArrayPosition(x - 1, y);
                    this.openRoomSingle(neighborRoom, Directions.RIGHT);
                    break;
                case Directions.RIGHT:
                    neighborRoom = this.getRoomByArrayPosition(x + 1, y);
                    this.openRoomSingle(neighborRoom, Directions.LEFT);
                    break;
            }

        } else {
            console.log(`ERROR : openNeighboringRooms : room ${x} ${y} not found!`)
        }
    }

    closeNeighboringRooms(x, y, dir) {

        var targetRoom = this.getRoomByArrayPosition(x, y);

        if (targetRoom != null) {

            targetRoom.closeDirection(dir)

            // Find the neighbor
            var neighborRoom;

            switch (dir) {
                case Directions.UP:
                    neighborRoom = this.getRoomByArrayPosition(x, y - 1);
                    neighborRoom.closeDirection(Directions.DOWN);
                    break;
                case Directions.DOWN:
                    neighborRoom = this.getRoomByArrayPosition(x, y + 1);
                    neighborRoom.closeDirection(Directions.UP);
                    break;
                case Directions.LEFT:
                    neighborRoom = this.getRoomByArrayPosition(x - 1, y);
                    neighborRoom.closeDirection(Directions.RIGHT);
                    break;
                case Directions.RIGHT:
                    neighborRoom = this.getRoomByArrayPosition(x + 1, y);
                    neighborRoom.closeDirection(Directions.LEFT);
                    break;
            }

        } else {
            console.log(`ERROR : openNeighboringRooms : room ${x} ${y} not found!`)
        }


    }

    openRoomSingle(targetRoom, dir) {

        if (targetRoom == null) {
            console.log(`ERROR: openRoomSingle : targetRoom not found!`);
            return;
        }

        targetRoom.openDirection(dir);
    }
}