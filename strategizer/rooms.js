export const Directions = Object.freeze({
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

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
        context.fillStyle = "#5c5c5c"
        context.fillRect(this.xStart, this.yStart, this.width, this.height);
    }
}

export const Visibility = Object.freeze({
    DARK: "#000000",
    DIM: "#383737",
    BRIGHT: "#ffffff"
});

export class Room {

    x = 0;
    y = 0;
    size = 50;
    visibility = Visibility.DARK;

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

        // Draw the base color
        context.fillStyle = this.visibility;
        context.fillRect(this.x * this.size, this.y * this.size, this.size, this.size);

        // Draw the borders
        this.borders.forEach(border => {
            border.render(context);
        });
    }

    computeBorders() {

        // TODO: clear existing borders?

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

        context.fillStyle = this.color;
        context.fillRect(0, 0, this.numRows * this.roomSize, this.numCols * this.roomSize);
        this.rooms.forEach(room => {
            room.render(context);
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
            this.getOpenNeighborsToRoom(playerRoom).forEach( neighbor => {
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

    openRoomSingle(targetRoom, dir) {

        if (targetRoom == null) {
            console.log(`ERROR: openRoomSingle : targetRoom not found!`);
            return;
        }

        console.log(`opening room ${targetRoom.x} ${targetRoom.y} -> ${dir}`);

        switch (dir) {
            case Directions.UP:
                targetRoom.upOpen = true;
                break;
            case Directions.DOWN:
                targetRoom.downOpen = true;
                break;
            case Directions.LEFT:
                targetRoom.leftOpen = true;
                break;
            case Directions.RIGHT:
                targetRoom.rightOpen = true;
                break;
        }
    }
}