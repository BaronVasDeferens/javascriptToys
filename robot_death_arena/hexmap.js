import { Hex } from "./hex.js";

export class HexMap {

    hexSize = 50;
    zoomFactor = 4;

    isDebug = false;

    map = [];
    allHexes = [];

    constructor(rows, cols, hexSize, canvas) {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = hexSize;
        this.boundingRectangle = canvas.getBoundingClientRect();
        this.initialize();
    }

    initialize() {
        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.map[i] = new Array(this.rows);
            for (var j = 0; j < this.cols; j++) {
                this.map[i][j] = new Hex(i, j, this.hexSize);
            }
        }
        this.allHexes = this.map.flat();
    }

    getHex(row, col) {
        return this.map[row][col];
    }

    render(context) {
        this.allHexes.forEach(hex => {
            hex.render(context)
        });
    }

    toggleDebug() {
        this.isDebug = !this.isDebug;
        this.allHexes.forEach( hex => {
            hex.toggleDebug();
        })
    }

    increaseSize() {
        this.hexSize += this.zoomFactor;
        this.allHexes.forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    decreaseSize() {
        this.hexSize -= this.zoomFactor;
        this.allHexes.forEach(hex => {
            hex.setSize(this.hexSize);
        });
    }

    findHexAtClick(click) {

        let clickX = click.offsetX;
        let clickY = click.offsetY;

        let candidateHex = null;
        let priorDist = 1000000; 

        // INEFFICIENT! We check EVERY hex in the map!!!! 
        // TODO: find approximate row/col values FIRST
        for (let i = 0; i < this.rows; i++) {

            for (let j = 0; j < this.cols; j++) {

                let hex = this.map[i][j];
                let distance = Math.sqrt(Math.pow(clickY - hex.center.y, 2) + Math.pow(clickX - hex.center.x, 2));

                if (distance < priorDist) {
                    candidateHex = hex
                    priorDist = distance;
                }
            }
        }

        return candidateHex;
    }

}