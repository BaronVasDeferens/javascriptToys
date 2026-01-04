import { ImageAsset } from "./assets.js";



export class GridSquare {

    x = 0;
    y = 0;
    tileSize = 64;


    isOccupied = false;
    isObstructed = false;


    constructor(x, y, tileSize, assetManager) {
        this.x = x;
        this.y = y;
        this.size = tileSize;
        this.imageObstructed = assetManager.getImage(ImageAsset.FLOOR_OBSTRUCTION);      // THIS IS WASTEFUL! LOLOL
        this.imageClear = assetManager.getImage(ImageAsset.FLOOR);
    }

    setColor(color) {
        this.color = color;
    }

    containsPoint(x, y) {
        if (x > this.x && x < this.x + this.size) {
            if (y > this.y && y < this.y + this.size) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getCenter() {
        let xCenter = (this.x * this.size) + (this.size / 2);
        let yCenter = (this.y * this.size) + (this.size / 2);
        return { x: xCenter, y: yCenter };
    }

    getOnScreenPos() {
        return {
            x: this.x * this.size,
            y: this.y * this.size,
            size: this.size
        };
    }

    render(context) {
        if (this.isObstructed) {
            context.drawImage(this.imageObstructed, this.x * this.size, this.y * this.size);
        } else {
            context.drawImage(this.imageClear, this.x * this.size, this.y * this.size);
        }
    }
}

/**
 * --------------------------------- GRID MAP ----------------------------------
 */


export class GridMap {

    rows = 5;
    columns = 5;
    soldiers = [];
    blobs = [];
    gridSquares = [];

    constructor(tileSize, canvas, assetManager) {

        this.tileSize = tileSize;
        this.canvas = canvas;
        this.assetManager = assetManager;

        this.cols = Math.floor(canvas.width / tileSize);
        this.rows = Math.floor(canvas.height / tileSize);

        for (let i = 0; i < this.cols; i++) {
            this.gridSquares[i] = new Array(0);
            for (let j = 0; j < this.rows; j++) {
                this.gridSquares[i].push(
                    new GridSquare(i, j, tileSize, assetManager)
                );
            }
        }

        this.allSquares = this.gridSquares.flat(arr => {
            arr.flat();
        }).flat();
    }

    render(context) {
        this.allSquares.forEach(square => {
            square.render(context);
        })
    }

    getGridSquare(col, row) {
        return this.gridSquares.filter((sq) => {
            if (sq.x == col && sq.y == row) {
                return true;
            } else {
                return false;
            }
        })[0];
    }
}