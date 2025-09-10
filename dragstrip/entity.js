import { Visibility } from "./rooms.js";

export const GameState = Object.freeze({
    IDLE: "IDLE",
    SELECTED_PLAYER_ENTITY: "SELECTED_PLAYER_ENTITY",
});


// ----------------------------- ENTITY - TRANSIENT --------------------------------

export class TransientEntitySimple {

    // x and y coords describe the top-left corner of the image
    x = 0;
    y = 0;
    imageSize = 50;
    color = "#FFFFFF";
    opacity = 1.0;
    vertex = null;

    constructor(originalEntity, opacity) {
        this.x = originalEntity.x;
        this.y = originalEntity.y;
        this.imageSize = originalEntity.imageSize;
        this.color = originalEntity.color;
        this.vertex = originalEntity.vertex;
        this.opacity = opacity;
    }

    setVertex(vertex) {
        this.vertex = vertex;
        if (this.vertex != null) {
            var centerCoords = this.vertex.getCenterCoordsWithOffset(this.imageSize);
            this.x = centerCoords.x;
            this.y = centerCoords.y;
        } else {
            this.vertex = null;
        }
    }

    render(context) {
        context.fillStyle = this.color;
        context.globalAlpha = this.opacity;
        context.fillRect(this.x, this.y, this.imageSize, this.imageSize);
        context.globalAlpha = 1.0;
    }
}


// ------------------------------ ENTITY - SIMPLE ------------------------------

export class EntitySimple {

    // x and y coords describe the top-left corner of the image
    x = 0;
    y = 0;
    imageSize = 50;
    color = this.getRandomColor();
    vertex = null;

    constructor(x, y, imageSize, color) {
        this.x = x;
        this.y = y;
        this.imageSize = imageSize;
        this.color = color;
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

    setVertex(vertex) {
        this.vertex = vertex;
        if (this.vertex != null) {
            var centerCoords = this.vertex.getCenterCoordsWithOffset(this.imageSize);
            this.x = centerCoords.x;
            this.y = centerCoords.y;
        } else {
            this.vertex = null;
        }
    }

    getVertex() {
        return this.vertex;
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

        var possibilities = maze.getOpenNeighborsToRoom(this.room).filter(room => {
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