import { Visibility } from "./rooms.js";

export const GameState = Object.freeze({
    IDLE: "IDLE",
    SELECTED_PLAYER_ENTITY: "SELECTED_PLAYER_ENTITY",
});

/**
 * A simple colored square
 */
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
    }

    getRoom() {
        return this.room;
    }

}