import { Visibility } from "./rooms.js";

export const GameState = Object.freeze({
    IDLE: "IDLE",
    SELECTED_PLAYER_ENTITY: "SELECTED_PLAYER_ENTITY",
    PROCESSING_PLAYER_MOVE: "PROCESSING_PLAYER_MOVE"
});


// ----------------------------- LINE - TRANSIENT-----------------------------------

export class TransientLine {

    constructor(source, destination, width, color) {
        this.width = width;
        this.color = color;

        this.sourceCoords = source.getCenterCoordsWithOffset()
        this.destinationCoords = destination.getCenterCoordsWithOffset();

    }

    render(context) {

        var startX = this.sourceCoords.x;
        var startY = this.sourceCoords.y;
        var endX = this.destinationCoords.x;
        var endY = this.destinationCoords.y;

        // console.log(`${startX} ${startY} ${endX} ${endY}`);

        context.beginPath();
        context.strokeStyle = this.color;
        context.globalAlpha = 0.25;
        context.lineWidth = this.width;
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        context.globalAlpha = 1.0;
    }

}

// ----------------------------- ENTITY - TRANSIENT --------------------------------

export class TransientEntitySimple {

    // This entity is a "ghost" that appears under the mouse as a player entity is dragged
    originalEntity = null;

    // x and y coords describe the top-left corner of the image
    x = 0;
    y = 0;
    imageSize = 50;
    color = "#FFFFFF";
    opacity = 1.0;
    vertex = null;

    constructor(originalEntity, opacity) {
        this.originalEntity = originalEntity;
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

        console.log(`player entity moved to vertex: ${this.vertex.x},${this.vertex.y}`);
    }

    getVertex() {
        return this.vertex;
    }

}

// ---------------------------------- ANIMATOR - ENTITY MOVER -------------------------------

export class EntityMovementDriver {

    isComplete = false;
    isDischarged = false;

    deltaX = 1;
    deltaY = 1;

    constructor(entity, vertexSource, vertexDestination, deltaPerTick, onCompletionCallback) {
        this.entity = entity;
        this.vertexSource = vertexSource;
        this.vertexDestination = vertexDestination;
        this.deltaPerTick = deltaPerTick;
        this.onCompletionCallback = onCompletionCallback;


        // TODO: use the getCenterCoordsWithOffset() 

        if (vertexDestination.x < vertexSource.x) {
            this.deltaX = -deltaPerTick;
        } else if (vertexDestination.x > vertexSource.x) {
            this.deltaX = deltaPerTick;
        } else {
            this.deltaX = 0;
        }

        if (vertexDestination.y < vertexSource.y) {
            this.deltaY = -deltaPerTick;
        } else if (vertexDestination.y > vertexSource.y) {
            this.deltaY = deltaPerTick;
        } else {
            this.deltaY = 0;
        }
    }

    update() {

        if (this.isComplete) {
            return
        }

        // TODO: this needs to compute the hypoteneus

        this.entity.x += this.deltaX;
        this.entity.y += this.deltaY;

        if (this.vertexDestination.x == this.vertexSource.x) {
            this.deltaX = 0;
        }

        if (this.vertexDestination.y == this.vertexSource.y) {
            this.deltaY = 0;
        }

        if (this.deltaX == 0 && this.deltaY == 0) {
            this.isComplete = true;
        }

        if (this.isComplete == true && this.isDischarged == false) {
            this.onCompletionCallback();
            this.isDischarged = true;
        }

    }

}