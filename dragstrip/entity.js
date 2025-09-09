import { Visibility } from "./rooms.js";

export const GameState = Object.freeze({
    IDLE: "IDLE",
    SELECTED_PLAYER_ENTITY: "SELECTED_PLAYER_ENTITY",
});




// ------------------------------ ENTITY - SIMPLE ------------------------------

export class EntitySimple {

    // x and y coords describe the top-left corner of the image
    x = 0;
    y = 0;
    imageSize = 50;
    color = this.getRandomColor();

    constructor(x, y, imageSize, color) {

        if (x != null) {
            this.x = x;
        }

        if (y != null) {
            this.y = y;
        }

        if (imageSize != null) {
            this.imageSize = imageSize;
        }

        if (color != null) {
            this.color = color;
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

    render(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.imageSize, this.imageSize);
    }

    containsClick(click) {
        return (click.offsetX >= this.x && click.offsetX <= this.x + this.imageSize) && (click.offsetY >= this.y && click.offsetY <= this.y + this.imageSize);
    }

    setRoom(room) {

        if (this.room != null) {
            this.room.visibility = Visibility.DARK;
        }

        this.room = room;
        if (this.room != null) {
            var centerCoords = this.room.getCenterCoordsWithOffset(this.imageSize);
            this.x = centerCoords.x;
            this.y = centerCoords.y;
        } else {
            this.room = null;
        }

        console.log(`entity location set: ${this.room.x} ${this.room.y}`);
    }

    getRoom() {
        return this.room;
    }

}

// -------------------------------- BEAST ------------------------------

export class Beast {

    x = 0;
    y = 0;
    imageSize = 50;
    color = "#FF0000"

    constructor(x, y, imageSize) {
        this.x = x;
        this.y = y;
        this.imageSize = imageSize;
    }

    random(min, max) {
        return parseInt(Math.random() * max + min);
    };

    setRoom(room) {
        this.room = room;
        console.log(`the beast stalks to ${this.room.x},${this.room.y}...`);
        if (this.room != null) {
            var centerCoords = this.room.getCenterCoordsWithOffset(this.imageSize);
            this.x = centerCoords.x;
            this.y = centerCoords.y;
        }
    }

    move(maze) {
        
        var possibilities = maze.getOpenNeighborsToRoom(this.room).filter ( room => {
            return room.visibility == Visibility.DARK
        });

        if (possibilities.length > 0) {
            var newRoom = possibilities[this.random(0, possibilities.length)];
            this.setRoom(newRoom);
        } else {
            console.log(`MONSTER IS TRAPPED AT (${this.room.x}, ${this.room.y})!`);
        }
    }

    render(context) {

        if (this.room != null) {
            switch (this.room.visibility) {
                case Visibility.DIM:
                case Visibility.BRIGHT:
                    context.fillStyle = this.color;
                    context.fillRect(this.x, this.y, this.imageSize, this.imageSize);
                    break;
                case Visibility.DARK:
                    break;
            }
        }
    }
}